import { ToolType, ToolConfig, ToolCategory } from './types';

export const UNIVERSAL_RESPONSE_TEMPLATE = `
IMPORTANT: You are a Senior Principal Scientist. Distinguish strictly between ESTABLISHED FACT and SPECULATION.
You must format your response using the following structure exactly. Do not skip sections. Use Markdown.

## 1. Objective
[One sentence goal of this analysis.]

## 2. Extracted Evidence
[List specific pages, figures, formulas, or data points used. If analyzing a PDF/Image, cite the visual feature.]

## 3. Technical Analysis (Expert View)
[Deep dive using precise terminology. Derive equations, analyze methodology, or interpret data statistics.]

## 4. Beginner-Friendly Summary
[Explain the core concept using an analogy for a non-expert.]

## 5. Visual/Data Representation
[Create a Markdown table, an ASCII diagram, or a structured list of values extracted from the input.]

## 6. Insights & Hypotheses
[Propose 2-3 novel insights or hypotheses based on this data.]

## 7. Experimental/Simulation Next Steps
[Suggested experiments or simulation parameters to validate these findings.]

## 8. Research Gaps & Limitations
[What is missing? What are the potential sources of error?]

## 9. Research Notebook Summary
[A concise, copy-pasteable summary block for a lab notebook.]
`;

export const TOOLS: Record<ToolType, ToolConfig> = {
  // --- HOME ---
  [ToolType.DASHBOARD]: {
    id: ToolType.DASHBOARD,
    name: 'Dashboard',
    description: 'Overview of AI Scientist Lab capabilities',
    icon: 'LayoutDashboard',
    category: ToolCategory.HOME,
    promptTemplate: '',
    acceptsFiles: false,
    multiFile: false,
    acceptsText: false,
    model: 'gemini-2.5-flash',
    isChat: false,
  },

  // --- DEEP ANALYSIS ---
  [ToolType.PAPER_ANALYZER]: {
    id: ToolType.PAPER_ANALYZER,
    name: 'PDF Analyzer Pro',
    description: 'Multi-page analysis. Upload PDFs/images to extract summaries, formulas, and findings.',
    icon: 'FileText',
    category: ToolCategory.ANALYSIS,
    promptTemplate: `You are an expert Research Paper Analyzer. Analyze the provided document(s).
    ${UNIVERSAL_RESPONSE_TEMPLATE}`,
    acceptsFiles: true,
    multiFile: true,
    acceptsText: true,
    model: 'gemini-2.5-flash',
    isChat: false,
  },
  [ToolType.GRAPH_DECODER]: {
    id: ToolType.GRAPH_DECODER,
    name: 'Graph Decoder',
    description: 'Reconstruct underlying data from charts. Extract axes, trends, and values to CSV format.',
    icon: 'BarChart2',
    category: ToolCategory.ANALYSIS,
    promptTemplate: `You are a Data Reconstruction Specialist. Analyze the provided graph.
    Task: Estimate the numerical values for data points, identify axes/units, and detect trends.
    Output a Markdown Table representing the reconstructed dataset.
    ${UNIVERSAL_RESPONSE_TEMPLATE}`,
    acceptsFiles: true,
    multiFile: false,
    acceptsText: false,
    model: 'gemini-2.5-flash',
    isChat: false,
  },
  [ToolType.DATASET_ANALYZER]: {
    id: ToolType.DATASET_ANALYZER,
    name: 'Dataset Analyzer',
    description: 'Upload tables/CSVs to compute statistics, correlations, and find outliers.',
    icon: 'Database',
    category: ToolCategory.ANALYSIS,
    promptTemplate: `You are a Statistical Analyst. Read the provided table image or text data.
    Task: Compute summary statistics (mean, median, std dev), find correlations, identify outliers, and suggest patterns.
    ${UNIVERSAL_RESPONSE_TEMPLATE}`,
    acceptsFiles: true,
    multiFile: true,
    acceptsText: true,
    model: 'gemini-3-pro-preview',
    isChat: false,
  },
  [ToolType.EQUATION_SOLVER]: {
    id: ToolType.EQUATION_SOLVER,
    name: 'Equation Solver',
    description: 'Extract handwritten math, solve it step-by-step, and explain the variables.',
    icon: 'Sigma',
    category: ToolCategory.ANALYSIS,
    promptTemplate: `You are a Mathematical Physicist.
    Task: Transcribe the equation from the image into LaTeX. Solve it symbolically. Explain the physical meaning of every variable.
    ${UNIVERSAL_RESPONSE_TEMPLATE}`,
    acceptsFiles: true,
    multiFile: false,
    acceptsText: true,
    model: 'gemini-3-pro-preview',
    isChat: false,
  },

  // --- SYNTHESIS & WRITING ---
  [ToolType.PAPER_COMPARISON]: {
    id: ToolType.PAPER_COMPARISON,
    name: 'Paper Comparison',
    description: 'Upload 2 papers to compare methodologies, results, and find contradictions.',
    icon: 'GitCompare',
    category: ToolCategory.SYNTHESIS,
    promptTemplate: `You are a Comparative Researcher.
    Task: Compare the provided documents. Highlight differences in methodology, results, assumptions, and conclusions. Create a comparison table.
    ${UNIVERSAL_RESPONSE_TEMPLATE}`,
    acceptsFiles: true,
    multiFile: true,
    acceptsText: true,
    model: 'gemini-3-pro-preview',
    isChat: false,
  },
  [ToolType.LIT_REVIEW]: {
    id: ToolType.LIT_REVIEW,
    name: 'Lit Review Generator',
    description: 'Synthesize multiple sources into a coherent literature review with citations.',
    icon: 'Library',
    category: ToolCategory.SYNTHESIS,
    promptTemplate: `You are a Literature Review Specialist.
    Task: Synthesize the provided information into a structured literature review. Organize by themes/chronology. Identify consensus and debate.
    ${UNIVERSAL_RESPONSE_TEMPLATE}`,
    acceptsFiles: true,
    multiFile: true,
    acceptsText: true,
    model: 'gemini-3-pro-preview',
    isChat: false,
  },
  [ToolType.GAP_DETECTOR]: {
    id: ToolType.GAP_DETECTOR,
    name: 'Gap Detector',
    description: 'Identify missing experiments, unproven assumptions, and future research opportunities.',
    icon: 'SearchX',
    category: ToolCategory.SYNTHESIS,
    promptTemplate: `You are a Critical Reviewer.
    Task: Scrutinize the provided research. Find logical gaps, missing controls, unvalidated assumptions, and areas for future work.
    ${UNIVERSAL_RESPONSE_TEMPLATE}`,
    acceptsFiles: true,
    multiFile: true,
    acceptsText: true,
    model: 'gemini-3-pro-preview',
    isChat: false,
  },
  [ToolType.SLIDE_GENERATOR]: {
    id: ToolType.SLIDE_GENERATOR,
    name: 'Slide Generator',
    description: 'Create a 10-slide scientific presentation structure from text or papers.',
    icon: 'Presentation',
    category: ToolCategory.SYNTHESIS,
    promptTemplate: `You are a Scientific Communicator.
    Task: Generate a 10-slide presentation deck based on the input.
    Format: Slide Title, Bullet Points, Speaker Notes, and Suggested Visuals (ASCII).
    ${UNIVERSAL_RESPONSE_TEMPLATE}`,
    acceptsFiles: true,
    multiFile: true,
    acceptsText: true,
    model: 'gemini-3-pro-preview',
    isChat: false,
  },
  [ToolType.NOTEBOOK_GENERATOR]: {
    id: ToolType.NOTEBOOK_GENERATOR,
    name: 'Notebook Export',
    description: 'Compile findings into a reproducible Lab Notebook entry.',
    icon: 'Book',
    category: ToolCategory.SYNTHESIS,
    promptTemplate: `You are a Lab Manager.
    Task: Create a formal Lab Notebook entry. Include Title, Date, Objective, Raw Data Summary, Analysis, and Conclusion.
    ${UNIVERSAL_RESPONSE_TEMPLATE}`,
    acceptsFiles: true,
    multiFile: true,
    acceptsText: true,
    model: 'gemini-2.5-flash',
    isChat: false,
  },

  // --- LAB & SIMULATION ---
  [ToolType.EXPERIMENT_SIMULATOR]: {
    id: ToolType.EXPERIMENT_SIMULATOR,
    name: 'Experiment Simulator',
    description: 'Simulate outcomes for experimental designs and check for safety issues.',
    icon: 'FlaskConical',
    category: ToolCategory.LAB,
    promptTemplate: `You are a Computational Scientist.
    Task: Simulate the proposed experiment conceptually. Predict outcomes based on theoretical principles. Highlight safety risks.
    ${UNIVERSAL_RESPONSE_TEMPLATE}`,
    acceptsFiles: true,
    multiFile: true,
    acceptsText: true,
    model: 'gemini-3-pro-preview',
    isChat: false,
  },
  [ToolType.CODE_GENERATOR]: {
    id: ToolType.CODE_GENERATOR,
    name: 'Method to Code',
    description: 'Convert scientific methodology text into Python/MATLAB code.',
    icon: 'Code',
    category: ToolCategory.LAB,
    promptTemplate: `You are a Research Software Engineer.
    Task: Convert the described scientific method or algorithm into well-commented Python code.
    ${UNIVERSAL_RESPONSE_TEMPLATE}`,
    acceptsFiles: true,
    multiFile: true,
    acceptsText: true,
    model: 'gemini-3-pro-preview',
    isChat: false,
  },

  // --- ASSISTANT ---
  [ToolType.RESEARCH_CHAT]: {
    id: ToolType.RESEARCH_CHAT,
    name: 'Chat with Paper',
    description: 'Interactive memory. Ask questions about specific figures, sections, or concepts.',
    icon: 'MessageSquareText',
    category: ToolCategory.ASSISTANT,
    promptTemplate: `You are ResearchGPT, a helpful scientific assistant with memory of the uploaded documents.
    Answer the user's question specifically based on the provided context. If the answer is not in the document, state that clearly.
    Maintain a professional, academic tone.`,
    acceptsFiles: true,
    multiFile: true,
    acceptsText: true,
    model: 'gemini-3-pro-preview',
    isChat: true,
  },
  [ToolType.LIVE_SCIENTIST]: {
    id: ToolType.LIVE_SCIENTIST,
    name: 'Live Scientist',
    description: 'Real-time voice & vision conversation.',
    icon: 'Mic',
    category: ToolCategory.ASSISTANT,
    promptTemplate: '',
    acceptsFiles: false,
    multiFile: false,
    acceptsText: false,
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    isChat: false,
  },
};
