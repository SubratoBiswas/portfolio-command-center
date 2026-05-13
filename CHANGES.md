# Completion Changes

## 1. JWT Authentication (`apps/api/src/auth/`)

Full auth layer added to the NestJS backend:

- **`auth.module.ts`** — Wires `@nestjs/jwt`, `@nestjs/passport`, `PrismaModule`
- **`auth.service.ts`** — `register()`, `login()`, `me()`, `changePassword()` with bcrypt hashing (12 rounds)
- **`auth.controller.ts`** — `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/change-password`
- **`jwt.strategy.ts`** — Passport JWT strategy that validates token and loads the User from Prisma
- **`jwt-auth.guard.ts`** — Global guard; routes opt-out via `@Public()`
- **`roles.guard.ts`** — Global roles guard; routes opt-in via `@Roles('admin', ...)`
- **`public.decorator.ts`** / **`roles.decorator.ts`** / **`current-user.decorator.ts`** — supporting decorators

`app.module.ts` now registers both guards globally via `APP_GUARD`. All existing routes are protected by default; add `@Public()` to any endpoint that should be open (e.g. health checks).

New Prisma `User` model added to `schema.prisma` with `email`, `passwordHash`, `name`, `role`, `resourceId` (soft link), `active`, `lastLoginAt`.

New env vars required:
```
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=8h
```

---

## 2. Real Anthropic Provider (`apps/api/src/transcripts/extraction.providers.ts`)

`AnthropicProvider.extract()` is now fully implemented:

- Calls `POST https://api.anthropic.com/v1/messages` with `claude-opus-4-6`
- System prompt instructs the model to return strict `ExtractionResult` JSON (no markdown fencing)
- Strips accidental code fences, parses JSON, fills missing array fields defensively
- Logs token usage from the API response
- Throws a typed error on HTTP failure or invalid JSON
- Falls back gracefully — set `LLM_PROVIDER=mock` to use the pattern-matching provider without an API key

New env vars:
```
LLM_PROVIDER=anthropic   # or 'mock' (default)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 3. Async BullMQ Extraction Queue (`apps/api/src/transcripts/`)

Transcript extraction is now fully async — no more request timeouts on large transcripts:

- **`extraction.queue.ts`** — Queue name constant + `ExtractionJobPayload` type
- **`extraction.processor.ts`** — `@Processor` that runs the extraction, updates `ExtractionJob` status, retries 3× with exponential backoff
- **`transcripts.service.ts`** — `enqueueExtraction()` enqueues to Bull; `getExtractionStatus()` polls the DB; `extractSync()` kept for backward compat
- **`transcripts.controller.ts`** — `POST /:id/extract` now enqueues by default (pass `{ sync: true }` body for synchronous); `GET /:id/job-status` polls progress and returns result when done
- **`transcripts.module.ts`** — Registers `BullModule.registerQueue` and `ExtractionProcessor`
- **`app.module.ts`** — Registers `BullModule.forRootAsync` pointed at Redis

New env vars:
```
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # optional
```

Redis is already provisioned in `docker-compose.yml`.

**Frontend polling**: `Transcripts.tsx` now polls `GET /:id/job-status` every 2 seconds via `useExtractionJobStatus()` until the job succeeds or fails, then surfaces the result automatically.

---

## 4. Frontend pages migrated to TanStack Query hooks

All 21 pages + `AIAssistant.tsx` now use `@/lib/hooks` instead of importing directly from `@/data/seed`.

**New hooks added** (`src/lib/hooks.ts`):
- `useIssues()`, `useDecisions()`, `useMeetings()`, `useWorkstreams()`, `useWorkstreamsByProject(id)`
- `useLocations()`, `useDependencies()`, `useRoadmapItems()`, `useRoadmapByProduct(id)`
- `useExtractionJobStatus(transcriptId, enabled)` — polls with auto-stop on completion
- `useLookups()` — returns `resourceById`, `clientById`, `productById`, `projectById`, `opportunityById`, `capabilityById`, `locationById` built from live data
- `makeLookup<T>(arr)` — exported helper to build lookup maps from any fetched array

**New API methods added** (`src/lib/api.ts`):
- `api.issues`, `api.decisions`, `api.meetings`, `api.workstreams`, `api.dependencies`, `api.locations`, `api.roadmapItems`
- `api.transcripts.jobStatus(id)` — polls async extraction status
- `authApi.login()`, `authApi.register()`, `authApi.me()` — JWT auth client

Every page now:
1. Calls the relevant hook(s) at the top
2. Shows a loading state while data fetches
3. Builds local lookup maps via `useLookups()` or `makeLookup()`
4. Works identically in mock mode (`VITE_USE_API=false`) and live mode (`VITE_USE_API=true`)

---

## Quick start (unchanged)

```bash
# Frontend only (zero config, mock data)
npm install && npm run dev

# Full stack
docker compose up -d postgres redis
cd apps/api && npm install && cp .env.example .env  # fill in secrets
npx prisma migrate dev --name init && npm run db:seed && npm run start:dev
# In root: echo 'VITE_USE_API=true' > .env.local && npm run dev
```
