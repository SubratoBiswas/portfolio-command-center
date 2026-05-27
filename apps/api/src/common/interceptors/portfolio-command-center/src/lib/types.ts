// =============================================================================
// Core domain types — shared between frontend and (future) backend.
// These mirror the Prisma schema in /prisma/schema.prisma.
// =============================================================================

export type ID = string;
export type ISODate = string;

export type ObjectType =
  | 'strategic_bucket'
  | 'product'
  | 'program'
  | 'project'
  | 'opportunity'
  | 'workstream'
  | 'task'
  | 'action_item'
  | 'risk'
  | 'issue'
  | 'decision'
  | 'open_question'
  | 'dependency'
  | 'resource'
  | 'team'
  | 'client'
  | 'meeting'
  | 'transcript'
  | 'roadmap_item'
  | 'ai_use_case'
  | 'capability'
  | 'accelerator'
  | 'leadership_update'
  | 'document';

export type Status =
  | 'not_started'
  | 'in_progress'
  | 'blocked'
  | 'at_risk'
  | 'on_track'
  | 'done'
  | 'cancelled'
  | 'on_hold';

export type Priority = 'p0' | 'p1' | 'p2' | 'p3';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Confidence = 'low' | 'medium' | 'high';
export type RAG = 'green' | 'yellow' | 'orange' | 'red';

export type Role =
  | 'admin'
  | 'executive'
  | 'product_owner'
  | 'project_manager'
  | 'delivery_lead'
  | 'resource_manager'
  | 'contributor'
  | 'viewer';

export interface Location {
  id: ID;
  name: string;
  timezone: string;
  region: 'US' | 'IN' | 'EU' | 'APAC';
  classification: 'onsite' | 'offshore' | 'nearshore' | 'remote' | 'client';
}

export interface Resource {
  id: ID;
  name: string;
  initials: string;
  email: string;
  role: string;
  skills: string[];
  locationId: ID;
  weeklyCapacityHours: number;
  timeOffHours: number; // for current period
  managerId?: ID;
  active: boolean;
  costRate?: number;
}

export interface Client {
  id: ID;
  name: string;
  industry: string;
  tier: 'strategic' | 'growth' | 'maintain';
  region: string;
  arr?: number;
  primaryOwnerId: ID;
  logoColor: string;
}

export interface Product {
  id: ID;
  name: string;
  shortName: string;
  vision: string;
  problem: string;
  targetUsers: string;
  maturity: 'concept' | 'mvp' | 'beta' | 'ga' | 'mature';
  roadmapStage: string;
  gtmStatus: 'not_started' | 'planning' | 'in_market' | 'scaling';
  aiReadiness: number; // 0-100
  deliveryReadiness: number;
  architectureStatus: 'draft' | 'reviewed' | 'approved' | 'evolving';
  pricingModel: string;
  ownerId: ID;
  capabilityIds: ID[];
  tags: string[];
  strategicBucket: string;
  createdAt: ISODate;
}

export interface Opportunity {
  id: ID;
  name: string;
  clientId: ID;
  productId?: ID;
  capabilityIds: ID[];
  value: number;
  probability: number; // 0-100
  stage: 'qualify' | 'discover' | 'propose' | 'negotiate' | 'closed_won' | 'closed_lost';
  ownerId: ID;
  expectedCloseDate: ISODate;
  lastInteractionAt: ISODate;
  nextStep: string;
  nextSteps?: string;
  description?: string;
  source?: string;
  requiredCapabilityIds?: ID[];
  strategicImportance: Severity;
  resourceIds: ID[];
  blockers: string[];
  risks: string[];
  aiNextBestAction?: string;
  createdAt: ISODate;
}

export interface Project {
  id: ID;
  name: string;
  code: string;
  clientId: ID;
  productId?: ID;
  type: 'client_delivery' | 'product_build' | 'internal' | 'rnd';
  status: Status;
  rag: RAG;
  startDate: ISODate;
  endDate: ISODate;
  ownerId: ID;
  scope: string;
  charter: string;
  workstreamIds: ID[];
  resourceIds: ID[];
  milestones: Milestone[];
  weeklyStatus: string;
  budget?: number;
  spent?: number;
  createdAt: ISODate;
}

export interface Milestone {
  id: ID;
  projectId: ID;
  name: string;
  dueDate: ISODate;
  status: Status;
  ownerId: ID;
}

export interface Workstream {
  id: ID;
  name: string;
  projectId?: ID;
  productId?: ID;
  ownerId: ID;
  status: Status;
  description: string;
}

export interface Task {
  id: ID;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  assigneeId?: ID;
  ownerId: ID;
  productId?: ID;
  projectId?: ID;
  opportunityId?: ID;
  workstreamId?: ID;
  dueDate?: ISODate;
  startDate?: ISODate;
  estimateHours: number;
  loggedHours?: number;
  dependsOn: ID[];
  tags: string[];
  source: 'manual' | 'ai_extracted' | 'imported';
  confidence?: Confidence;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface ActionItem {
  id: ID;
  title: string;
  assigneeId?: ID;
  dueDate?: ISODate;
  status: 'open' | 'in_progress' | 'done' | 'cancelled';
  meetingId?: ID;
  transcriptId?: ID;
  productId?: ID;
  projectId?: ID;
  opportunityId?: ID;
  source: 'manual' | 'ai_extracted';
  confidence?: Confidence;
  reviewed: boolean;
  createdAt: ISODate;
}

export interface Risk {
  id: ID;
  title: string;
  description: string;
  severity: Severity;
  likelihood: 'low' | 'medium' | 'high' | number;
  impact?: number;
  status: 'identified' | 'mitigating' | 'accepted' | 'closed' | 'open' | 'monitoring';
  ownerId: ID;
  mitigation: string;
  productId?: ID;
  projectId?: ID;
  opportunityId?: ID;
  dueDate?: ISODate;
  identifiedAt?: ISODate;
  source: 'manual' | 'ai_extracted';
  createdAt: ISODate;
}

export interface Issue {
  id: ID;
  title: string;
  description: string;
  severity: Severity;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  ownerId: ID;
  projectId?: ID;
  productId?: ID;
  reportedAt: ISODate;
  raisedAt?: ISODate;
  resolution?: string;
  resolvedAt?: ISODate;
}

export interface Decision {
  id: ID;
  title: string;
  context: string;
  decision: string;
  rationale: string;
  decidedBy: ID;
  decidedAt: ISODate;
  status: 'proposed' | 'decided' | 'reversed' | 'pending';
  productId?: ID;
  projectId?: ID;
  opportunityId?: ID;
  source: 'manual' | 'ai_extracted';
}

export interface OpenQuestion {
  id: ID;
  question: string;
  context: string;
  raisedBy: ID;
  raisedAt: ISODate;
  status: 'open' | 'answered' | 'deferred';
  productId?: ID;
  projectId?: ID;
}

export interface Dependency {
  id: ID;
  fromId: ID;
  fromType: ObjectType;
  toId: ID;
  toType: ObjectType;
  kind: 'blocks' | 'depends_on' | 'related_to' | 'duplicates' | 'overlaps';
  notes?: string;
}

export interface Meeting {
  id: ID;
  title: string;
  scheduledAt: ISODate;
  durationMinutes: number;
  attendeeIds: ID[];
  productId?: ID;
  projectId?: ID;
  opportunityId?: ID;
  hasTranscript: boolean;
  summary?: string;
}

export interface Transcript {
  id: ID;
  meetingId?: ID;
  title: string;
  uploadedBy: ID;
  uploadedAt: ISODate;
  rawText: string;
  status: 'uploaded' | 'extracting' | 'extracted' | 'reviewed' | 'committed';
  extractedActionItemIds: ID[];
  extractedRiskIds: ID[];
  extractedDecisionIds: ID[];
  extractedOpportunityIds: ID[];
  extractedDependencyIds: ID[];
}

export interface RoadmapItem {
  id: ID;
  productId: ID;
  name: string;
  description: string;
  quarter: string; // e.g. "2026 Q2"
  status: 'planned' | 'in_progress' | 'released' | 'parked';
  ownerId: ID;
  effortEstimate?: number;
  businessImpact?: Severity;
}

export interface AIUseCase {
  id: ID;
  name: string;
  description: string;
  clientId?: ID;
  productId?: ID;
  maturity: 'idea' | 'poc' | 'pilot' | 'production';
  capabilityIds: ID[];
}

export interface Capability {
  id: ID;
  name: string;
  category: string;
  description: string;
  maturity: 'experimental' | 'beta' | 'mature' | 'flagship';
  ownerId: ID;
  productIds: ID[];
  reusePotential: 'low' | 'medium' | 'high' | 'flagship';
  documentationUrl?: string;
  dependencyIds: ID[];
}

export interface Accelerator {
  id: ID;
  name: string;
  description: string;
  capabilityIds: ID[];
  usedInProductIds: ID[];
  maturity: 'experimental' | 'beta' | 'mature';
  ownerId: ID;
}

export interface LeadershipUpdate {
  id: ID;
  weekOf: ISODate;
  authorId: ID;
  highlights: string[];
  risks: string[];
  asks: string[];
  metrics: Record<string, number>;
  productIds: ID[];
  status: 'draft' | 'published';
}

export interface ResourceAllocation {
  id: ID;
  resourceId: ID;
  productId?: ID;
  projectId?: ID;
  opportunityId?: ID;
  startDate: ISODate;
  endDate: ISODate;
  hoursPerWeek: number;
  role: string;
}

// =============================================================================
// Custom field system — runtime-typed metadata layered onto any canonical object
// =============================================================================

export type CustomFieldType =
  | 'text'
  | 'long_text'
  | 'number'
  | 'percentage'
  | 'currency'
  | 'date'
  | 'dropdown'
  | 'multi_select'
  | 'user'
  | 'location'
  | 'relation'
  | 'url'
  | 'file'
  | 'ai_generated'
  | 'formula'
  | 'risk_score'
  | 'effort_estimate'
  | 'capacity_estimate';

export interface CustomField {
  id: ID;
  objectType: ObjectType;
  name: string;
  key: string;
  type: CustomFieldType;
  options?: string[];
  formula?: string;
  required: boolean;
  showInList: boolean;
  helpText?: string;
}

export interface CustomFieldValue {
  fieldId: ID;
  objectId: ID;
  value: unknown;
}

// =============================================================================
// View configuration — every list inherits this
// =============================================================================

export interface SavedView {
  id: ID;
  name: string;
  objectType: ObjectType;
  filters: ViewFilter[];
  sort: ViewSort[];
  groupBy?: string;
  columns: string[];
  viewKind: 'table' | 'kanban' | 'timeline' | 'calendar' | 'gallery';
  isShared: boolean;
  ownerId: ID;
}

export interface ViewFilter {
  field: string;
  op: 'eq' | 'neq' | 'in' | 'not_in' | 'gt' | 'lt' | 'contains' | 'is_empty' | 'is_not_empty';
  value: unknown;
}

export interface ViewSort {
  field: string;
  direction: 'asc' | 'desc';
}

// =============================================================================
// AI extraction primitives
// =============================================================================

export interface ExtractedItem<T> {
  id: ID;
  kind: 'action_item' | 'risk' | 'decision' | 'opportunity' | 'dependency' | 'product_idea' | 'open_question';
  payload: T;
  confidence: number; // 0-1
  sourceSpan?: { start: number; end: number };
  status: 'pending' | 'accepted' | 'rejected' | 'edited';
}

export interface ExtractionJob {
  id: ID;
  transcriptId: ID;
  startedAt: ISODate;
  completedAt?: ISODate;
  provider: 'mock' | 'openai' | 'anthropic' | 'gemini' | 'oci';
  modelVersion: string;
  status: 'queued' | 'running' | 'complete' | 'failed';
  itemsExtracted: number;
}

// =============================================================================
// Utility view-models
// =============================================================================

export interface UtilizationCell {
  resourceId: ID;
  week: string; // ISO Monday
  allocatedHours: number;
  capacityHours: number;
  utilizationPct: number;
  rag: RAG;
}
