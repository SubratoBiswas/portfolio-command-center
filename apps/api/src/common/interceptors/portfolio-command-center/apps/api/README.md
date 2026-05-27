# `apps/api` — Trinamix Portfolio Command Center API

NestJS 10 + Prisma 5 + PostgreSQL 16. REST. Boring, on purpose.

## Run it

```bash
# 1. Postgres
cd ../..                         # back to repo root
docker compose up -d postgres
cd apps/api

# 2. Backend deps
npm install
cp .env.example .env             # edit if you changed DB credentials

# 3. Generate Prisma client types (REQUIRED before tsc / start:dev)
#    This fetches a tiny binary from binaries.prisma.sh — needs internet
#    on first run only. If you see "Property 'XxxWhereInput' does not exist
#    on type 'Prisma'", you skipped this step.
npx prisma generate

# 4. Migrate + seed
npx prisma migrate dev --name init
npm run db:seed                  # populates realistic Trinamix data

# 5. Run
npm run start:dev                # → http://localhost:4000/api/v1
```

Then in another terminal, point the frontend at this backend:

```bash
cd ../..                         # repo root
# Create .env.local at repo root with:
#   VITE_USE_API=true
#   VITE_API_URL=http://localhost:4000/api/v1
npm run dev
```

When `VITE_USE_API=false` (the default), the frontend uses its in-memory mock and you don't need this server running at all.

---

## Endpoints

All routes prefixed with `/api/v1`. Every response wrapped as `{ ok, data, meta }`.

### CRUD (uniform shape)

These all support `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`:

```
/resources          /clients            /products
/projects           /tasks              /issues
/decisions          /capabilities       /allocations
/meetings           /action-items       /risks
```

Query strings on the list endpoints become Prisma `where` clauses (simple equality only). For example: `GET /risks?severity=critical&status=open`.

### Custom endpoints

```
GET  /opportunities                       List
GET  /opportunities/stale?days=10         Deals untouched for N days, not closed
GET  /opportunities/pipeline-summary      $ value grouped by stage
GET  /opportunities/:id                   Detail

GET  /risks/heatmap                       Flat list for likelihood × impact matrix

GET  /transcripts                         List
GET  /transcripts/:id                     Detail with extraction job
POST /transcripts/:id/extract             Run AI extraction { provider?: 'mock' | 'anthropic' | ... }
POST /transcripts/:id/commit              Commit reviewed extractions into canonical tables

GET  /reports/portfolio-health            Command Center hero cards
GET  /reports/utilization                 Per-resource utilisation with RAG
GET  /reports/attention                   Red projects, critical risks, stale deals, blocked tasks
```

---

## Architecture

```
apps/api/
├── prisma/
│   ├── schema.prisma          # 24 models + custom-fields + audit
│   └── seed.ts                # realistic Trinamix data
└── src/
    ├── main.ts                # bootstrap, helmet, CORS, validation pipe
    ├── app.module.ts          # imports every feature module
    ├── prisma/                # PrismaService + global PrismaModule
    ├── common/
    │   ├── base-crud.service.ts             # generic Prisma CRUD
    │   ├── filters/http-exception.filter.ts # Prisma errors → clean HTTP
    │   └── interceptors/transform.interceptor.ts # { ok, data, meta } envelope
    ├── resources/ clients/ products/ projects/ tasks/ issues/
    ├── decisions/ capabilities/ allocations/ meetings/ action-items/
    │   └── *.module.ts + *.controller.ts + *.service.ts (~30 lines each)
    ├── opportunities/         # + stale + pipeline-summary
    ├── risks/                 # + heatmap
    ├── transcripts/           # + extract + commit
    │   ├── transcripts.{module,controller,service}.ts
    │   └── extraction.providers.ts          # LLMProvider interface, MockProvider, AnthropicProvider stub
    └── reports/               # portfolio-health, utilization, attention
```

### Generic CRUD pattern

Each entity's service extends `BaseCrudService<Where, Create, Update, Include>` which delegates to `prisma[delegateName]`. Result: a typical service is ~10 lines, a controller ~30. New entities are usually three short files.

### Extraction pattern

`ProviderRegistry.pick()` resolves which `LLMProvider` to use from the request body or `LLM_PROVIDER` env. `MockProvider` works out of the box; `AnthropicProvider` is a stub — fill in the fetch to `api.anthropic.com/v1/messages` with a structured-output prompt that returns the `ExtractionResult` shape. Add OpenAI/Gemini/OCI providers the same way.

The extract endpoint runs the provider, persists an `ExtractionJob` row, and returns the structured result. The commit endpoint takes the reviewed result and creates `ActionItem`, `Risk`, and `Decision` rows.

---

## Switching to a real LLM provider

1. Set `LLM_PROVIDER=anthropic` in `.env`
2. Set `ANTHROPIC_API_KEY`
3. Implement the fetch call in `extraction.providers.ts → AnthropicProvider.extract()` — it should call the Anthropic API with a system prompt that constrains the response to JSON matching `ExtractionResult`.

The frontend doesn't need to change — the same `POST /transcripts/:id/extract` endpoint serves the result.

---

## Docker

```bash
# From repo root
docker compose up                  # postgres + redis + api
docker compose --profile tools up  # adds pgAdmin on :5050
```

The API container builds via `apps/api/Dockerfile` — multi-stage, ~120 MB final image.

---

## What's not in this drop

Honest list. These are next-iteration concerns, not blockers for daily use:

- **Auth** — `.env.example` reserves `JWT_SECRET`; add `AuthGuard` + `RolesGuard` in `common/guards/` when you're ready
- **Queues** — Redis is provisioned for BullMQ; wire it in if extraction goes async
- **OpenTelemetry** — easy add via `@opentelemetry/sdk-node` in `main.ts`
- **Tests** — module structure is set up for `*.spec.ts`; add Jest config when you start writing them
- **Real LLM providers** — `AnthropicProvider` is a stub; pattern is established

All of these slot in without touching the routes the frontend already talks to.
