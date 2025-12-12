import React, { useEffect, useRef, useState, memo } from 'react';
import { Mic, MicOff, Video, VideoOff, Power, Activity } from 'lucide-react';
import { LiveServerMessage, Modality } from '@google/genai';
import { getLiveClient } from '../services/geminiService';

// Audio Context Helper
const audioContextRef = {
    input: null as AudioContext | null,
    output: null as AudioContext | null,
};

function getAudioContexts() {
    if (!audioContextRef.input) {
        audioContextRef.input = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
    if (!audioContextRef.output) {
        audioContextRef.output = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return { input: audioContextRef.input, output: audioContextRef.output };
}

// Helper to encode PCM data to base64
function base64EncodeAudio(float32Array: Float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        int16Array[i] = Math.max(-32768, Math.min(32767, float32Array[i] * 32768));
    }
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
}

// Helper to decode base64 to audio buffer
async function decodeAudioData(
    base64String: string,
    ctx: AudioContext
): Promise<AudioBuffer> {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const int16Data = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
        float32Data[i] = int16Data[i] / 32768.0;
    }
    
    const buffer = ctx.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);
    return buffer;
}


const LiveScientist: React.FC = () => {
    const [isActive, setIsActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [volumeLevel, setVolumeLevel] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sessionRef = useRef<any>(null); // To store the session object
    const streamRef = useRef<MediaStream | null>(null);
    const audioWorkletNodeRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const connect = async () => {
        try {
            setStatus('connecting');
            const { input, output } = getAudioContexts();
            const ai = getLiveClient();

            // Setup Camera and Mic
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            streamRef.current = stream;
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }

            // Connect to Gemini Live
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('connected');
                        setIsActive(true);

                        // Start Audio Input Stream
                        const source = input.createMediaStreamSource(stream);
                        // Using ScriptProcessor as simple workaround for AudioWorklet complexity in single file
                        const processor = input.createScriptProcessor(4096, 1, 1);
                        audioWorkletNodeRef.current = processor;

                        processor.onaudioprocess = (e) => {
                            if (isMuted) return;
                            const inputData = e.inputBuffer.getChannelData(0);
                            
                            // Visualizer math
                            let sum = 0;
                            for (let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                            const rms = Math.sqrt(sum / inputData.length);
                            setVolumeLevel(Math.min(rms * 5, 1)); // Amplify for visual

                            const base64Audio = base64EncodeAudio(inputData);
                            
                            sessionPromise.then(session => {
                                session.sendRealtimeInput({
                                    media: {
                                        mimeType: 'audio/pcm;rate=16000',
                                        data: base64Audio
                                    }
                                });
                            });
                        };

                        source.connect(processor);
                        processor.connect(input.destination);

                        // Start Video Frame Stream (1 FPS for bandwidth save, higher for fluency)
                        const frameInterval = setInterval(() => {
                           if (canvasRef.current && videoRef.current) {
                               const ctx = canvasRef.current.getContext('2d');
                               if (ctx) {
                                   canvasRef.current.width = videoRef.current.videoWidth;
                                   canvasRef.current.height = videoRef.current.videoHeight;
                                   ctx.drawImage(videoRef.current, 0, 0);
                                   const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
                                   
                                   sessionPromise.then(session => {
                                       session.sendRealtimeInput({
                                           media: {
                                               mimeType: 'image/jpeg',
                                               data: base64Image
                                           }
                                       });
                                   });
                               }
                           }
                        }, 1000); // 1 FPS video analysis
                        
                        // Cleanup interval on close
                        (sessionPromise as any)._frameInterval = frameInterval;
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                         const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                         if (audioData) {
                             const buffer = await decodeAudioData(audioData, output);
                             const source = output.createBufferSource();
                             source.buffer = buffer;
                             source.connect(output.destination);
                             
                             const now = output.currentTime;
                             // Ensure we schedule seamlessly
                             const startTime = Math.max(now, nextStartTimeRef.current);
                             source.start(startTime);
                             nextStartTimeRef.current = startTime + buffer.duration;
                             
                             sourcesRef.current.add(source);
                             source.onended = () => sourcesRef.current.delete(source);
                         }
                    },
                    onclose: () => {
                        setStatus('disconnected');
                        setIsActive(false);
                    },
                    onerror: (e) => {
                        console.error(e);
                        setStatus('error');
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: "You are an advanced AI Scientist. You are seeing the user's camera and hearing them. Answer scientific questions, analyze what you see in the lab or on paper, and be helpful, precise, and concise. Adopt a professional but curious persona.",
                    speechConfig: {
                         voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                    }
                }
            });

            sessionRef.current = sessionPromise;

        } catch (err) {
            console.error("Connection failed", err);
            setStatus('error');
        }
    };

    const disconnect = async () => {
        if (sessionRef.current) {
            const session = await sessionRef.current;
            // Clear video interval
            if ((sessionRef.current as any)._frameInterval) clearInterval((sessionRef.current as any)._frameInterval);
            // session.close() is not explicitly in snippets but assumed standard cleanup or just drop connection
        }
        
        if (audioWorkletNodeRef.current) {
            audioWorkletNodeRef.current.disconnect();
        }
        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Stop playing audio
        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;

        setIsActive(false);
        setStatus('disconnected');
    };

    return (
        <div className="flex flex-col h-full bg-black/40 rounded-3xl overflow-hidden border border-slate-800 relative">
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 {!isActive && (
                     <div className="text-center z-10 p-8 bg-slate-900/90 rounded-2xl border border-slate-700 backdrop-blur-md">
                         <div className="bg-cyan-500/10 p-4 rounded-full inline-block mb-4">
                             <Activity className="w-12 h-12 text-cyan-400" />
                         </div>
                         <h2 className="text-2xl font-bold text-white mb-2">Live Scientist Mode</h2>
                         <p className="text-slate-400 mb-6 max-w-xs mx-auto">
                             Real-time multimodal observation and voice interaction. Allow camera and mic access to begin.
                         </p>
                         <button 
                            onClick={connect}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-full transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] pointer-events-auto"
                         >
                             Start Session
                         </button>
                     </div>
                 )}
             </div>

             {/* Video Feed */}
             <div className="flex-1 relative bg-black">
                 <video 
                    ref={videoRef} 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-20'}`}
                    muted 
                    playsInline 
                 />
                 <canvas ref={canvasRef} className="hidden" />
                 
                 {/* Status Overlay */}
                 {isActive && (
                     <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur rounded-full px-3 py-1.5 border border-white/10">
                         <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                         <span className="text-xs font-mono text-white/80 uppercase">
                             {status === 'connected' ? 'Live Feed' : status}
                         </span>
                     </div>
                 )}
             </div>

             {/* Controls Bar */}
             <div className="h-24 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-8 z-20">
                 <div className="flex items-center gap-4">
                     <div className="flex flex-col">
                         <span className="text-xs text-slate-500 font-mono uppercase">Audio Level</span>
                         <div className="flex gap-0.5 items-end h-8 mt-1">
                             {[...Array(5)].map((_, i) => (
                                 <div 
                                    key={i} 
                                    className={`w-1.5 rounded-t-sm transition-all duration-75 ${i < volumeLevel * 5 ? 'bg-cyan-400' : 'bg-slate-700'}`}
                                    style={{ height: `${Math.max(20, (i + 1) * 20)}%` }}
                                 />
                             ))}
                         </div>
                     </div>
                 </div>

                 <div className="flex items-center gap-4">
                     <button 
                        onClick={() => setIsMuted(!isMuted)}
                        disabled={!isActive}
                        className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'}`}
                     >
                         {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                     </button>
                     
                     <button 
                        onClick={disconnect}
                        disabled={!isActive}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 transition-all border border-red-400"
                     >
                         <Power className="w-6 h-6" />
                     </button>
                 </div>

                 <div className="w-24 text-right">
                      <span className="text-[10px] text-slate-500 font-mono">GEMINI<br/>VISION</span>
                 </div>
             </div>
        </div>
    );
};

export default memo(LiveScientist);
