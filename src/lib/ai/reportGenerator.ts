import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AppData } from "@/lib/storage";

export type ExecutiveMetric = {
  name: string;
  value: string;
  why: string;
  trend?: string;
};

export type ExecutiveReport = {
  executiveSummary: {
    facts: string[];
    impact: string;
    recommendation: string;
  };
  context: {
    changes: string;
    since: string;
    affected: string;
  };
  metrics: ExecutiveMetric[];
  rootCause: {
    analysis: string;
    evidence: string;
  };
  businessImpact: string;
  recommendation: {
    action: string;
    priority: string;
    expectedImpact: string;
  };
  alternatives: {
    option: string;
    impact: string;
    risk: string;
    time: string;
  }[];
  nextSteps: {
    owner: string;
    what: string;
    when: string;
    note?: string;
  }[];
  risksIfNoAction: string;
};

function getGeminiClient() {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("API key missing. Add VITE_GOOGLE_AI_API_KEY to .env");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function generateExecutiveReport(params: {
  appData: AppData;
  summary: string;
}): Promise<ExecutiveReport> {
  const { summary } = params;

  const prompt = `Eres Polo, analista ejecutivo. Genera un reporte ejecutivo narrativo y accionable en espanol. Debe responder: que paso, por que paso, impacto, decision recomendada, y que pasa si no se actua.

## Resumen de datos (ultimo mes, data local + nube)
${summary}

## Reglas obligatorias
- Redacta en tono profesional, claro y directo.
- Maximo 5 metricas clave.
- Explica por que cada metrica importa.
- La recomendacion debe ser concreta, priorizada y accionable.
- Incluye alternativas con trade-offs.
- Devuelve SOLO JSON valido.

Devuelve SOLO JSON con este formato:
{
  "executiveSummary": {
    "facts": ["string"],
    "impact": "string",
    "recommendation": "string"
  },
  "context": {
    "changes": "string",
    "since": "string",
    "affected": "string"
  },
  "metrics": [
    {
      "name": "string",
      "value": "string",
      "why": "string",
      "trend": "string"
    }
  ],
  "rootCause": {
    "analysis": "string",
    "evidence": "string"
  },
  "businessImpact": "string",
  "recommendation": {
    "action": "string",
    "priority": "string",
    "expectedImpact": "string"
  },
  "alternatives": [
    {
      "option": "string",
      "impact": "string",
      "risk": "string",
      "time": "string"
    }
  ],
  "nextSteps": [
    {
      "owner": "string",
      "what": "string",
      "when": "string",
      "note": "string"
    }
  ],
  "risksIfNoAction": "string"
}`;

  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      maxOutputTokens: 2400,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(prompt);
  const candidate = result.response.candidates?.[0];
  if (candidate?.finishReason === "MAX_TOKENS") {
    throw new Error("Gemini response truncated. Try again.");
  }

  const responseText = candidate?.content?.parts?.[0]?.text;
  if (!responseText) {
    throw new Error("No response from Gemini");
  }

  const trimmed = responseText.trim();
  const unfenced = trimmed.startsWith("```")
    ? trimmed.replace(/^```[a-zA-Z]*\n/, "").replace(/```$/, "")
    : trimmed;

  try {
    return JSON.parse(unfenced) as ExecutiveReport;
  } catch (parseError) {
    const jsonMatch = unfenced.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse executive report JSON");
    }
    return JSON.parse(jsonMatch[0]) as ExecutiveReport;
  }
}
