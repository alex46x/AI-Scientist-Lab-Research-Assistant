import React from 'react';
import { 
  LayoutDashboard, FileText, BarChart2, FlaskConical, Sigma, 
  NotebookPen, Lightbulb, BookOpen, Library, Mic, 
  MessageSquareText, Database, GitCompare, SearchX, 
  Presentation, Code, Book
} from 'lucide-react';
import { ToolType, ToolCategory } from '../types';
import { TOOLS } from '../constants';

interface SidebarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
}

const iconMap: Record<string, React.FC<any>> = {
  LayoutDashboard, FileText, BarChart2, FlaskConical, Sigma,
  NotebookPen, Lightbulb, BookOpen, Library, Mic,
  MessageSquareText, Database, GitCompare, SearchX,
  Presentation, Code, Book
};

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool }) => {
  // Group tools by category
  const toolsByCategory = Object.values(TOOLS).reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<ToolCategory, typeof TOOLS[ToolType][]>);

  // Order of categories
  const categoryOrder = [
    ToolCategory.HOME,
    ToolCategory.ASSISTANT,
    ToolCategory.ANALYSIS,
    ToolCategory.SYNTHESIS,
    ToolCategory.LAB
  ];

  return (
    <div className="w-20 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 transition-all duration-300">
      <div className="p-4 md:p-6 flex items-center justify-center md:justify-start gap-3 border-b border-slate-800/50">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
          <FlaskConical className="text-white w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div className="hidden md:block">
          <h1 className="text-white font-bold text-lg leading-tight">ResearchGPT</h1>
          <p className="text-xs text-slate-400">Pro Edition v2.0</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <div className="px-3 space-y-6">
          {categoryOrder.map((category) => {
             const categoryTools = toolsByCategory[category];
             if (!categoryTools) return null;

             return (
               <div key={category}>
                 {category !== ToolCategory.HOME && (
                   <div className="hidden md:block px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                     {category}
                   </div>
                 )}
                 <div className="space-y-1">
                   {categoryTools.map((tool) => {
                     const Icon = iconMap[tool.icon];
                     const isActive = activeTool === tool.id;
                     return (
                       <button
                         key={tool.id}
                         onClick={() => onSelectTool(tool.id)}
                         className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                           ${isActive 
                             ? 'bg-blue-600/10 text-cyan-400 border border-blue-500/20 shadow-sm' 
                             : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                           }`}
                         title={tool.name}
                       >
                         <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'group-hover:text-slate-200'}`} />
                         <span className={`hidden md:block text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis`}>
                           {tool.name}
                         </span>
                         {isActive && (
                           <div className="ml-auto hidden md:block w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                         )}
                       </button>
                     );
                   })}
                 </div>
               </div>
             );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800 text-center md:text-left">
        <div className="hidden md:block p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-slate-400 font-mono">Gemini 3 Pro</p>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1 rounded border border-cyan-500/30">PRO</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-green-400 uppercase tracking-wider font-bold">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
