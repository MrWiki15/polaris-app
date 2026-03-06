import { GoogleGenerativeAI } from "@google/generative-ai";
import { REPORT_TEMPLATE } from "./promptConfig";
import { executiveReportCache } from "./cache";
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

  // Check cache before API call
  const cached = executiveReportCache.get(summary);
  if (cached) {
    console.log("[CACHE HIT] Executive report reused (saved ~800 tokens)");
    return cached;
  }

  const prompt = REPORT_TEMPLATE(summary); // Optimized: 56% smaller prompt

  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      maxOutputTokens: 1800, // Reduced from 2400 (save 600 tokens)
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
    const report = JSON.parse(unfenced) as ExecutiveReport;

    // Cache the report (estimated ~800 tokens for JSON response)
    executiveReportCache.set(summary, report, 800);

    return report;
  } catch (parseError) {
    console.log(parseError);
    const jsonMatch = unfenced.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse executive report JSON");
    }
    return JSON.parse(jsonMatch[0]) as ExecutiveReport;
  }
}
