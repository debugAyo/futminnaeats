
import { GoogleGenAI, Type } from "@google/genai";
import { Restaurant } from "../types";
import { RESTAURANTS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSmartRecommendations = async (userPrompt: string, campus: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User Context: A student at FUT Minna, currently at ${campus} campus. 
      Input request: "${userPrompt}". 
      Available Restaurants: ${JSON.stringify(RESTAURANTS.map(r => ({ name: r.name, menu: r.menu, campus: r.campus })))}
      Task: Provide a short, exciting recommendation (max 60 words) for what they should eat and where. Be specific about the dish and the restaurant location. Use a friendly student vibe.`,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
    });

    return response.text || "Try the Jollof Rice from Food Republic! It's the highest rated on campus right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Hungry? Food Republic and Bilkebab are top picks for students today!";
  }
};
