/**
 * Optimized prompt templates with compression
 * Using encoded short forms for repeated instructions
 */

// §0 = Sistema de identidad y tono (reemplaza 40+ tokens)
export const POLO_IDENTITY = `Eres Polo, analista financiero conciso. Responde EN ESPAÑOL.
§0: [Profesional|Objetivo|Accionable|Markdown|Clara estructura]`;

// §1 = Reglas de formato (reemplaza 35+ tokens)
export const FORMAT_RULES = `§1: [JSON válido|5 métricas máx|Why + Trend para cada|Concreto|Alternativas c/trade-offs]`;

// §2 = Análisis de datos (reemplaza 25+ tokens)
export const DATA_CONTEXT = `§2: [Última semana|Datos locales+nube|Series temporales|Cambios respecto baseline]`;

/**
 * Compressed system prompt for chatbot
 * Original: ~180 tokens → Optimized: ~80 tokens (55% reduction)
 */
export const CHATBOT_SYSTEM = `${POLO_IDENTITY}
Formato: Markdown con encabezados, listas, negrita, código.
§0 explica: profesional, objetivo, conciso, accionable, sin texto fuera de Markdown.`;

/**
 * Compressed prompt for report generation
 * Original: ~320 tokens → Optimized: ~140 tokens (56% reduction)
 */
export const REPORT_TEMPLATE = (summary: string) => `${POLO_IDENTITY}

Reporte ejecutivo: ¿qué pasó? ¿por qué? → Impacto → Decisión → Si no actúas?

Datos (último mes):
${summary}

${FORMAT_RULES}

Devuelve SOLO JSON:
{
  "executiveSummary": {"facts":["..."],"impact":"...","recommendation":"..."},
  "context": {"changes":"...","since":"...","affected":"..."},
  "metrics": [{"name":"...","value":"...","why":"...","trend":"..."}],
  "rootCause": {"analysis":"...","evidence":"..."},
  "businessImpact": "...",
  "recommendation": {"action":"...","priority":"...","expectedImpact":"..."},
  "alternatives": [{"option":"...","impact":"...","risk":"...","time":"..."}],
  "nextSteps": [{"owner":"...","what":"...","when":"...","note":"..."}],
  "risksIfNoAction": "..."
}`;

/**
 * Compressed prompt for sales insights
 * Original: ~200 tokens → Optimized: ~90 tokens (55% reduction)
 */
export const SALES_INSIGHTS_TEMPLATE = (stats: {
  avgDaily: number;
  trend: string;
  volatility: number;
  seasonality: string;
}) => `${POLO_IDENTITY}

Analiza: Prom diario $${stats.avgDaily.toFixed(2)} | Tend: ${stats.trend} | Vol: ${stats.volatility.toFixed(1)} | Patrón: ${stats.seasonality}

Devuelve 1-2 frases resumen, 1 fortaleza, 2-3 preocupaciones, 2-3 oportunidades.

${FORMAT_RULES}

JSON: {"summary":"...","strength":"...","concerns":["..."],"opportunities":["..."]}`;

/**
 * Compressed prompt for period comparison
 * Original: ~180 tokens → Optimized: ~75 tokens (58% reduction)
 */
export const PERIOD_COMPARISON_TEMPLATE = (
  p1: { avg: number; trend: string },
  p2: { avg: number; trend: string },
) => `${POLO_IDENTITY}

Compara: P1 (Prom ${p1.avg.toFixed(2)} | Tend ${p1.trend}) vs P2 (Prom ${p2.avg.toFixed(2)} | Tend ${p2.trend})

¿Qué cambió? 2-3 frases + % crecimiento.

JSON: {"comparison":"...","growth":NUMBER}`;

/**
 * Compressed prompt for sales forecast
 * Original: ~450 tokens → Optimized: ~180 tokens (60% reduction)
 */
export const SALES_FORECAST_TEMPLATE = (analysisText: string) =>
  `${POLO_IDENTITY}

Forecast de ventas (datos adjuntos):
${analysisText}

${DATA_CONTEXT}

Predice próximos días. Formato JSON:
{
  "forecast": [{"day":"YYYY-MM-DD","predictedAmount":NUMBER,"confidence":0.0-1.0}],
  "confidence": 0.0-1.0,
  "analysis": "...",
  "recommendations": ["..."]
}`;

/**
 * Post generation template
 * Optimized for social media (concise)
 */
export const POST_GENERATION_TEMPLATE = (context: string) => `${POLO_IDENTITY}

Red social (detalles adjuntos):
${context}

Post: [Atractivo|Corto|CTA claro|Emojis si aplica]

JSON: {"post":"...","hashtags":["..."],"tone":"..."}`;

/**
 * Dictionary for token optimization
 * Use these codes in prompts to replace longer phrases
 */
export const TOKEN_CODES = {
  "§0": "Sistema [Profesional|Objetivo|Accionable|Markdown|Clara estructura]",
  "§1": "[JSON válido|5 métricas máx|Why + Trend|Concreto|Alternativas c/trade-offs]",
  "§2": "[Última semana|Datos locales+nube|Series temporales|Cambios respecto baseline]",
  "§3": "Análisis de negocio: impacto, recomendación, alternativas",
  "§4": "Respuesta concisa en español, sin fluff",
} as const;
