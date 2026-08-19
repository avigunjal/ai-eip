# Module 0 — AI Provider Integration

Status: IMPLEMENTED

## Goal

Introduce a **provider-agnostic AI layer**, with **OpenRouter (free models) as the primary provider** and **xAI Grok as the optional/secondary provider**, while keeping AI-EIP fully functional without an LLM.

The AI layer must **augment the existing deterministic intelligence**, not replace it.

Core principle:

> Deterministic services calculate scores, risks, evidence, recommendations, and confidence.
> The LLM explains and summarizes those results.

### Architecture

```text
React Frontend
      │
      ▼
AI Controller
      │
      ▼
AI Service
 ┌────┴────────────────────┐
 │                         │
 ▼                         ▼
Deterministic          LLM Provider
Engine                      │
 │                     ┌────┴─────┐
 │                     │          │
 ▼                     ▼          ▼
Scores / Evidence /  OpenRouter  xAI Grok
Recommendations      (free)      (optional)
      │
      └──────────────┐
                     ▼
                 AI Context
                     │
                     ▼
                LLM Explanation
```

The LLM must never modify deterministic scores, evidence, risk severity, or recommendations.

---

# 1. AI Providers

The service layer is provider-agnostic. The application only knows high-level methods
(`analyzeProject`, `explainInsights`, `explainComposition`); it never cares which provider runs underneath.

```text
ai.service.js
      ↓
llm.provider.js
      ↓
┌───────────────┬───────────────┐
│               │               │
openrouter    xai.provider.js
.provider.js    (Grok)
```

- **Primary: OpenRouter** — `openrouter/free` Free Models Router, $0 token cost, no credit card required for free models.
- **Optional: xAI Grok** — Responses API, billed per token (pay-as-you-go, no free allowance). Use only if an existing key has usable credits.

> Important: xAI's consumer/Grok free usage does not mean the xAI API is free. Treat API usage as
> potentially billable. `AI_ENABLED=false` and deterministic fallback must always work.

### Provider Request Policy (xAI)

- Use the Responses API: `POST https://api.x.ai/v1/responses`
- **Hard-coded `store: false`** on every request (not an env var). xAI defaults to storing requests for
  30 days; AI-EIP sends engineering/project intelligence, so server-side storage is disabled explicitly.
- No `previous_response_id`, no server-side conversation state. Every request is independently grounded
  via compact context.
- No tools / web search / RAG in Module 0.
- Structured output via `text.format: { type: 'json_schema', ... }`; parse `output[].content[].text`.

### Provider Request Policy (OpenRouter)

- OpenAI-compatible endpoint: `POST https://openrouter.ai/api/v1/chat/completions`
- Model from `OPENROUTER_MODEL` (default `openrouter/free`); the router auto-selects a free model that
  supports the requested features (including structured outputs) and reports the model actually used.
- Best-effort `response_format: { type: 'json_object' }` — some free models do not enforce schemas, so
  **every LLM response is validated/coerced server-side; invalid output falls back to deterministic**.
- Optional `HTTP-Referer` / `X-Title` attribution headers.

### Common policy (both providers)

- Global `fetch`, **20-second timeout**, `max_tokens` cap (~500), compact grounded context only.
- Never log API keys; keys are backend-only, never returned to the client.
- Handle non-2xx, network failures, malformed responses, 402/429 (honor `Retry-After`).
- Validate response against expected schema; throw provider errors to the AI service.
- Never allow provider failure to break the application.

---

# 2. Configuration

### `backend/src/config/env.config.js`

```text
aiEnabled          (AI_ENABLED === 'true')
aiProvider         (AI_PROVIDER || 'openrouter')
openrouterApiKey   (OPENROUTER_API_KEY || '')
openrouterModel    (OPENROUTER_MODEL || 'openrouter/free')
xaiApiKey          (XAI_API_KEY || '')
xaiModel           (XAI_MODEL || 'grok-4.5')
```

### `backend/.env.example`

```text
AI_ENABLED=false
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openrouter/free
XAI_API_KEY=
XAI_MODEL=grok-4.5
```

Never expose `OPENROUTER_API_KEY` or `XAI_API_KEY` to React.

---

# 3. Provider Layer

Directory:

```text
backend/src/modules/ai/

├── ai.service.js
├── ai.controller.js
├── ai.routes.js
├── llm.provider.js
├── openrouter.provider.js
├── xai.provider.js
└── context.js
```

## Provider interface

```js
{
  name,        // 'openrouter' | 'xai'
  model,       // resolved model id
  complete(system, user, { maxTokens })
}
```

`complete()` returns parsed, validated structured content as a plain object.

## `llm.provider.js` (registry)

```text
registerProvider(name, factory)
getLLMProvider()
isAIEnabled()
```

- `isAIEnabled()` returns true **only** when `AI_ENABLED=true` **and** the selected provider's key is
  present **and** the provider is registered. Unknown/absent provider ⇒ disabled (never throws).
- `getLLMProvider()` selects by `env.aiProvider`.

## `openrouter.provider.js`

`createOpenRouterProvider({ apiKey, model })` — chat completions, 20s timeout, `response_format`
best-effort, non-2xx/network/malformed handling, JSON parse + validate.

## `xai.provider.js`

`createXaiProvider({ apiKey, model })` — Responses API, **`store: false` hard-coded**, `input` (not
`messages`), `max_output_tokens`, `text.format.json_schema`, parse `output[].content[].text`.

---

# 4. Structured AI Output

Use structured JSON Schema output rather than relying on free-form JSON.

Example project analysis:

```json
{
  "summary": "string",
  "findings": ["string"],
  "recommendedActions": ["string"],
  "confidence": 0
}
```

The schema enforces required fields, correct types, bounded confidence (0–100), and arrays for
findings/actions. Output is validated and coerced server-side (strings, arrays, confidence clamp);
invalid output falls back to the deterministic result. The LLM output is **advisory content only**.

---

# 5. AI Context Builder

## `context.js`

Never send the entire database/project object to the LLM. Build compact, relevant context.

- **Project context**: name, health, delivery confidence, status, top 3 risk drivers, relevant evidence,
  top 3 knowledge risks, top 3 project risks, team/capacity.
- **Insights context**: top 5 insights, severity, score, evidence, drivers, recommended actions, assumptions.
- **Composition context**: project, required skills, recommended team, coverage score, team capacity,
  open risks, alternatives, deterministic rationale.

---

# 6. AI Service

## `ai.service.js`

Main orchestration layer. Must always execute safely regardless of AI availability.

Flow for every use case:

```text
cache lookup
     ↓
cached?
 ├── yes → return
 └── no
      ↓
in-flight?
 ├── yes → await existing Promise
 └── no
      ↓
deterministic intelligence → compact context
      ↓
AI enabled?
 ├── NO → deterministic explanation (source: deterministic)
 └── YES → LLM call
              ↓
         validate/coerce
              ↓
         cache result
```

## Request Deduplication

Three layers:

1. **5-minute completed-result cache** (in-memory).
2. **In-flight per-key Promise deduplication** — concurrent duplicate calls share one upstream request
   (1 API call, N callers get the same result). Entry removed in `finally` so failures never poison the key.
3. **Frontend loading state** (prevents normal double-clicks).

```js
const inFlight = new Map();

async function dedupe(key, factory) {
  if (inFlight.has(key)) return inFlight.get(key);
  const promise = factory();
  inFlight.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}
```

Cache keys:

```text
project-analysis:{projectId}
insight-explanation:all
composition-explanation:{projectId}
```

No Redis required for the hackathon.

---

# 7. Use Case 1 — Project AI Analysis

### Endpoint

```http
POST /api/ai/analyze/project/:projectId
```

Flow:

```text
Project ID → load project → deterministic intelligence → compact context
   → AI enabled?  NO → deterministic explanation
   → YES → LLM → validate → analysis
```

Unknown project:

```text
404
```

### Response

```json
{
  "analysis": {
    "projectId": "pr-07",
    "source": "llm",
    "provider": "openrouter",
    "model": "openrouter/free (actual model)",
    "generatedAt": "...",
    "summary": "...",
    "findings": [],
    "recommendedActions": [],
    "confidence": 60,
    "evidence": [{ "id": "r-02", "type": "risk", "summary": "Single SME owns Payment Service knowledge" }]
  }
}
```

`confidence` is the LLM's self-assessment of its analysis grounding (the UI labels it
`AI ANALYSIS CONFIDENCE`) and never overwrites the deterministic engineering `confidence`. The
`evidence` array lists the specific deterministic signals the LLM reasoned from.

Fallback (`source: "deterministic"`, `provider: null`, `model: null`) — `confidence` is null (a
deterministic analysis has no LLM grounding to self-assess; delivery confidence stays on the project
KPIs); `evidence` derived from the project's risk drivers.

---

# 8. Use Case 2 — AI Insight Explanation

### Endpoint

```http
POST /api/ai/explain/insights
```

The deterministic insight calculation always runs first (`listInsights()`). The LLM only explains
finding / why / evidence / impact / recommended action. It must not change severity, score, evidence,
confidence, or the underlying calculation.

Response: `{ insights, source, provider, model }` with a per-insight `explanation` attached. When
deterministic, the existing `summary` is used as the explanation.

---

# 9. Use Case 3 — AI Composer Explanation

### Endpoint

```http
POST /api/ai/explain/composition
```

Request:

```json
{ "projectId": "pr-07" }
```

Flow:

```text
Project → deterministic team composition → display recommendation
   → user clicks "Explain with AI" → LLM → AI explanation
```

**Do NOT automatically call the LLM when the Composer page loads.** The deterministic recommendation
loads normally; the LLM is only called after an explicit user action. This reduces cost and makes the AI
capability obvious during the demo. Unknown project ⇒ 404.

---

# 10. Response Source Contract

Every AI-enabled response clearly identifies its source.

```json
{ "source": "llm", "provider": "openrouter", "model": "..." }
{ "source": "deterministic", "provider": null, "model": null }
```

Frontend labels:

```text
✦ AI · {model}
Deterministic · Engineering signals
```

---

# 11. Cost Protection

- No AI calls on normal page load; explicit user-triggered AI calls only.
- Compact context; maximum output tokens (~500); 20-second timeout.
- 5-minute cache + in-flight dedupe + frontend loading state.
- Deterministic fallback on any provider failure.
- Never send the entire database, secrets, or unnecessary records.
- OpenRouter free tier: 50 requests/day (20 RPM) without credits; explicit triggers + cache keep usage low.

---

# 12. Routes / Controller

Add (all under the existing `/api/ai` mount):

```http
POST /api/ai/analyze/project/:projectId
POST /api/ai/explain/insights
POST /api/ai/explain/composition
```

Keep existing endpoints unchanged:

```http
POST /api/ai/insights
GET  /api/ai/evidence/:entityId
```

Existing deterministic AI-EIP APIs must continue working.

---

# 13. Frontend Changes

## API client

Create `frontend/src/api/ai.js`, exported through `frontend/src/api/index.js`:

```js
analyzeProject(projectId)
explainInsights()
explainComposition(projectId)
```

## Project Detail

Add `[ Run AI Analysis ]` button in the header actions slot → calls `analyzeProject(projectId)` →
results panel with states idle / loading / success / error / deterministic fallback, and a source badge
(`✦ AI · model` vs `Deterministic · Engineering signals`).

## Insights

The existing "Why am I seeing this?" disclosure gains `[ Explain with AI ]` → per-insight `explanation`
(evidence / reasoning / impact). Keep the existing deterministic evidence visible.

## Composer

Deterministic recommendation unchanged. Add `[ Explain with AI ]` button → AI explanation
(why this team / trade-offs / expected impact / confidence). Stale explanation cleared on project switch.
If AI fails, show the deterministic rationale. No broken UI.

---

# 14. Tests

## Integration tests (`tests/integration/api.test.js`)

```text
POST /api/ai/analyze/project/pr-07 → 200, valid deterministic response when AI disabled
POST /api/ai/analyze/project/nope   → 404
POST /api/ai/explain/insights       → 200
POST /api/ai/explain/composition    → 200 (and 404 for unknown project)
```

## Unit tests (`tests/modules/llm.provider.test.js`)

```text
provider registration + selection (default openrouter, xai when configured)
isAIEnabled matrix (disabled / missing key / unknown provider → false)
openrouter request build + response parse
openrouter non-2xx / 429 / malformed / timeout (stubbed fetch, injectable timeoutMs)
xai request build (asserts store:false and input, not messages) + output[].content[].text parse
service fallback on provider throw
cache hit skips factory
in-flight dedupe: two concurrent calls → one factory invocation
```

Existing tests must remain green.

---

# 15. Verification

### Offline mode

```text
AI_ENABLED=false
```

All existing functionality works; AI endpoints return deterministic explanations.

### AI mode

```text
AI_ENABLED=true
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=<valid key>
OPENROUTER_MODEL=openrouter/free
```

Project → AI analysis; Insights → AI explanations; Composer → AI explanation after explicit click.

### Failure mode

Use an invalid API key. Expected: LLM fails → no 500 → deterministic fallback.

### Frontend

```text
npm run lint
npm run build
```

Verify `OPENROUTER_API_KEY` / `XAI_API_KEY` do not exist anywhere under `frontend/`.

---

# 16. Documentation

Update `backend/README.md`: AI env vars, provider architecture, OpenRouter + Grok configuration, AI
endpoints, deterministic fallback, caching/dedupe, cost protection, security considerations.

---

# 17. Out of Scope

Do NOT implement in Module 0: RAG, vector database, pgvector, embeddings, document ingestion, Jira /
GitHub / Slack integrations, Supabase migration, authentication changes, AI chatbot, autonomous agents,
AI-generated scores, AI-generated risk calculations, AI-driven team selection. The existing
deterministic intelligence remains the source of truth.

---

# 18. Implementation Order

1. Provider configuration (`env.config.js`, `.env.example`).
2. Provider abstraction (`llm.provider.js`, `openrouter.provider.js`, `xai.provider.js`).
3. Context builder (`context.js`).
4. AI service (`ai.service.js`) — `analyzeProject` first, then `explainInsights`, `explainComposition`.
5. Routes / controllers.
6. Project Detail frontend (full Project → API → context → LLM → React flow).
7. Insights explanation.
8. Composer explanation.
9. Caching + in-flight dedupe.
10. Tests (integration + unit).
11. Final regression: `npm test`, `npm run lint`, `npm run build`.

---

# Module 0 Success Criteria

- [x] Provider-agnostic layer with OpenRouter (primary) + xAI Grok (optional)
- [x] `store: false` hard-coded on all xAI Responses API requests
- [x] API keys backend-only
- [x] Structured JSON output validated/coerced; invalid ⇒ deterministic
- [x] Project AI analysis, Insights AI explanation, Composer AI explanation work
- [x] Composer AI call is explicitly user-triggered
- [x] Deterministic fallback works (no 500 on provider failure)
- [x] 5-minute cache + in-flight dedupe work (concurrent calls → 1 upstream request)
- [x] LLM cannot modify scores/evidence
- [x] AI source/provider/model visible in responses and UI
- [x] Existing tests remain green; frontend build succeeds
- [x] No RAG/vector DB; no API key exposed to frontend
