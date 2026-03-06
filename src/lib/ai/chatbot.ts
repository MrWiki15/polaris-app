import { GoogleGenerativeAI } from "@google/generative-ai";
import { CHATBOT_SYSTEM } from "./promptConfig";
import { chatResponseCache } from "./cache";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

function getGeminiClient() {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("API key missing. Add VITE_GOOGLE_AI_API_KEY to .env");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function sendChatMessage(
  conversation: ChatMessage[],
  modelName = "gemini-2.5-flash-lite",
): Promise<string> {
  // Check cache first
  const cacheKey = conversation.map((m) => `${m.role}:${m.content}`).join("|");
  const cached = chatResponseCache.get(cacheKey);
  if (cached) {
    console.log("[CACHE HIT] Reusing chat response");
    return cached;
  }

  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction: CHATBOT_SYSTEM, // Optimized: System instruction (55% smaller)
    generationConfig: { maxOutputTokens: 800 }, // Reduced from 1024
  });

  // Build user message (exclude system intro from conversation)
  const userMessages = conversation
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  try {
    const result = await model.generateContent(userMessages);
    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
    const response = text || "";

    // Cache the response (estimated ~400 tokens average)
    chatResponseCache.set(cacheKey, response, 400);

    return response;
  } catch (err) {
    const error = err as Error;
    console.error("Chatbot Gemini error:", error);
    throw error;
  }
}
