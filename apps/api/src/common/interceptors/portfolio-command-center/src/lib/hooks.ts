// =============================================================================
// React Query hooks — work identically in mock and live mode.
// =============================================================================

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { api, auditLogsApi } from './api';
import * as seed from '@/data/seed';
import type { Resource, Client, Product, Project, Opportunity } from './types';

// ---- Query key registry ----
const k = {
  resources: ['resources'] as const,
  resource: (id: string) => ['resources', id] as const,
  clients: ['clients'] as const,
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  opportunities: ['opportunities'] as const,
  opportunity: (id: string) => ['opportunities', id] as const,
  oppsStale: (days: number) => ['opportunities', 'stale', days] as const,
  pipelineSummary: ['opportunities', 'pipeline-summary'] as const,
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  tasks: ['tasks'] as const,
  risks: ['risks'] as const,
  issues: ['issues'] as const,
  decisions: ['decisions'] as const,
  meetings: ['meetings'] as const,
  transcripts: ['transcripts'] as const,
  actionItems: ['action-items'] as const,
  capabilities: ['capabilities'] as const,
  allocations: ['allocations'] as const,
  locations: ['locations'] as const,
  workstreams: ['workstreams'] as const,
  workstreamsByProject: (id: string) => ['workstreams', 'project', id] as const,
  dependencies: ['dependencies'] as const,
  roadmapItems: ['roadmap-items'] as const,
  roadmapByProduct: (id: string) => ['roadmap-items', 'product', id] as const,
  portfolioHealth: ['reports', 'portfolio-health'] as const,
  utilization: ['reports', 'utilization'] as const,
  jobStatus: (id: string) => ['transcripts', id, 'job-status'] as const,
};
export const queryKeys = k;

// ---- Generic data hooks ----
export function useResources(opts?: Partial<UseQueryOptions>) {
  return useQuery({ queryKey: k.resources, queryFn: api.resources.list, ...(opts as object) });
}
export function useResource(id: string) {
  return useQuery({ queryKey: k.resource(id), queryFn: () => api.resources.get(id), enabled: !!id });
}
export function useClients() {
  return useQuery({ queryKey: k.clients, queryFn: api.clients.list });
}
export function useProducts() {
  return useQuery({ queryKey: k.products, queryFn: api.products.list });
}
export function useProduct(id: string) {
  return useQuery({ queryKey: k.product(id), queryFn: () => api.products.get(id), enabled: !!id });
}
export function useOpportunities() {
  return useQuery({ queryKey: k.opportunities, queryFn: api.opportunities.list });
}
export function useOpportunity(id: string) {
  return useQuery({ queryKey: k.opportunity(id), queryFn: () => api.opportunities.get(id), enabled: !!id });
}
export function useStaleOpportunities(days = 10) {
  return useQuery({ queryKey: k.oppsStale(days), queryFn: () => api.opportunities.stale(days) });
}
export function usePipelineSummary() {
  return useQuery({ queryKey: k.pipelineSummary, queryFn: api.opportunities.pipelineSummary });
}
export function useProjects() {
  return useQuery({ queryKey: k.projects, queryFn: api.projects.list });
}
export function useProject(id: string) {
  return useQuery({ queryKey: k.project(id), queryFn: () => api.projects.get(id), enabled: !!id });
}
export function useTasks() {
  return useQuery({ queryKey: k.tasks, queryFn: api.tasks.list });
}
export function useRisks() {
  return useQuery({ queryKey: k.risks, queryFn: api.risks.list });
}
export function useIssues() {
  return useQuery({ queryKey: k.issues, queryFn: api.issues.list });
}
export function useDecisions() {
  return useQuery({ queryKey: k.decisions, queryFn: api.decisions.list });
}
export function useMeetings() {
  return useQuery({ queryKey: k.meetings, queryFn: api.meetings.list });
}
export function useTranscripts() {
  return useQuery({ queryKey: k.transcripts, queryFn: api.transcripts.list });
}
export function useActionItems() {
  return useQuery({ queryKey: k.actionItems, queryFn: api.actionItems.list });
}
export function useCapabilities() {
  return useQuery({ queryKey: k.capabilities, queryFn: api.capabilities.list });
}
export function useAllocations() {
  return useQuery({ queryKey: k.allocations, queryFn: api.allocations.list });
}
export function useLocations() {
  return useQuery({ queryKey: k.locations, queryFn: api.locations.list });
}
export function useWorkstreams() {
  return useQuery({ queryKey: k.workstreams, queryFn: api.workstreams.list });
}
export function useWorkstreamsByProject(projectId: string) {
  return useQuery({ queryKey: k.workstreamsByProject(projectId), queryFn: () => api.workstreams.byProject(projectId), enabled: !!projectId });
}
export function useDependencies() {
  return useQuery({ queryKey: k.dependencies, queryFn: api.dependencies.list });
}
export function useRoadmapItems() {
  return useQuery({ queryKey: k.roadmapItems, queryFn: api.roadmapItems.list });
}
export function useRoadmapByProduct(productId: string) {
  return useQuery({ queryKey: k.roadmapByProduct(productId), queryFn: () => api.roadmapItems.byProduct(productId), enabled: !!productId });
}
export function usePortfolioHealth() {
  return useQuery({ queryKey: k.portfolioHealth, queryFn: api.reports.portfolioHealth });
}
export function useUtilization() {
  return useQuery({ queryKey: k.utilization, queryFn: api.reports.utilization });
}

// ---- Polling hook for async extraction job ----
export function useExtractionJobStatus(transcriptId: string, enabled: boolean) {
  return useQuery({
    queryKey: k.jobStatus(transcriptId),
    queryFn: () => api.transcripts.jobStatus(transcriptId),
    enabled: enabled && !!transcriptId,
    refetchInterval: (query: any) => {
      const data = query.state.data;
      return data?.status === 'succeeded' || data?.status === 'failed' ? false : 2000;
    },
  });
}

// ---- Lookup helpers ----
export function makeLookup<T extends { id: string }>(arr: T[] | undefined) {
  const map = new Map<string, T>((arr ?? []).map(item => [item.id, item]));
  return (id?: string | null) => (id ? map.get(id) : undefined);
}

// ---- Combined lookups hook ----
export function useLookups() {
  const { data: resources } = useResources();
  const { data: clients } = useClients();
  const { data: products } = useProducts();
  const { data: projects } = useProjects();
  const { data: opportunities } = useOpportunities();
  const { data: capabilities } = useCapabilities();
  const { data: locations } = useLocations();

  return {
    resourceById: makeLookup(resources as Resource[] | undefined),
    clientById: makeLookup(clients as Client[] | undefined),
    productById: makeLookup(products as Product[] | undefined),
    projectById: makeLookup(projects as Project[] | undefined),
    opportunityById: makeLookup(opportunities as Opportunity[] | undefined),
    capabilityById: makeLookup(capabilities as any[] | undefined),
    locationById: makeLookup(locations as any[] | undefined),
  };
}

// ---- Create mutations ----
export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.projects.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: k.projects }),
  });
}
export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.opportunities.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: k.opportunities });
      qc.invalidateQueries({ queryKey: k.pipelineSummary });
    },
  });
}
export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.products.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: k.products }),
  });
}
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.tasks.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: k.tasks }),
  });
}
export function useCreateRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.risks.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: k.risks }),
  });
}

// ---- Transcript mutations ----
export function useExtractTranscript() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, provider, sync }: { id: string; provider?: string; sync?: boolean }) =>
      api.transcripts.extract(id, provider, sync),
    onSuccess: () => qc.invalidateQueries({ queryKey: k.transcripts }),
  });
}
export function useCommitTranscript() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      api.transcripts.commit(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: k.transcripts });
      qc.invalidateQueries({ queryKey: k.actionItems });
      qc.invalidateQueries({ queryKey: k.risks });
      qc.invalidateQueries({ queryKey: k.decisions });
    },
  });
}

// ---- Delete mutations ----
export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.projects.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: k.projects }),
  });
}
export function useDeleteOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.opportunities.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: k.opportunities });
      qc.invalidateQueries({ queryKey: k.pipelineSummary });
    },
  });
}
export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.products.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: k.products }),
  });
}
export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.tasks.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: k.tasks }),
  });
}
export function useDeleteRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.risks.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: k.risks }),
  });
}

export function useAuditLogs(params: { objectType?: string; objectId?: string; action?: string; skip?: number; take?: number } = {}) {
  return useQuery({
    queryKey: ['auditLogs', params],
    queryFn: () => auditLogsApi.list(params),
    staleTime: 30_000,
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, any>) => api.projects.update(id, data),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: k.projects });
      qc.invalidateQueries({ queryKey: ['project', v.id] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, any>) => api.products.update(id, data),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: k.products });
      qc.invalidateQueries({ queryKey: ['product', v.id] });
    },
  });
}

export function useUpdateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, any>) => api.opportunities.update(id, data),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: k.opportunities });
      qc.invalidateQueries({ queryKey: ['opportunity', v.id] });
      qc.invalidateQueries({ queryKey: k.pipelineSummary });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, any>) => api.tasks.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: k.tasks }),
  });
}

export function useUpdateRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, any>) => api.risks.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: k.risks }),
  });
}
