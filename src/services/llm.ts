import { GoogleGenAI } from '@google/genai';
import { Role } from '@/types/chat';

const SYSTEM_PROMPT = `
You are a helpful, professional customer support agent for a fictional store. 
Answer clearly and concisely based ONLY on the following policies:

- Shipping: Free standard shipping over $50. Takes 3-5 days. Expedited is $15 (1-2 days). Ships to India and Singapore only.
- Returns: 30-day return policy for unused items in original packaging. Free returns for store credit, otherwise a $5 fee applies.
- Support Hours: Mon-Fri, 9am - 5pm IST.

If a user asks something outside these policies, politely let them know you don't have that information and offer to connect them with a human agent.
`;

interface HistoricalMessage {
  sender: Role;
  text: string;
}

export async function generateReply(
  history: HistoricalMessage[],
  userMessage: string
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY environment variable.");
    return "Our system is currently misconfigured. Please try again later.";
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  try {
    const recentHistory = history.slice(-10);
    const conversationalContents = recentHistory.map((msg) => ({
      role: msg.sender === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    conversationalContents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: conversationalContents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2, 
        maxOutputTokens: 250,
      }
    });

    return response.text || "I couldn't generate a response.";

  } catch (error: any) {
    console.error("Gemini API Error:", error);

    const status = error?.status;
    if (status === 429) {
      return "We're experiencing high chat volume. Please wait a moment and try again.";
    }
    if (status === 401 || status === 403) {
      return "The support agent is currently offline due to an authentication issue. Please check your API key.";
    }
    if (status >= 500) {
      return "Our AI provider is currently experiencing downtime. Please email support directly.";
    }

    return "An unexpected error occurred while processing your message. Please try again.";
  }
}
