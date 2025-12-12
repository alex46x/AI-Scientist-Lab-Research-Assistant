export enum ToolType {
  DASHBOARD = 'DASHBOARD',
  PAPER_ANALYZER = 'PAPER_ANALYZER',
  RESEARCH_CHAT = 'RESEARCH_CHAT', // New
  GRAPH_DECODER = 'GRAPH_DECODER',
  DATASET_ANALYZER = 'DATASET_ANALYZER', // New
  EQUATION_SOLVER = 'EQUATION_SOLVER',
  EXPERIMENT_SIMULATOR = 'EXPERIMENT_SIMULATOR',
  PAPER_COMPARISON = 'PAPER_COMPARISON', // New
  LIT_REVIEW = 'LIT_REVIEW',
  GAP_DETECTOR = 'GAP_DETECTOR', // New
  SLIDE_GENERATOR = 'SLIDE_GENERATOR', // New
  CODE_GENERATOR = 'CODE_GENERATOR', // New
  NOTEBOOK_GENERATOR = 'NOTEBOOK_GENERATOR', // New
  LIVE_SCIENTIST = 'LIVE_SCIENTIST',
}

export enum ToolCategory {
  HOME = 'Home',
  ANALYSIS = 'Deep Analysis',
  SYNTHESIS = 'Synthesis & Writing',
  LAB = 'Lab & Simulation',
  ASSISTANT = 'Assistant'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  attachments?: {
    type: 'image' | 'file';
    url: string; // Preview URL
    mimeType: string;
  }[];
}

export interface ToolConfig {
  id: ToolType;
  name: string;
  description: string;
  icon: string;
  category: ToolCategory;
  promptTemplate: string;
  acceptsFiles: boolean; // Renamed from acceptsImage
  multiFile: boolean;    // New capability
  acceptsText: boolean;
  model: string;
  isChat: boolean;       // Determines if UI preserves history
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  result: string | null;
}
