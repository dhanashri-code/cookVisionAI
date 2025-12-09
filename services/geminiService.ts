import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Recipe } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Audio Decoding Utilities ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- API Functions ---

export const generateRecipe = async (prompt: string): Promise<Recipe> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Create a detailed cooking recipe for: ${prompt}. Be creative but realistic.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          prepTime: { type: Type.STRING },
          cookTime: { type: Type.STRING },
          servings: { type: Type.INTEGER },
          difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard", "Professional"] },
          calories: { type: Type.INTEGER },
          cuisine: { type: Type.STRING },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                amount: { type: Type.STRING },
                notes: { type: Type.STRING }
              },
              required: ["item", "amount"]
            }
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                instruction: { type: Type.STRING },
                tip: { type: Type.STRING }
              },
              required: ["instruction"]
            }
          }
        },
        required: ["title", "description", "prepTime", "cookTime", "servings", "ingredients", "steps"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate recipe data");
  }

  return JSON.parse(response.text) as Recipe;
};

export const generateDishImage = async (dishDescription: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Professional food photography, top-down view, high resolution, delicious looking: ${dishDescription}`,
          },
        ],
      },
      config: {
        imageConfig: {
            aspectRatio: "16:9",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image generation failed", e);
    return null;
  }
};

export const generateSpeech = async (text: string): Promise<AudioBuffer | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return await decodeAudioData(
      decode(base64Audio),
      audioContext,
      24000,
      1
    );

  } catch (e) {
    console.error("Speech generation failed", e);
    return null;
  }
};

export const chatWithChef = async (history: string[], message: string): Promise<string> => {
    // Basic chat interface for questions
    // In a real app, we would maintain a Chat session object
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are a professional Michelin-star chef assistant.
        Previous Context: ${history.join('\n')}
        User Question: ${message}
        Answer concisely and helpfully.`,
    });
    return response.text || "I'm having trouble hearing you clearly, chef. Could you repeat that?";
}
