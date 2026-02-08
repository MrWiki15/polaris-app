# 🏗️ Arquitectura Visual: Predicción de Ventas con Gemini

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                     PROYECCIONES.TSX                        │
│                   (React Component Page)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     Simulador Manual (EXISTENTE)                   │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ [Slider] Aumentar Ventas                           │  │
│  │ [Slider] Reducir Gastos                            │  │
│  │ [AreaChart] Proyección 6 meses                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     AISalesForecast Component (NUEVO)             │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ • Gráfico combinado: histórico + predicción        │  │
│  │ • Cards de métricas                                │  │
│  │ • Análisis de IA                                   │  │
│  │ • Recomendaciones                                  │  │
│  │ • Insights del negocio                             │  │
│  │ • Indicador de confianza                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   use-sales-prediction Hook (React Query)         │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ queryFn: predictSales(sales, daysAhead)           │  │
│  │ staleTime: 3600000 (1 hour cache)                 │  │
│  │ enabled: sales.length >= 7                        │  │
│  │ retry: 2                                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                 │
└──────────────────────────┼─────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────────┐
        │   salesPredictor.ts (LIB)           │
        ├──────────────────────────────────────┤
        │                                      │
        │ predictSales(sales, daysAhead)      │
        │  ├─ analyzeTimeSeries()             │
        │  │  ├─ calcular avgDaily            │
        │  │  ├─ calcular volatility          │
        │  │  ├─ detectar trend               │
        │  │  └─ detectar seasonality         │
        │  ├─ createAnalysisPrompt()          │
        │  ├─ getGeminiClient()               │
        │  ├─ model.generateContent()         │
        │  ├─ parsear respuesta JSON          │
        │  └─ retornar PredictionResult       │
        │                                      │
        │ getSalesInsights(sales)             │
        │  └─ análisis de fortalezas/riesgos  │
        │                                      │
        │ comparePeriods(p1, p2)              │
        │  └─ comparar dos períodos           │
        │                                      │
        └──────────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────────┐
        │  @google/generative-ai (SDK)        │
        ├──────────────────────────────────────┤
        │                                      │
        │ GoogleGenerativeAI(apiKey)          │
        │   └─ getGenerativeModel()           │
        │      └─ model: "gemini-1.5-flash"   │
        │         └─ generateContent(prompt)  │
        │                                      │
        └──────────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────────┐
        │   Google Gemini 1.5 Flash API      │
        │  (CLOUD - AI PREDICTIONS)           │
        ├──────────────────────────────────────┤
        │                                      │
        │ POST https://generativelanguage...  │
        │                                      │
        │ Input:                               │
        │  • Sales historical data             │
        │  • Statistical analysis              │
        │  • Analysis prompt                   │
        │                                      │
        │ Processing:                          │
        │  • Analiza tendencias                │
        │  • Aplica ML models                  │
        │  • Genera forecasting                │
        │  • Crea recomendaciones              │
        │                                      │
        │ Output: JSON                         │
        │  {                                   │
        │    "forecast": [...],                │
        │    "confidence": 87,                 │
        │    "analysis": "..."                 │
        │    "recommendations": [...]          │
        │  }                                   │
        │                                      │
        └──────────────────────────────────────┘
            ↑         ↑         ↑         ↑
            │         │         │         │
      VITE_GOOGLE_AI_API_KEY
      (desde .env)
```

---

## Flujo de Datos Momento-a-Momento

```
PASO 1: Usuario navega a Proyecciones.tsx
┌─────────────────────────────────────────────────┐
│ Browser                                         │
│                                                 │
│ GET /proyecciones → React loads page            │
│                                                 │
│ Component: <AISalesForecast sales={sales} />   │
└─────────────────────────────────────────────────┘
                    ↓ (1-2ms)

PASO 2: Hook se ejecuta (React Query)
┌─────────────────────────────────────────────────┐
│ const { data, isLoading } = useSalesPrediction()│
│                                                 │
│ Checks:                                         │
│  ✓ ¿queryKey en caché? NO (primera vez)       │
│  ✓ ¿sales.length >= 7? SÍ                      │
│  ✓ Dispara queryFn: predictSales()             │
└─────────────────────────────────────────────────┘
                    ↓ (0ms, queremos)

PASO 3: Análisis Local (10-20ms)
┌─────────────────────────────────────────────────┐
│ analyzeTimeSeries(sales)                        │
│                                                 │
│ Input: [                                        │
│   {date: "2026-01-01", amount: 1200},         │
│   {date: "2026-01-02", amount: 1350},         │
│   ...                                          │
│   {date: "2026-02-07", amount: 1280}          │
│ ]                                              │
│                                                 │
│ Calcula:                                        │
│  • avgDaily = 1200                             │
│  • volatility = 200                            │
│  • trend = "growing" (12%)                     │
│  • seasonality = "moderate"                    │
│                                                 │
│ Output: TimeSeriesAnalysis                     │
│         {avgDaily, volatility, trend, ...}     │
└─────────────────────────────────────────────────┘
                    ↓ (2ms)

PASO 4: Crear Prompt (2-5ms)
┌─────────────────────────────────────────────────┐
│ createAnalysisPrompt(sales, analysis, 30)      │
│                                                 │
│ Genera:                                         │
│ """                                             │
│ You are an expert financial analyst...          │
│                                                 │
│ ## Sales Data Analysis:                         │
│ - Total records: 90 days                       │
│ - Average daily sales: $1,200                  │
│ - Volatility: $200                             │
│ - Trend: GROWING (↑12%)                        │
│ - Recent 30 days: [...diez registros...]      │
│                                                 │
│ ## Task:                                        │
│ Forecast next 30 days                          │
│                                                 │
│ Return JSON with:                              │
│ {forecast: [...], confidence: NUM, ...}        │
│ """                                             │
│                                                 │
│ String size: ~2000 chars = ~500 tokens        │
└─────────────────────────────────────────────────┘
                    ↓ (5-10ms - Network)

PASO 5: Llamada a Google Gemini (10-30 segundos)
┌─────────────────────────────────────────────────┐
│ Browser (Client-side)                           │
│                                                 │
│ const client = new GoogleGenerativeAI(apiKey)  │
│ const model = client.getGenerativeModel({      │
│   model: "gemini-1.5-flash"                    │
│ })                                              │
│                                                 │
│ const result = await model.generateContent({   │
│   prompt: analysisPrompt                       │
│ })                                              │
│                                                 │
│ Network:                                        │
│  POST /v1beta/models/gemini-1.5-flash:         │
│       generateContent                          │
│                                                 │
│  Headers:                                       │
│   x-goog-api-key: VITE_GOOGLE_AI_API_KEY      │
│   Content-Type: application/json               │
│                                                 │
│  Body: {contents: [...], ...}                 │
│  Size: ~3KB                                    │
│                                                 │
│  Response: ~2KB JSON                           │
│  Time: 10-30s (Gemini processing)             │
└─────────────────────────────────────────────────┘
                    ↓

PASO 6: Google Process (Server-side, opaque)
┌─────────────────────────────────────────────────┐
│ Google Cloud / Gemini Servers                   │
│                                                 │
│ 1. Recibe request                              │
│ 2. Tokeniza prompt (~2000 tokens)              │
│ 3. Ejecuta modelo Gemini 1.5 Flash             │
│ 4. Genera predicción (~800 tokens)             │
│ 5. Convierte a JSON                            │
│ 6. Retorna a cliente                           │
│                                                 │
│ Tiempo: 10-30s                                 │
│ Costo: $0.0004                                 │
│ Rate Limit: 15 RPM (por IP/key)               │
└─────────────────────────────────────────────────┘
                    ↓ (Respuesta)

PASO 7: Parsear Respuesta (5-10ms)
┌─────────────────────────────────────────────────┐
│ responseText = result.response.candidates[0]   │
│                            .content.parts[0]   │
│                            .text               │
│                                                 │
│ responseText podría ser:                       │
│ "Here's the analysis: {..."                    │
│  ↓ (removePrefix)                              │
│ "{\"forecast\": [...], \"confidence\": 87}"    │
│                                                 │
│ jsonMatch = responseText.match(/\{[\s\S]*\}/)  │
│  ↓ Extrae componente JSON                      │
│                                                 │
│ forecastData = JSON.parse(jsonMatch[0])       │
│                                                 │
│ Output:                                         │
│ {                                              │
│   forecast: [                                  │
│     {day: 1, predictedAmount: 1320},          │
│     {day: 2, predictedAmount: 1380},          │
│     ... 28 más ...                            │
│   ],                                           │
│   confidence: 87,                              │
│   analysis: "Tendencia creciente...",         │
│   recommendations: [...]                      │
│ }                                              │
└─────────────────────────────────────────────────┘
                    ↓ (2-3ms)

PASO 8: React Query Cachea (0ms)
┌─────────────────────────────────────────────────┐
│ React Query                                     │
│                                                 │
│ Almacena en memoria:                           │
│  queryKey: ["sales-prediction", 90, 30]        │
│  data: PredictionResult                        │
│  timestamp: Date.now()                         │
│  staleTime: 3600000 (1 hour)                   │
│                                                 │
│ Próximas llamadas con mismos params            │
│  → Serve from cache (< 1ms)                    │
│                                                 │
│ Si >1 hour:                                    │
│  → Mark as 'stale' (aviso)                     │
│  → Sigue sirviendo desde cache                 │
│  → En background: puede revalidate             │
└─────────────────────────────────────────────────┘
                    ↓ (0-100ms)

PASO 9: React Re-render (100-200ms)
┌─────────────────────────────────────────────────┐
│ AISalesForecast Component                      │
│                                                 │
│ Recibe:                                         │
│  forecast: {dates, predicted, confidence, ...} │
│  insights: {summary, strength, concerns, ...}  │
│                                                 │
│ Prepara datos para gráfico:                    │
│  const chartData = [                           │
│    {date: "Jan 09", historical: 1100},        │
│    {date: "Jan 10", historical: 1350},        │
│    ...                                         │
│    {date: "Feb 09", predicted: 1320},         │
│    ...                                         │
│  ]                                             │
│                                                 │
│ Renderiza:                                      │
│  ✓ ComposedChart con 2 lineas                  │
│  ✓ MetricBox x 4 (promedio, total, conf, rec) │
│  ✓ Analysis card azul                          │
│  ✓ Insights card amarilla                      │
│                                                 │
│ Tiempo: 100-200ms (React render)              │
│ Browser repaint: 16ms (60fps)                 │
└─────────────────────────────────────────────────┘
                    ↓

PASO 10: Usuario Ve Resultado (0s)
┌─────────────────────────────────────────────────┐
│ Proyecciones.tsx                               │
│                                                 │
│ ✓ Gráfico histórico + predicción               │
│ ✓ Métricas en cards                            │
│ ✓ Análisis de IA                               │
│ ✓ Recomendaciones accionables                  │
│ ✓ Insights del negocio                         │
│ ✓ Confianza: 87%                               │
│                                                 │
│ Total time: 15-30 segundos                     │
│  - Análisis local: 20ms                        │
│  - Request: 5KB                                │
│  - Gemini AI: 10-30s                           │
│  - Parse: 5-10ms                               │
│  - React render: 100-200ms                     │
│  - Browser display: 16ms                       │
│                                                 │
│ SIGUIENTE VEZ (caché):                         │
│  - Total: <200ms                               │
│  - Instantáneo visualmente                     │
│  - Válido por 1 hora                           │
└─────────────────────────────────────────────────┘
```

---

## Stack Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Proyecciones.tsx (Page)                                   │
│      │                                                     │
│      └─ AISalesForecast.tsx (Component)                    │
│          ├─ LineChart/ComposedChart (Recharts)            │
│          └─ Cards, Alerts, Typography (UI)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT LAYER                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  React Query (@tanstack/react-query)                       │
│      │                                                     │
│      ├─ useQuery({ queryKey, queryFn, ... })             │
│      ├─ Automatic caching (staleTime)                     │
│      ├─ Background revalidation                           │
│      └─ Loading/Error states                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Hooks: use-sales-prediction.ts                            │
│      │                                                     │
│      ├─ useSalesPrediction(sales, daysAhead)             │
│      ├─ useSalesInsights(sales)                          │
│      └─ useSalesComparison(p1, p2)                       │
│                                                             │
│  Lib: salesPredictor.ts                                    │
│      │                                                     │
│      ├─ predictSales()                                    │
│      ├─ analyzeTimeSeries()                               │
│      ├─ getSalesInsights()                                 │
│      ├─ comparePeriods()                                  │
│      └─ generateFutureDates()                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    AI/ML SERVICE LAYER                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  @google/generative-ai SDK                                │
│      │                                                     │
│      ├─ GoogleGenerativeAI(apiKey)                        │
│      ├─ getGenerativeModel(config)                        │
│      └─ generateContent(prompt)                           │
│                                                             │
│  Local Statistics (CPU):                                   │
│      ├─ Averages (mean)                                   │
│      ├─ Volatility (std dev)                              │
│      ├─ Trend detection                                   │
│      └─ Seasonality analysis                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL API LAYER (Google)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Google Cloud Platform:                                    │
│                                                             │
│  POST https://generativelanguage.googleapis.com            │
│      /v1beta/models/gemini-1.5-flash:generateContent     │
│                                                             │
│  • TLS 1.3 Encryption                                      │
│  • JSON RPC Protocol                                       │
│  • Rate Limit: 15 RPM                                      │
│  • Latency: 10-30s                                         │
│  • Availability: 99.95% SLA                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Cache Strategy Diagram

```
                    useSalesPrediction(sales, daysAhead)
                                  │
                                  ↓
                    ┌─────────────────────────┐
                    │ React Query useQuery()  │
                    └────────────┬────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ↓                           ↓
           In-Memory Store?                (No)
                  (Yes) ↓                       │
          ┌───────────────────┐                │
          │ Is Still Fresh?   │                │
          │ (staleTime?)      │                │
          └───┬──────────┬────┘                │
             Yes│        │No                   │
              ↓ │    ┌────────────┐            │
           Return │    │ Serve from│            │
          Cached  │    │cache but  │            │
          Data    │    │mark stale │            │
          (0ms)   │    │(0ms)       │            │
                  │    └──┬─────────┘            │
                  │       │                     │
                  │       └──────────┬──────────┘
                  │                  ↓
                  │        ┌─────────────────────┐
                  │        │ Run queryFn:        │
                  │        │ predictSales()      │
                  │        └────────────┬────────┘
                  │                     │
                  │                     ↓
                  │              Gemini API Call
                  │              (10-30 seconds)
                  │                     │
                  │                     ↓
                  │        ┌─────────────────────┐
                  │        │ Update Cache:       │
                  │        │ - Store result      │
                  │        │ - Set staleTime     │
                  │        │ - Trigger rerender  │
                  │        └────────────┬────────┘
                  │                     │
                  └─────────────┬───────┘
                                ↓
                    ┌─────────────────────┐
                    │ Return data to      │
                    │ component           │
                    │ isLoading = false   │
                    └─────────────────────┘
                                │
                                ↓
                        React renders UI
                        ✓ Gráfico con predicción
                        ✓ Análisis IA
                        ✓ Recomendaciones


TIMELINE COMPARACION:

Primera vez (User A):
│ Tiempo:  0ms ──────────────────────────── 25s
│ Action:  [Analizar] ──[Llamar Google]──[Render]
│ Cache:   (vacio)

Segundo request rápido (User A, 1 min después):
│ Tiempo:  0ms ────────── 100ms
│ Action:  [Cache hit] ──[Render]
│ Cache:   (válido)

Segunda hora (User A, 70 min después):
│ Tiempo:  0ms ────────── 100ms
│ Action:  [Serve stale] ──[Render]
│ Cache:   (stale, pero válido)
│ Background: → Revalidate (nuevo request a Gemini)

Después de 1 hora (cache expirado):
│ Tiempo:  0ms ──────────────────────────── 25s
│ Action:  [Analizar] ──[Llamar Google]──[Render]
│ Cache:   (borrado de memoria)
```

---

## Integración con Existentes

```
AppContext.tsx (Existing)
    │
    ├─ data.sales      ← Consumido por AISalesForecast
    ├─ data.settings
    └─ currentProject
        │
        └─ Proyecciones.tsx (Modified)
            │
            ├─ Simulador Manual (EXISTING)
            │   ├─ Sliders
            │   └─ AreaChart 6 meses
            │
            └─ AISalesForecast (NEW)
                ├─ useSalesPrediction hook
                └─ Gemini Integration


React Router
    │
    └─ /proyecciones → Proyecciones component
                           │
                           └─ Renderiza ambas secciones:
                               ├─ Manual + Gráfico
                               └─ AI Forecast


TailwindCSS + Radix UI Components
    │
    ├─ Card, Button, etc (EXISTING)
    │
    └─ AISalesForecast uses:
        ├─ Card
        ├─ ComposedChart (Recharts)
        ├─ AlertCircle, Brain, Lightbulb icons
        └─ Tailwind classes
```

---

**Diagrama: Arquitectura Completa**  
Versión: 1.0  
Actualizado: Febrero 8, 2026
