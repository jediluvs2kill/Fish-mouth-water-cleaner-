import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askBiomimicryExpert = async (
  prompt: string,
  simulationContext: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are an expert Bio-Engineer and Ecologist specializing in biomimicry. 
        You are explaining a 3D simulation of a water filter inspired by filter-feeding fish (like basking sharks or paddlefish).
        
        The Simulation Context:
        ${simulationContext}

        User Question: "${prompt}"

        Explain the science clearly, focusing on how "cross-flow filtration" in fish mouths prevents clogging (unlike sieve filters).
        Keep the answer concise (under 100 words) but fascinating.
      `,
    });
    return response.text || "I couldn't process that request right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The bio-simulation interface is currently offline. Please check your connection.";
  }
};
