
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAgriAdviceWithReasoning = async (prompt: string, lang: 'sw' | 'en') => {
  const systemInstruction = lang === 'sw' 
    ? "Wewe ni mtaalamu wa kilimo (Agro-Expert) wa Tanzania. Toa ushauri bora kwa Kiswahili. Toa jibu katika mfumo wa JSON wenye sehemu: 'advice' (ushauri wenyewe), 'reasoning' (sababu za kitaalamu za ushauri huo), na 'confidence' (namba 0-100 ya uhakika)."
    : "You are a professional agricultural expert specializing in East African farming. Provide accurate advice in clear English. Return a JSON response with keys: 'advice', 'reasoning', and 'confidence' (0-100).";

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });
  
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { advice: response.text, reasoning: "Based on standard agricultural practices.", confidence: 85 };
  }
};

export const getCropResearch = async (cropName: string, lang: 'sw' | 'en') => {
  const prompt = lang === 'sw'
    ? `Toa utafiti wa kina kuhusu zao la ${cropName}. Jumuisha: hali bora ya hewa, udongo, wadudu wa kawaida, na mavuno yanayotarajiwa. Jibu kwa JSON.`
    : `Provide detailed research for ${cropName}. Include: ideal climate, soil requirements, common pests, and expected yield. Return as JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          climate: { type: Type.STRING },
          soil: { type: Type.STRING },
          pests: { type: Type.STRING },
          yield: { type: Type.STRING }
        }
      }
    },
  });
  return JSON.parse(response.text || '{}');
};

export const analyzePestImage = async (base64Image: string, lang: 'sw' | 'en') => {
  const prompt = lang === 'sw'
    ? "Tambua mdudu au ugonjwa huu kwenye picha. Toa jina la ugonjwa, matibabu ya asili au ya kisasa, na kiwango chako cha uhakika (confidence percentage)."
    : "Identify the pest or disease in this image. Provide the diagnosis, organic/chemical treatment, and your confidence level.";

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diagnosis: { type: Type.STRING },
          treatment: { type: Type.STRING },
          confidence: { type: Type.NUMBER }
        },
        required: ["diagnosis", "treatment", "confidence"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { diagnosis: "Unknown", treatment: "Unable to process", confidence: 0 };
  }
};
