import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AppData, CalendarEvent } from "@/lib/storage";

export interface AgendaPlanEvent {
  title: string;
  date: string;
  time?: string;
  type: "recordatorio" | "cita" | "pago" | "otro";
  description?: string;
}

export interface AgendaPlanResult {
  events: AgendaPlanEvent[];
  rationale?: string;
}

function getGeminiClient() {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("API key missing. Add VITE_GOOGLE_AI_API_KEY to .env");
  }
  return new GoogleGenerativeAI(apiKey);
}

const formatEventList = (events: CalendarEvent[]) =>
  events
    .map((e) => `${e.date} ${e.time || ""} - ${e.title}`.trim())
    .slice(0, 30)
    .join("\n");

export async function generateAgendaPlan(params: {
  objective: string;
  appData: AppData;
  existingEvents: CalendarEvent[];
  startDate: string;
  days?: number;
}): Promise<AgendaPlanResult> {
  const { objective, appData, existingEvents, startDate, days = 7 } = params;

  const workers = (appData.workers || [])
    .map((w) => w.name)
    .slice(0, 12)
    .join(", ");

  const goals = (appData.goals || [])
    .slice(0, 6)
    .map((g) => `${g.title} (fecha: ${g.deadline})`)
    .join("; ");

  const prompt = `Eres Polo, un asistente de productividad con enfoque de PM. Debes crear una agenda basada en objetivos (no solo eventos). Usa un tono profesional y accionable.

## Objetivo del PM
${objective}

## Contexto de metas existentes
${goals || "(sin metas)"}

## Equipo disponible (si aplica)
${workers || "(sin equipo definido)"}

## Eventos ya agendados (evita conflictos de hora)
${formatEventList(existingEvents) || "(sin eventos)"}

## Reglas
- Agenda solo entre ${startDate} y los próximos ${days} dias.
- Usa horarios de trabajo entre 08:00 y 19:00.
- Crea tareas necesarias, bloques de analisis, reuniones con personas correctas y reservas de deep work.
- Si no hay nombres de personas, no inventes. Puedes usar "equipo" en la descripcion.
- Si no hay hora exacta, decide una hora razonable.
- Tipos permitidos: recordatorio, cita, pago, otro.
- Devuelve solo JSON valido.

Devuelve SOLO JSON con este formato:
{
  "events": [
    {
      "title": "string",
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "type": "recordatorio|cita|pago|otro",
      "description": "string"
    }
  ],
  "rationale": "string"
}`;

  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: { maxOutputTokens: 1024 },
  });

  const result = await model.generateContent(prompt);
  const responseText =
    result.response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!responseText) {
    throw new Error("No response from Gemini");
  }

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse agenda JSON");
  }

  return JSON.parse(jsonMatch[0]) as AgendaPlanResult;
}
