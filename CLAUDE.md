# AI Lead Qualifier — Claude Code Configuration

Qualify sales leads instantly. A user fills out a form about a prospect, clicks "Analyze", and gets a full AI-generated qualification report: fit score, verdict, red flags, follow-up actions, and recommended pitch angle.

---

## The WAT Framework

| Letter | Stands For | Role | Location |
|--------|------------|------|----------|
| **W** | Workflows | Step-by-step procedure files that define what to do and in what order | `workflows/` |
| **A** | Agent | Claude Code — reads workflows, reasons about steps, executes them | *(you are here)* |
| **T** | Tools | Scripts and integrations the agent calls to get things done | `tools/` |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Next.js · Vercel)                            │
│  frontend/                                              │
│  ├── app/page.tsx            ← Lead form + results UI   │
│  └── app/api/qualify/route.ts ← Server route (secure)  │
└────────────────────┬────────────────────────────────────┘
                     │ POST lead data (server-side)
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Backend (Trigger.dev)                                  │
│  backend/src/trigger/qualify-lead.ts                    │
│  ├── Validate input (Zod)                               │
│  ├── Call AI model (OpenRouter / gpt-4o)                │
│  └── Return qualification report JSON                   │
└─────────────────────────────────────────────────────────┘
```

**Communication flow:**
1. Browser submits form → `POST /api/qualify` (Next.js server route)
2. Server route triggers `qualify-lead` task on Trigger.dev → receives `runId`
3. Server route polls Trigger.dev until run is `COMPLETED`
4. Full report JSON returned to browser → `ResultsPanel` renders it

---

## Folder Structure

```
ai-lead-qualifier/
├── CLAUDE.md                   ← this file
├── .gitignore
├── workflows/                  ← W: procedure files
│   └── qualify-lead.md         ← how to run the qualifier manually
├── tools/                      ← T: scripts and integrations
│   └── README.md
├── temp/                       ← ephemeral scratch (gitignored)
│   ├── outputs/                ← generated reports
│   └── resources/              ← staged lead data files
├── backend/                    ← Trigger.dev project
│   ├── trigger.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                    ← local secrets (gitignored)
│   ├── .env.example
│   └── src/
│       ├── trigger/
│       │   └── qualify-lead.ts ← the AI qualification task
│       └── lib/
│           └── env.ts          ← centralized env loader
└── frontend/                   ← Next.js app
    ├── app/
    │   ├── page.tsx            ← lead form + results
    │   └── api/qualify/
    │       └── route.ts        ← server route to Trigger.dev
    ├── components/
    │   ├── LeadForm.tsx
    │   └── ResultsPanel.tsx
    ├── package.json
    └── .env.local              ← secrets (gitignored)
```

---

## Lead Form Fields

| Field | Type | Options / Notes |
|-------|------|-----------------|
| `companyName` | text | required |
| `industry` | text | required |
| `companySize` | select | `<10` / `10–50` / `50–200` / `200+` |
| `estimatedRevenue` | select | `<$1M` / `$1–10M` / `$10–50M` / `$50M+` |
| `painPoint` | textarea | What problem the lead described — required |
| `budget` | select | `No budget` / `Under $10k` / `$10–50k` / `$50k+` |
| `timeline` | select | `No timeline` / `6+ months` / `1–6 months` / `Immediate` |

---

## Qualification Output Schema

```typescript
interface QualificationReport {
  fitScore: number;                          // 0–100
  verdict: "Qualified" | "Nurture" | "Disqualify";
  executiveSummary: string;                  // 2–3 sentences
  redFlags: string[];                        // list of concerns
  followUpActions: string[];                 // 3 concrete next steps
  pitchAngle: string;                        // recommended messaging
}
```

**Verdict thresholds (guideline):**
- `Qualified` — fitScore ≥ 70
- `Nurture` — fitScore 40–69
- `Disqualify` — fitScore < 40

---

## Environment Variables

### Backend — set in Trigger.dev dashboard (Prod environment)
| Variable | Purpose |
|----------|---------|
| `OPENROUTER_API_KEY` | AI model calls (gpt-4o via OpenRouter) |

### Frontend — set in Vercel environment variables
| Variable | Purpose |
|----------|---------|
| `TRIGGER_SECRET_KEY` | Authenticate calls to Trigger.dev API — **server-side only, never exposed to browser** |
| `TRIGGER_PROJECT_REF` | Project ID from `backend/trigger.config.ts` |

### Local development
- `backend/.env` — copy from `.env.example`, add `TRIGGER_SECRET_KEY` + `OPENROUTER_API_KEY`
- `frontend/.env.local` — add `TRIGGER_SECRET_KEY` + `TRIGGER_PROJECT_REF`

---

## Key Commands

```bash
# Backend (Trigger.dev)
cd backend
npm run dev:trigger        # local dev worker
npm run deploy:trigger     # deploy to prod

# Frontend (Next.js)
cd frontend
npm run dev                # http://localhost:3000
npm run build              # verify production build
```

---

## Deployment

| Service | How |
|---------|-----|
| **Frontend** | Push to `main` → Vercel auto-deploys |
| **Backend** | Push to `main` → GitHub Action runs `trigger.dev deploy` |

Both services are connected to the same GitHub repo. Vercel root directory is set to `frontend/`. The GitHub Action deploys from `backend/`.

---

## Code Conventions

Reuse patterns from Phase 3 (`../Phase 3/phase3-automations/`):

- **Env loading**: centralized `src/lib/env.ts` with `require()` / `optional()` getters
- **Logging**: `logger.info("Step N: description", { ...data })` at every major step
- **Input validation**: Zod schema on the Trigger.dev task payload
- **Error handling**: try-catch per step, log error, re-throw or continue depending on criticality
- **Retry config**: `maxAttempts: 3`, `factor: 2`, `minTimeoutInMs: 30000`, `maxTimeoutInMs: 120000`
- **Task location**: all Trigger.dev tasks in `backend/src/trigger/`

---

## How to Run a Workflow

1. Open a file in `workflows/` that describes the task.
2. Tell Claude: _"Run the [workflow name] workflow"_ or paste the steps directly.
3. Claude reads the procedure, calls tools in `tools/`, writes results to `temp/outputs/`.

> `temp/` is session-scoped scratch space. Clear it between sessions or treat contents as disposable.
