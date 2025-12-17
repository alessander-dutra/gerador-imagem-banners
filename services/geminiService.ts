import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageSize } from "../types";

const MODEL_NAME = "gemini-3-pro-image-preview";

export const generateBannerImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  imageSize: ImageSize,
  referenceImageBase64?: string
): Promise<string> => {
  // Always create a new instance to ensure we pick up the latest selected key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const parts: any[] = [{ text: prompt }];

    if (referenceImageBase64) {
      // Extract mime type and base64 data
      // format: data:image/png;base64,......
      const matches = referenceImageBase64.match(/^data:(.+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        parts.unshift({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize,
        },
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No content generated");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};