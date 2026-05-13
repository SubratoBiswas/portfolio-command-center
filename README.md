# Trinamix Portfolio Command Center

An AI-powered portfolio operating system for Trinamix leadership — products, client
opportunities, projects, resources, meetings, action items, and risk in one place,
with a Chief-of-Staff AI that drafts updates and surfaces what needs attention.

This drop is the **full stack**: React frontend + NestJS API + PostgreSQL via Prisma,
plus an AI extraction pipeline that runs against either a built-in mock provider or
a real LLM (Anthropic provider stubbed and ready to wire).

---

## Quick start — three paths

### Path A: frontend only (zero config)

```bash
npm install
npm run dev               # → http://localhost:5173
```

The app boots against an in-memory mock backend (`src/data/seed.ts`) — realistic
Trinamix data, no Docker, no database. Best for design iteration.

### Path B: full stack, local

```bash
# 1. infra
docker compose up -d postgres redis

# 2. backend
cd apps/api
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run db:seed
npm run start:dev         # → http://localhost:4000/api/v1

# 3. frontend (new terminal, back at repo root)
echo 'VITE_USE_API=true' > .env.local
echo 'VITE_API_URL=http://localhost:4000/api/v1' >> .env.local
npm run dev               # → http://localhost:5173, talking to the real API
```

### Path C: full stack in Docker

```bash
docker compose up         # postgres + redis + api, all containerized
# Then frontend locally:
echo 'VITE_USE_API=true' > .env.local
npm run dev
```

---

## What's in the box

### Frontend — 21 pages, four hero workflows

| Hero workflow                  | Page                              | What it does |
| ------------------------------ | --------------------------------- | ------------ |
| Morning health check           | `/command-center`                 | KPI strip, AI daily briefing, pipeline-by-stage, capacity-vs-demand, project health |
| Capacity & staffing decisions  | `/resources/capacity`             | 12-week utilisation heatmap, overallocated + bench panels |
| Pipeline management            | `/opportunities`                  | Kanban + table, stale-deal flags, weighted pipeline math |
| AI-extracted meeting intel     | `/intelligence/transcripts`       | Upload → AI extracts actions / risks / decisions → human review → commit |

Plus views for products, projects, tasks, calendar, timeline (Gantt), risks
matrix, decision log, dependency graph, capability library, reports, and settings.

### Backend — NestJS + Prisma + PostgreSQL

15 feature modules, REST under `/api/v1`, every response wrapped as `{ ok, data, meta }`:

- **Generic CRUD** for resources, clients, products, projects, tasks, issues, decisions, capabilities, allocations, meetings, action-items, risks
- **Opportunities** with `/stale` and `/pipeline-summary` endpoints
- **Risks** with `/heatmap`
- **Transcripts** with `/:id/extract` (runs AI extraction) and `/:id/commit` (persists reviewed result back to canonical tables)
- **Reports** powering the Command Center: `/portfolio-health`, `/utilization`, `/attention`

See `apps/api/README.md` for the full endpoint catalogue and architecture.

### AI extraction pipeline

`apps/api/src/transcripts/extraction.providers.ts` defines an `LLMProvider`
interface with two providers shipped:

- **MockProvider** — pattern-matches against a transcript, no API key required. Used
  by default so the app works end-to-end out of the box.
- **AnthropicProvider** — stub. Set `LLM_PROVIDER=anthropic` and `ANTHROPIC_API_KEY`,
  then implement the fetch call in `extract()`. OpenAI / Gemini / OCI follow the
  same pattern.

The provider is picked at runtime via `ProviderRegistry.pick()`, so swapping is a
configuration change, not a code change.

---

## Tech stack

**Frontend**
- React 18 + TypeScript 5 (strict)
- Vite 5
- Tailwind 3 with custom design tokens
- React Router 6
- TanStack Query 5
- Recharts 2, Lucide, date-fns
- shadcn-style component primitives (no Radix dependency)

**Backend**
- NestJS 10
- Prisma 5 + PostgreSQL 16
- class-validator + class-transformer
- helmet for security headers
- Multi-stage Docker build

**Infra**
- docker-compose for postgres + redis + api + pgAdmin
- pgAdmin via `--profile tools`

---

## Design system

- **IBM Plex Sans + Mono** typography
- **Teal-700 primary** (`#0F766E`), amber warnings, rose critical, emerald ok, indigo info
- **Dense, tabular layouts** — built for leadership reading scans of 50+ rows at once
- **Light theme** primary; dark-theme tokens reserved (`paper-sunken`, `ink-soft`, etc.) so adding it is mechanical

---

## Project layout

```
portfolio-command-center/
├── README.md                       # you are here
├── docker-compose.yml              # postgres + redis + api + pgAdmin
├── package.json                    # frontend deps
├── .env.example                    # frontend env (VITE_USE_API, VITE_API_URL)
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx                     # router
│   ├── index.css
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── ui/                     # 9 shadcn-style primitives
│   │   └── shared/                 # AppShell, Sidebar, TopBar, AIAssistant, etc.
│   ├── pages/                      # 21 route components
│   ├── data/
│   │   └── seed.ts                 # mock backend
│   └── lib/
│       ├── types.ts                # 24 entity types
│       ├── utils.ts                # formatters, helpers
│       ├── ai-extraction.ts        # frontend mock LLM provider
│       ├── api.ts                  # NEW: typed fetch client, mock ↔ real
│       └── hooks.ts                # NEW: TanStack Query hooks
└── apps/api/
    ├── README.md                   # backend-specific docs
    ├── package.json
    ├── tsconfig.json
    ├── nest-cli.json
    ├── Dockerfile
    ├── .env.example
    ├── prisma/
    │   ├── schema.prisma           # 24 models
    │   └── seed.ts                 # Trinamix-realistic seed data
    └── src/
        ├── main.ts                 # bootstrap
        ├── app.module.ts
        ├── prisma/                 # PrismaService
        ├── common/                 # base-crud, filter, interceptor
        ├── resources/, clients/, products/, projects/, tasks/, issues/,
        │   decisions/, capabilities/, allocations/, meetings/, action-items/
        ├── opportunities/          # + stale + pipeline
        ├── risks/                  # + heatmap
        ├── transcripts/            # + extract + commit + providers
        └── reports/                # portfolio-health, utilization, attention
```

---

## Switching frontend from mock to real backend

The frontend has a single switch. Both modes are first-class — every API method has
a mock branch and a live branch that return the same shape.

```bash
# .env.local at repo root
VITE_USE_API=true
VITE_API_URL=http://localhost:4000/api/v1
```

Then in your pages:

```ts
import { usePortfolioHealth, useStaleOpportunities, useUtilization } from '@/lib/hooks';

function CommandCenter() {
  const { data: health } = usePortfolioHealth();
  const { data: stale } = useStaleOpportunities(10);
  const { data: util } = useUtilization();
  // ... same shape whether real or mock
}
```

The existing pages still import directly from `@/data/seed` and work as-is in
mock mode. To migrate a page to the real backend, replace the seed import with
the hook from `@/lib/hooks`.

---

## What's not in this drop

Honest list of next-iteration items. None of these block daily use:

- **Auth** — `.env.example` reserves `JWT_SECRET`; add `AuthGuard` + `RolesGuard` when you're ready
- **Real LLM providers** — `AnthropicProvider` is a stub; pattern is established for OpenAI/Gemini/OCI
- **Async extraction queue** — Redis is provisioned for BullMQ; the current extraction is synchronous
- **OpenTelemetry** — easy add via `@opentelemetry/sdk-node` in `main.ts`
- **Tests** — module structure is set up for `*.spec.ts`; Jest config not included
- **Per-page migration to hooks** — the API client + hooks layer exist, but only new code uses them by default. Existing pages still use the seed import; migrate as you touch them.

---

## License

Proprietary — Trinamix internal use.
