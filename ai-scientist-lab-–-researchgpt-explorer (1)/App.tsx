import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import InputArea from './components/InputArea';
import ResponseDisplay from './components/ResponseDisplay';
import LiveScientist from './components/LiveScientist';
import { ToolType, GenerationState, ChatMessage } from './types';
import { TOOLS } from './constants';
import { generateScientificContent, Attachment } from './services/geminiService';
import { Sparkles, ArrowRight, Bot, User } from 'lucide-react';
import { Content } from '@google/genai';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.DASHBOARD);
  
  // State for single-turn tools
  const [generation, setGeneration] = useState<GenerationState>({
    isLoading: false,
    error: null,
    result: null,
  });

  // State for chat-based tools (Research Chat)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Clear states when switching tools
  useEffect(() => {
    setGeneration({ isLoading: false, error: null, result: null });
    setChatHistory([]);
    setIsChatLoading(false);
  }, [activeTool]);

  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [chatHistory, generation.result]);


  const handleSend = async (text: string, files: File[]) => {
    if (activeTool === ToolType.DASHBOARD || activeTool === ToolType.LIVE_SCIENTIST) return;
    
    const toolConfig = TOOLS[activeTool];
    const isChatMode = toolConfig.isChat;

    // Loading state update
    if (isChatMode) {
        setIsChatLoading(true);
    } else {
        setGeneration({ isLoading: true, error: null, result: null });
    }

    try {
      // Process files to base64
      const attachments: Attachment[] = await Promise.all(files.map(async (file) => {
        return new Promise<Attachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve({ base64, mimeType: file.type });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
      }));

      // For Chat Mode, update UI immediately with user message
      if (isChatMode) {
          const newUserMsg: ChatMessage = {
              id: Date.now().toString(),
              role: 'user',
              content: text,
              timestamp: Date.now(),
              attachments: files.map(f => ({
                  type: 'file', 
                  url: URL.createObjectURL(f), 
                  mimeType: f.type
              }))
          };
          setChatHistory(prev => [...prev, newUserMsg]);
      }

      // Prepare History for API (only for chat tools)
      let apiHistory: Content[] = [];
      if (isChatMode) {
          apiHistory = chatHistory.map(msg => ({
              role: msg.role,
              parts: [{ text: msg.content }]
          }));
      }

      // Construct Prompt
      // For Chat Mode, the promptTemplate is the system instruction.
      // For Single Mode, we prepend the promptTemplate to the user input to form a "one-shot" prompt.
      
      const systemInstruction = isChatMode ? toolConfig.promptTemplate : toolConfig.promptTemplate;
      const userPrompt = isChatMode ? text : `${text}`; // Template is in system instruction for v2

      const responseText = await generateScientificContent(
        toolConfig.model,
        systemInstruction, // Pass as System Instruction
        userPrompt,
        attachments,
        apiHistory
      );

      if (isChatMode) {
          const newAiMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'model',
              content: responseText,
              timestamp: Date.now()
          };
          setChatHistory(prev => [...prev, newAiMsg]);
          setIsChatLoading(false);
      } else {
          setGeneration({
            isLoading: false,
            error: null,
            result: responseText
          });
      }

    } catch (error: any) {
      const errorMsg = error.message || "An unexpected error occurred.";
      if (isChatMode) {
          setIsChatLoading(false);
          setChatHistory(prev => [...prev, {
              id: Date.now().toString(),
              role: 'model',
              content: `**Error:** ${errorMsg}`,
              timestamp: Date.now()
          }]);
      } else {
          setGeneration({
            isLoading: false,
            error: errorMsg,
            result: null
          });
      }
    }
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="col-span-full mb-4 md:mb-8 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">ResearchGPT Explorer <span className="text-cyan-400 text-lg ml-2">Pro v2.0</span></h2>
        <p className="text-slate-400 max-w-2xl">
          Advanced multimodal research engine. Analyze PDFs, compare papers, simulate experiments, 
          and discover research gaps using Gemini 3 Pro.
        </p>
      </div>
      
      {Object.values(TOOLS).filter(t => t.id !== ToolType.DASHBOARD && t.id !== ToolType.LIVE_SCIENTIST).map((tool) => (
        <button 
          key={tool.id}
          onClick={() => setActiveTool(tool.id)}
          className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/50 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-900/20"
        >
          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="text-cyan-400 w-5 h-5" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-900/50 border border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
             <Sparkles className="text-cyan-500 w-6 h-6" />
          </div>
          <div className="mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{tool.category}</span>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">{tool.name}</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{tool.description}</p>
        </button>
      ))}

      <button 
        onClick={() => setActiveTool(ToolType.LIVE_SCIENTIST)}
        className="col-span-full mt-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 hover:border-cyan-400/50 rounded-2xl p-8 flex items-center justify-between group transition-all"
      >
        <div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Enter Live Scientist Mode
          </h3>
          <p className="text-slate-400">Real-time voice and vision interaction with the AI.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/30">
          <ArrowRight className="text-white w-6 h-6" />
        </div>
      </button>
    </div>
  );

  const renderChat = () => (
      <div className="flex flex-col gap-6 pb-4">
          {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-700' : 'bg-cyan-600'}`}>
                      {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                       {msg.attachments && msg.attachments.length > 0 && (
                           <div className="flex gap-2">
                               {msg.attachments.map((att, i) => (
                                   <div key={i} className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                                       <span className="text-xs text-slate-400">Attached File</span>
                                   </div>
                               ))}
                           </div>
                       )}
                       <div className={`p-4 rounded-2xl ${
                           msg.role === 'user' 
                           ? 'bg-slate-800 text-slate-200 rounded-tr-none' 
                           : 'bg-slate-900/50 border border-slate-700 rounded-tl-none'
                       }`}>
                           {msg.role === 'model' ? (
                               <ResponseDisplay content={msg.content} />
                           ) : (
                               <p className="whitespace-pre-wrap">{msg.content}</p>
                           )}
                       </div>
                  </div>
              </div>
          ))}
          {isChatLoading && (
              <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5" />
                   </div>
                   <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                       <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                       <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                       <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                   </div>
              </div>
          )}
      </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-slate-200">
      <Sidebar activeTool={activeTool} onSelectTool={setActiveTool} />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center px-4 md:px-8 shrink-0 justify-between">
          <h2 className="text-lg font-medium text-slate-100 flex items-center gap-2">
            {TOOLS[activeTool].name}
            {activeTool !== ToolType.DASHBOARD && activeTool !== ToolType.LIVE_SCIENTIST && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                {TOOLS[activeTool].model}
              </span>
            )}
          </h2>
          {TOOLS[activeTool].category && (
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider hidden md:block">
                  {TOOLS[activeTool].category}
              </span>
          )}
        </header>

        {/* Content Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
          {activeTool === ToolType.DASHBOARD ? (
             renderDashboard()
          ) : activeTool === ToolType.LIVE_SCIENTIST ? (
             <div className="h-full p-4 md:p-6">
                <LiveScientist />
             </div>
          ) : (
            <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-full flex flex-col">
               {/* Empty State */}
               {!generation.result && !generation.isLoading && !generation.error && chatHistory.length === 0 && !isChatLoading && (
                 <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                    <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                       <Sparkles className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-lg font-medium text-slate-300">Ready to Analyze</p>
                    <p className="max-w-md text-slate-500 mt-2">{TOOLS[activeTool].description}</p>
                 </div>
               )}

               {/* Chat Mode Render */}
               {TOOLS[activeTool].isChat && renderChat()}

               {/* Single-Shot Mode Render */}
               {!TOOLS[activeTool].isChat && (
                   <div className="space-y-6 pb-8">
                     {generation.error && (
                       <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                         Error: {generation.error}
                       </div>
                     )}
                     
                     {generation.isLoading && (
                       <div className="flex flex-col items-center justify-center py-20 space-y-4">
                         <div className="relative w-16 h-16">
                           <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full animate-spin"></div>
                           <div className="absolute inset-2 border-r-2 border-blue-500 rounded-full animate-spin reverse"></div>
                           <div className="absolute inset-4 border-b-2 border-purple-500 rounded-full animate-spin"></div>
                         </div>
                         <p className="text-cyan-400 font-mono text-sm animate-pulse">Analyzing Scientific Data...</p>
                       </div>
                     )}

                     {generation.result && (
                       <ResponseDisplay content={generation.result} />
                     )}
                   </div>
               )}
            </div>
          )}
        </div>

        {/* Input Area */}
        {activeTool !== ToolType.DASHBOARD && activeTool !== ToolType.LIVE_SCIENTIST && (
          <InputArea 
            onSend={handleSend} 
            isLoading={generation.isLoading || isChatLoading}
            acceptsFiles={TOOLS[activeTool].acceptsFiles}
            multiFile={TOOLS[activeTool].multiFile}
            acceptsText={TOOLS[activeTool].acceptsText}
            placeholder={
                TOOLS[activeTool].id === ToolType.PAPER_COMPARISON ? "Upload 2 papers to compare..." :
                TOOLS[activeTool].id === ToolType.RESEARCH_CHAT ? "Ask a question about the document..." :
                `Ask ${TOOLS[activeTool].name} to analyze...`
            }
          />
        )}
      </main>
    </div>
  );
};

export default App;
