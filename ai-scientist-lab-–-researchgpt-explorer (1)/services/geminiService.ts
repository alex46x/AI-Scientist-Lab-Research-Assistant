import { GoogleGenAI, GenerateContentResponse, Part, Content } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

export interface Attachment {
  base64: string;
  mimeType: string;
}

export const generateScientificContent = async (
  modelName: string,
  systemInstruction: string,
  prompt: string,
  attachments: Attachment[] = [],
  history: Content[] = []
): Promise<string> => {
  try {
    const ai = getAIClient();
    
    // Construct the current message parts
    const currentParts: Part[] = [];
    
    // Add attachments
    attachments.forEach(att => {
      currentParts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: att.base64,
        },
      });
    });

    // Add text prompt
    if (prompt) {
      currentParts.push({ text: prompt });
    }

    // Determine if we are starting fresh or continuing a chat
    let response: GenerateContentResponse;

    if (history.length > 0) {
      // Chat mode
      const chat = ai.chats.create({
        model: modelName,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.2,
        },
        history: history
      });

      response = await chat.sendMessage({
          message: currentParts
      });

    } else {
      // Single generation mode
      response = await ai.models.generateContent({
        model: modelName,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2, // Scientific precision
          topK: 40,
          topP: 0.95,
        },
        contents: {
          role: 'user',
          parts: currentParts
        }
      });
    }

    return response.text || "No response generated.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate content");
  }
};

export const getLiveClient = () => {
    return getAIClient();
}