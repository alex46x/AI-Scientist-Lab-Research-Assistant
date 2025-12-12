import React, { useState, useRef } from 'react';
import { Send, X, Loader2, Paperclip, FileText } from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string, files: File[]) => void;
  isLoading: boolean;
  acceptsFiles: boolean;
  multiFile: boolean;
  acceptsText: boolean;
  placeholder: string;
}

const InputArea: React.FC<InputAreaProps> = ({ 
  onSend, 
  isLoading, 
  acceptsFiles, 
  multiFile,
  acceptsText,
  placeholder 
}) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      if (multiFile) {
        setFiles(prev => [...prev, ...newFiles]);
      } else {
        setFiles([newFiles[0]]);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length <= 1 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && files.length === 0) || isLoading) return;
    onSend(text, files);
    setText('');
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-4 md:p-6 bg-slate-900/50 border-t border-slate-800 backdrop-blur-sm sticky bottom-0 z-10">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-4">
        {files.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {files.map((f, index) => (
              <div key={index} className="relative group shrink-0">
                <div className="w-24 h-24 rounded-lg border border-slate-700 bg-slate-800 flex flex-col items-center justify-center p-2 text-center overflow-hidden">
                    {f.type.includes('image') ? (
                         <img 
                           src={URL.createObjectURL(f)} 
                           alt="preview" 
                           className="w-full h-full object-cover absolute inset-0 opacity-50" 
                         />
                    ) : (
                        <FileText className="w-8 h-8 text-slate-400 mb-1" />
                    )}
                    <span className="text-[10px] text-slate-200 z-10 truncate w-full">{f.name}</span>
                    <span className="text-[8px] text-slate-400 z-10 uppercase">{f.name.split('.').pop()}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-slate-800 text-slate-200 rounded-full p-1 hover:bg-red-500 hover:text-white transition-colors border border-slate-600 shadow-sm z-20"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-slate-800/80 p-2 rounded-2xl border border-slate-700 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all shadow-lg">
          {acceptsFiles && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 rounded-xl transition-colors shrink-0"
              title={multiFile ? "Upload Files (PDF, Images)" : "Upload File"}
            >
              <Paperclip className="w-5 h-5" />
            </button>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,application/pdf,.csv,.txt"
            multiple={multiFile}
          />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={acceptsText ? placeholder : "Upload files to analyze..."}
            className="w-full bg-transparent text-slate-200 placeholder-slate-500 resize-none py-3 px-2 focus:outline-none min-h-[50px] max-h-[200px] text-sm md:text-base disabled:opacity-50"
            rows={1}
            disabled={!acceptsText && files.length === 0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />

          <button
            type="submit"
            disabled={isLoading || (!text.trim() && files.length === 0)}
            className={`p-3 rounded-xl flex items-center justify-center transition-all shrink-0
              ${isLoading || (!text.trim() && files.length === 0)
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20'
              }`}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <div className="text-center flex justify-center gap-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">AI Scientist Lab Pro v2.0</p>
        </div>
      </form>
    </div>
  );
};

export default InputArea;
