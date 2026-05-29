// =============================================================================
// API client — typed wrapper around the NestJS backend.
// VITE_USE_API=true → real HTTP calls to VITE_API_URL
// VITE_USE_API unset/false → in-memory mock from @/data/seed
// =============================================================================

import * as seed from '@/data/seed';
import { aiLabsOpportunities } from '@/data/aiLabsOpportunities';
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000/api/v1';
const USE_API = (import.meta.env.VITE_USE_API as string | undefined) === 'true';

const TOKEN_KEY = 'trinamix_token';
const USER_KEY  = 'trinamix_user';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const getUser = (): { id: string; name: string; email: string; role: string } | null => {
  try { return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'); } catch { return null; }
};
export const setUser = (u: { id: string; name: string; email: string; role: string }) =>
  localStorage.setItem(USER_KEY, JSON.stringify(u));
export const clearUser = () => localStorage.removeItem(USER_KEY);

interface ApiEnvelope<T> { ok: boolean; data: T; meta?: { count?: number; took_ms?: number }; status?: number; message?: string; }

export async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${API_URL}${path}`;
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new ApiError(401, 'Session expired — please log in again');
  }
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
    get: (id: string) => USE_API ? call<any>('GET', `/resources/${id}`) : Promise.resolve(seed.resourceById(id)),
    create: (data: any) => USE_API
      ? call<any>('POST', '/resources', data)
      : Promise.resolve((() => { const r = { ...data, id: `r-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; (seed.resources as any[]).push(r); return r; })()),
    update: (id: string, data: Record<string, any>) => USE_API
      ? call<any>('PATCH', `/resources/${id}`, data)
      : Promise.resolve((() => { const r = (seed.resources as any[]).find(r => r.id === id); if (r) Object.assign(r, data); return r; })()),
    delete: (id: string) => USE_API
      ? call<any>('DELETE', `/resources/${id}`)
      : Promise.resolve((() => { const i = (seed.resources as any[]).findIndex(r => r.id === id); if (i !== -1) (seed.resources as any[]).splice(i, 1); return { id, deleted: true }; })()),
  },
  clients: {
    list: () => USE_API ? call<typeof seed.clients>('GET', '/clients') : Promise.resolve(seed.clients),
    get: (id: string) => USE_API ? call<any>('GET', `/clients/${id}`) : Promise.resolve(seed.clientById(id)),
  },
  products: {
    list: () => USE_API ? call<typeof seed.products>('GET', '/products') : Promise.resolve(seed.products),
    get: (id: string) => USE_API ? call<any>('GET', `/products/${id}`) : Promise.resolve(seed.productById(id)),
    create: (data: any) => USE_API
      ? call<any>('POST', '/products', data)
      : Promise.resolve((() => {
          const r = { ...data, id: `prod-${Date.now()}`, aiReadiness: 0, deliveryReadiness: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          (seed.products as any[]).push(r); return r;
        })()),
    update: (id: string, data: Record<string, any>) => USE_API
      ? call<any>('PATCH', `/products/${id}`, data)
      : Promise.resolve((() => { const p = (seed.products as any[]).find(p => p.id === id); if (p) Object.assign(p, data); return p; })()),
    delete: (id: string) => USE_API
      ? call<any>('DELETE', `/products/${id}`)
      : Promise.resolve((() => { const i = (seed.products as any[]).findIndex(p => p.id === id); if (i !== -1) (seed.products as any[]).splice(i, 1); return { id, deleted: true }; })()),
  },
  opportunities: {
    list: () => USE_API
      ? call<any[]>('GET', '/opportunities')
      : Promise.resolve(aiLabsOpportunities as any[]),

    get: (id: string) => USE_API
      ? call<any>('GET', `/opportunities/${id}`)
      : Promise.resolve((aiLabsOpportunities as any[]).find(o => o.id === id)),

    create: (data: any) => USE_API
      ? call<any>('POST', '/opportunities', data)
      : Promise.resolve((() => {
          const r = { ...data, id: `opp-${Date.now()}`,
            lastInteractionAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString() };
          (aiLabsOpportunities as any[]).push(r); return r;
        })()),

    update: (id: string, data: Record<string, any>) => USE_API
      ? call<any>('PATCH', `/opportunities/${id}`, data)
      : Promise.resolve((() => {
          const o = (aiLabsOpportunities as any[]).find(o => o.id === id);
          if (o) Object.assign(o, data, { updatedAt: new Date().toISOString() });
          return o;
        })()),

    delete: (id: string) => USE_API
      ? call<any>('DELETE', `/opportunities/${id}`)
      : Promise.resolve((() => {
          const i = (aiLabsOpportunities as any[]).findIndex(o => o.id === id);
          if (i !== -1) (aiLabsOpportunities as any[]).splice(i, 1);
          return { id, deleted: true };
        })()),

    stale: (days = 10) =>
      USE_API
        ? call<any[]>('GET', `/opportunities/stale?days=${days}`)
        : Promise.resolve((aiLabsOpportunities as any[]).filter(o => {
            const last = new Date(o.lastInteractionAt).getTime();
            return last < Date.now() - days * 86400000 &&
              !['deal_closed','not_interested','not_legit'].includes(o.aiStage);
          })),

    pipelineSummary: () =>
      USE_API
        ? call<any[]>('GET', '/opportunities/pipeline-summary')
        : Promise.resolve(
            Object.entries((aiLabsOpportunities as any[]).reduce<Record<string, { count: number; value: number }>>((acc, o) => {
              const key = o.aiStage ?? o.stage;
              acc[key] ??= { count: 0, value: 0 }; acc[key].count++; acc[key].value += (o.value ?? 0);
              return acc;
            }, {})).map(([stage, agg]) => ({ stage, ...agg }))
          ),
  },
  projects: {
    list: () => USE_API ? call<typeof seed.projects>('GET', '/projects') : Promise.resolve(seed.projects),
    get: (id: string) => USE_API ? call<any>('GET', `/projects/${id}`) : Promise.resolve(seed.projectById(id)),
    create: (data: any) => USE_API
      ? call<any>('POST', '/projects', data)
      : Promise.resolve((() => {
          const r = { ...data, id: `proj-${Date.now()}`, spent: 0, rag: data.rag ?? 'green', status: data.status ?? 'not_started', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          (seed.projects as any[]).push(r); return r;
        })()),
    update: (id: string, data: Record<string, any>) => USE_API
      ? call<any>('PATCH', `/projects/${id}`, data)
      : Promise.resolve((() => { const p = (seed.projects as any[]).find(p => p.id === id); if (p) Object.assign(p, data); return p; })()),
    delete: (id: string) => USE_API
      ? call<any>('DELETE', `/projects/${id}`)
      : Promise.resolve((() => { const i = (seed.projects as any[]).findIndex(p => p.id === id); if (i !== -1) (seed.projects as any[]).splice(i, 1); return { id, deleted: true }; })()),
  },
  tasks: {
    list: () => USE_API ? call<typeof seed.tasks>('GET', '/tasks') : Promise.resolve(seed.tasks),
    create: (data: any) => USE_API
      ? call<any>('POST', '/tasks', data)
      : Promise.resolve((() => {
          const r = { ...data, id: `task-${Date.now()}`, status: data.status ?? 'not_started', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          (seed.tasks as any[]).push(r); return r;
        })()),
    update: (id: string, data: Record<string, any>) => USE_API
      ? call<any>('PATCH', `/tasks/${id}`, data)
      : Promise.resolve((() => { const t = (seed.tasks as any[]).find(t => t.id === id); if (t) Object.assign(t, data); return t; })()),
    delete: (id: string) => USE_API
      ? call<any>('DELETE', `/tasks/${id}`)
      : Promise.resolve((() => { const i = (seed.tasks as any[]).findIndex(t => t.id === id); if (i !== -1) (seed.tasks as any[]).splice(i, 1); return { id, deleted: true }; })()),
  },
  risks: {
    list: () => USE_API ? call<typeof seed.risks>('GET', '/risks') : Promise.resolve(seed.risks),
    create: (data: any) => USE_API
      ? call<any>('POST', '/risks', data)
      : Promise.resolve((() => {
          const r = { ...data, id: `risk-${Date.now()}`, identifiedAt: new Date().toISOString(), status: data.status ?? 'open', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          (seed.risks as any[]).push(r); return r;
        })()),
    update: (id: string, data: Record<string, any>) => USE_API
      ? call<any>('PATCH', `/risks/${id}`, data)
      : Promise.resolve((() => { const r = (seed.risks as any[]).find(r => r.id === id); if (r) Object.assign(r, data); return r; })()),
    delete: (id: string) => USE_API
      ? call<any>('DELETE', `/risks/${id}`)
      : Promise.resolve((() => { const i = (seed.risks as any[]).findIndex(r => r.id === id); if (i !== -1) (seed.risks as any[]).splice(i, 1); return { id, deleted: true }; })()),
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
    create: (data: any) => USE_API
      ? call<any>('POST', '/allocations', data)
      : Promise.resolve((() => { const r = { ...data, id: `al-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; (seed.allocations as any[]).push(r); return r; })()),
    update: (id: string, data: Record<string, any>) => USE_API
      ? call<any>('PATCH', `/allocations/${id}`, data)
      : Promise.resolve((() => { const a = (seed.allocations as any[]).find(a => a.id === id); if (a) Object.assign(a, data); return a; })()),
    delete: (id: string) => USE_API
      ? call<any>('DELETE', `/allocations/${id}`)
      : Promise.resolve((() => { const i = (seed.allocations as any[]).findIndex(a => a.id === id); if (i !== -1) (seed.allocations as any[]).splice(i, 1); return { id, deleted: true }; })()),
  },
  locations: {
    list: () => USE_API ? call<any[]>('GET', '/locations') : Promise.resolve(seed.locations),
    create: (data: any) => USE_API
      ? call<any>('POST', '/locations', data)
      : Promise.resolve((() => { const r = { ...data, id: `loc-${Date.now()}` }; (seed.locations as any[]).push(r); return r; })()),
    update: (id: string, data: Record<string, any>) => USE_API
      ? call<any>('PATCH', `/locations/${id}`, data)
      : Promise.resolve((() => { const l = (seed.locations as any[]).find(l => l.id === id); if (l) Object.assign(l, data); return l; })()),
    delete: (id: string) => USE_API
      ? call<any>('DELETE', `/locations/${id}`)
      : Promise.resolve((() => { const i = (seed.locations as any[]).findIndex(l => l.id === id); if (i !== -1) (seed.locations as any[]).splice(i, 1); return { id, deleted: true }; })()),
  },

  users: {
    list: () => call<any[]>('GET', '/users'),
    create: (data: { email: string; password: string; name: string; role?: string }) =>
      call<any>('POST', '/users', data),
    update: (id: string, data: { role?: string; active?: boolean; name?: string }) =>
      call<any>('PATCH', `/users/${id}`, data),
    remove: (id: string) =>
      call<any>('DELETE', `/users/${id}`),
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

export const auditLogsApi = {
  list: (params: { objectType?: string; objectId?: string; action?: string; skip?: number; take?: number } = {}) => {
    if (!USE_API) {
      return Promise.resolve({ data: [] as any[], total: 0, skip: 0, take: 100 });
    }
    const qs = new URLSearchParams();
    if (params.objectType) qs.set('objectType', params.objectType);
    if (params.objectId) qs.set('objectId', params.objectId);
    if (params.action) qs.set('action', params.action);
    if (params.skip !== undefined) qs.set('skip', String(params.skip));
    if (params.take !== undefined) qs.set('take', String(params.take));
    return call<any>('GET', '/audit-logs?' + qs.toString());
  },
};

export async function checkApiHealth(): Promise<{ ok: boolean; latency_ms?: number; error?: string }> {
  if (!USE_API) return { ok: true };
  const start = Date.now();
  try { await fetch(`${API_URL}/reports/portfolio-health`, { method: 'GET' }); return { ok: true, latency_ms: Date.now() - start }; }
  catch (err) { return { ok: false, error: err instanceof Error ? err.message : String(err) }; }
}
