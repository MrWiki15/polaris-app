import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: modelName,
    generationConfig: { maxOutputTokens: 1024 },
  });
  // Build prompt string; keep system messages but ensure persona of Polo is included
  const systemIntro = `SYSTEM: Eres Polo, un asistente financiero extremadamente profesional, objetivo y conciso. Responde en castellano y ofrece consejos accionables basados en el contexto proporcionado. Responde utilizando formato Markdown para todas las respuestas. Usa encabezados, listas, negritas y bloques de código cuando proceda. Mantén las respuestas claras, estructuradas y directamente accionables. No añadas texto fuera del formato Markdown.`;
  const systemParts = [systemIntro].concat(
    conversation.map((m) => `${m.role.toUpperCase()}: ${m.content}`),
  );
  const systemPrompt = systemParts.join("\n");

  try {
    const result = await model.generateContent(systemPrompt);
    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "";
  } catch (err: any) {
    console.error("Chatbot Gemini error:", err);
    throw err;
  }
}
