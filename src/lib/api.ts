// =============================================================================
// API client — typed wrapper around the NestJS backend.
// VITE_USE_API=true → real HTTP calls to VITE_API_URL
// VITE_USE_API unset/false → in-memory mock from @/data/seed
// =============================================================================

import * as seed from '@/data/seed';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000/api/v1';
const USE_API = (import.meta.env.VITE_USE_API as string | undefined) === 'true';

interface ApiEnvelope<T> { ok: boolean; data: T; meta?: { count?: number; took_ms?: number }; status?: number; message?: string; }

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  let payload: ApiEnvelope<T>;
  try { payload = await res.json(); } catch { throw new ApiError(res.status, `Non-JSON from ${url}`); }
  if (!res.ok || payload?.ok === false) throw new ApiError(res.status, payload?.message ?? `${method} ${path} failed`);
  return payload.data;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); this.name = 'ApiError'; }
}

// =============================================================================
// Auth
// =============================================================================
export const authApi = {
  login: (email: string, password: string) => call<{ accessToken: string; expiresIn: string; user: { id: string; email: string; name: string; role: string } }>('POST', '/auth/login', { email, password }),
  register: (email: string, password: string, name: string, role?: string) => call<{ accessToken: string; user: any }>('POST', '/auth/register', { email, password, name, role }),
  me: () => call<{ id: string; email: string; name: string; role: string }>('GET', '/auth/me'),
};

// =============================================================================
// Data API — every method has a mock branch and a live branch
// =============================================================================
export const api = {
  isLive: USE_API,
  url: API_URL,

  resources: {
    list: () => USE_API ? call<typeof seed.resources>('GET', '/resources') : Promise.resolve(seed.resources),
    get: (id: string) => USE_API ? call<typeof seed.resources[number]>('GET', `/resources/${id}`) : Promise.resolve(seed.resourceById(id)),
  },
  clients: {
    list: () => USE_API ? call<typeof seed.clients>('GET', '/clients') : Promise.resolve(seed.clients),
    get: (id: string) => USE_API ? call<any>('GET', `/clients/${id}`) : Promise.resolve(seed.clientById(id)),
  },
  products: {
    list: () => USE_API ? call<typeof seed.products>('GET', '/products') : Promise.resolve(seed.products),
    get: (id: string) => USE_API ? call<any>('GET', `/products/${id}`) : Promise.resolve(seed.productById(id)),
  },
  opportunities: {
    list: () => USE_API ? call<typeof seed.opportunities>('GET', '/opportunities') : Promise.resolve(seed.opportunities),
    get: (id: string) => USE_API ? call<any>('GET', `/opportunities/${id}`) : Promise.resolve(seed.opportunityById(id)),
    stale: (days = 10) =>
      USE_API
        ? call<typeof seed.opportunities>('GET', `/opportunities/stale?days=${days}`)
        : Promise.resolve(seed.opportunities.filter(o => {
            const lastTouch = new Date(o.lastInteractionAt).getTime();
            return lastTouch < Date.now() - days * 86400000 && !['closed_won','closed_lost'].includes(o.stage);
          })),
    pipelineSummary: () =>
      USE_API
        ? call<Array<{ stage: string; count: number; value: number }>>('GET', '/opportunities/pipeline-summary')
        : Promise.resolve(
            Object.entries(seed.opportunities.reduce<Record<string,{ count: number; value: number }>>((acc, o) => {
              const k = o.stage; acc[k] ??= { count: 0, value: 0 }; acc[k].count++; acc[k].value += o.value; return acc;
            }, {})).map(([stage, agg]) => ({ stage, ...agg })),
          ),
  },
  projects: {
    list: () => USE_API ? call<typeof seed.projects>('GET', '/projects') : Promise.resolve(seed.projects),
    get: (id: string) => USE_API ? call<any>('GET', `/projects/${id}`) : Promise.resolve(seed.projectById(id)),
  },
  tasks: {
    list: () => USE_API ? call<typeof seed.tasks>('GET', '/tasks') : Promise.resolve(seed.tasks),
  },
  risks: {
    list: () => USE_API ? call<typeof seed.risks>('GET', '/risks') : Promise.resolve(seed.risks),
  },
  issues: {
    list: () => USE_API ? call<typeof seed.issues>('GET', '/issues') : Promise.resolve(seed.issues),
  },
  decisions: {
    list: () => USE_API ? call<typeof seed.decisions>('GET', '/decisions') : Promise.resolve(seed.decisions),
  },
  meetings: {
    list: () => USE_API ? call<typeof seed.meetings>('GET', '/meetings') : Promise.resolve(seed.meetings),
  },
  transcripts: {
    list: () => USE_API ? call<typeof seed.transcripts>('GET', '/transcripts') : Promise.resolve(seed.transcripts),
    extract: (id: string, provider?: string, sync?: boolean) =>
      call<{ jobId?: string | number; status?: string; job?: unknown; result?: unknown }>('POST', `/transcripts/${id}/extract`, { provider, sync }),
    jobStatus: (id: string) =>
      call<{ status: string; progress?: number; result?: unknown; error?: string }>('GET', `/transcripts/${id}/job-status`),
    commit: (id: string, payload: Record<string, unknown>) =>
      call<{ transcriptId: string; created: Record<string, number> }>('POST', `/transcripts/${id}/commit`, payload),
  },
  actionItems: {
    list: () => USE_API ? call<typeof seed.actionItems>('GET', '/action-items') : Promise.resolve(seed.actionItems),
  },
  capabilities: {
    list: () => USE_API ? call<typeof seed.capabilities>('GET', '/capabilities') : Promise.resolve(seed.capabilities),
  },
  allocations: {
    list: () => USE_API ? call<typeof seed.allocations>('GET', '/allocations') : Promise.resolve(seed.allocations),
  },
  locations: {
    list: () => Promise.resolve(seed.locations), // static data, always from seed
  },
  workstreams: {
    list: () => Promise.resolve(seed.workstreams),
    byProject: (projectId: string) => Promise.resolve(seed.workstreams.filter(w => w.projectId === projectId)),
  },
  dependencies: {
    list: () => Promise.resolve(seed.dependencies),
  },
  roadmapItems: {
    list: () => Promise.resolve(seed.roadmapItems),
    byProduct: (productId: string) => Promise.resolve(seed.roadmapItems.filter(r => r.productId === productId)),
  },
  reports: {
    portfolioHealth: () =>
      USE_API
        ? call<any>('GET', '/reports/portfolio-health')
        : Promise.resolve({
            counts: {
              products: seed.products.length,
              activeProjects: seed.projects.filter(p => !['done','cancelled'].includes(p.status)).length,
              openOpportunities: seed.opportunities.filter(o => !['closed_won','closed_lost'].includes(o.stage)).length,
              risks: seed.risks.length,
              criticalRisks: seed.risks.filter(r => r.severity === 'critical').length,
              staleDeals: seed.opportunities.filter(o => Date.now() - new Date(o.lastInteractionAt).getTime() > 10*86400000 && !['closed_won','closed_lost'].includes(o.stage)).length,
            },
            pipelineValue: seed.opportunities.reduce((sum, o) => sum + o.value, 0),
            ragBreakdown: seed.projects.reduce<Record<string,number>>((acc, p) => { acc[p.rag] = (acc[p.rag] ?? 0) + 1; return acc; }, {}),
          }),
    utilization: () =>
      USE_API
        ? call<any[]>('GET', '/reports/utilization')
        : Promise.resolve(seed.resources.map(r => {
            const allocated = seed.allocations.filter(a => a.resourceId === r.id).reduce((sum, a) => sum + a.hoursPerWeek, 0);
            const capacity = r.weeklyCapacityHours - (r.timeOffHours ?? 0);
            const pct = capacity > 0 ? (allocated / capacity) * 100 : 0;
            const rag = pct > 100 ? 'red' : pct > 90 ? 'orange' : pct > 75 ? 'yellow' : 'green';
            return {
              resourceId: r.id, name: r.name, initials: r.initials, role: r.role,
              location: seed.locationById(r.locationId)?.name,
              capacityHours: capacity, allocatedHours: allocated,
              utilizationPct: Math.round(pct),
              allocationCount: seed.allocations.filter(a => a.resourceId === r.id).length,
              rag,
            };
          })),
  },
};

export async function checkApiHealth(): Promise<{ ok: boolean; latency_ms?: number; error?: string }> {
  if (!USE_API) return { ok: true };
  const start = Date.now();
  try { await fetch(`${API_URL}/reports/portfolio-health`, { method: 'GET' }); return { ok: true, latency_ms: Date.now() - start }; }
  catch (err) { return { ok: false, error: err instanceof Error ? err.message : String(err) }; }
}
