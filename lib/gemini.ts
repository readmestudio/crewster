import { GoogleGenerativeAI } from '@google/generative-ai';

export async function validateGeminiApiKey(apiKey: string): Promise<boolean> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Hi' }] }],
    });
    return true;
  } catch {
    return false;
  }
}
