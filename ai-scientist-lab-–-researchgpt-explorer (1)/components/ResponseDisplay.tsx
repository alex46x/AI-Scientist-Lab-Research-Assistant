import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';

interface ResponseDisplayProps {
  content: string;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ content }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/60 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"></div>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Analysis Result</span>
          </div>
          <div className="flex gap-2">
             <button 
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="p-6 md:p-8 prose prose-invert prose-slate max-w-none prose-headings:text-cyan-50 prose-a:text-cyan-400 prose-strong:text-cyan-200">
           <ReactMarkdown 
             components={{
               h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-8 mb-4 pb-2 border-b border-slate-700/50 text-cyan-100 flex items-center gap-2" {...props} />,
               h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-6 mb-3 text-cyan-50" {...props} />,
               p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-slate-300" {...props} />,
               ul: ({node, ...props}) => <ul className="space-y-2 mb-4 list-disc list-inside text-slate-300" {...props} />,
               li: ({node, ...props}) => <li className="pl-1" {...props} />,
               code: ({node, ...props}) => <code className="bg-slate-950 px-1.5 py-0.5 rounded text-sm font-mono text-pink-300" {...props} />,
               pre: ({node, ...props}) => <pre className="bg-slate-950 p-4 rounded-xl overflow-x-auto border border-slate-800 my-4 shadow-inner" {...props} />,
               blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-cyan-500/30 pl-4 py-1 italic text-slate-400 bg-slate-800/20 rounded-r-lg" {...props} />,
               table: ({node, ...props}) => <div className="overflow-x-auto my-6 border border-slate-700 rounded-lg"><table className="w-full text-left text-sm" {...props} /></div>,
               th: ({node, ...props}) => <th className="bg-slate-900 px-4 py-3 font-semibold text-slate-200 border-b border-slate-700" {...props} />,
               td: ({node, ...props}) => <td className="px-4 py-3 border-b border-slate-800 text-slate-300" {...props} />,
             }}
           >
             {content}
           </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ResponseDisplay;
