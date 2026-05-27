import { useState, useMemo } from 'react';
import {
  Plus, Star, LayoutGrid, List, BarChart2, Search, Edit2, Trash2,
  AlertCircle, ChevronDown, ChevronUp, Calendar, ClipboardList,
  Mail, User, CheckCircle2, Clock, X, Settings,
} from 'lucide-react';
import { useOpportunities, useCreateOpportunity, useUpdateOpportunity, useDeleteOpportunity } from '@/lib/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Field, FormRow } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { fmtDate, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

// ─── Stage definitions ────────────────────────────────────────────────────────
export const AI_STAGES = [
  { key: 'intro_sent',            label: 'Intro Sent',        num: '0',  group: 'outreach',   color: 'bg-slate-100 text-slate-500',     dot: 'bg-slate-400' },
  { key: 'interest_received',     label: 'Interest Received', num: '1',  group: 'outreach',   color: 'bg-blue-50 text-blue-600',        dot: 'bg-blue-300' },
  { key: 'reply_sent',            label: 'Reply Sent',        num: '2',  group: 'outreach',   color: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500' },
  { key: 'preworkshop_scheduled', label: 'Pre-Workshop',      num: '3',  group: 'workshop',   color: 'bg-blue-200 text-blue-800',       dot: 'bg-blue-600' },
  { key: 'pending_workshop',      label: 'Pending Workshop',  num: '4',  group: 'workshop',   color: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-400' },
  { key: 'workshop_scheduled',    label: 'Scheduled',         num: '5',  group: 'workshop',   color: 'bg-blue-200 text-blue-800',       dot: 'bg-blue-600' },
  { key: 'add_oracle',            label: 'Add Oracle',        num: '6',  group: 'workshop',   color: 'bg-blue-300 text-blue-900',       dot: 'bg-blue-700' },
  { key: 'workshop_executed',     label: 'Workshop Done',     num: '7',  group: 'executed',   color: 'bg-green-100 text-green-700',     dot: 'bg-green-500' },
  { key: 'not_interested',        label: 'Not Interested',    num: '8',  group: 'lost',       color: 'bg-slate-100 text-slate-500',     dot: 'bg-slate-400' },
  { key: 'enabling_ai',           label: 'Enabling AI',       num: '9',  group: 'commercial', color: 'bg-green-100 text-green-700',     dot: 'bg-green-500' },
  { key: 'negotiation_sow',       label: 'Negotiation / SOW', num: '10', group: 'commercial', color: 'bg-green-200 text-green-800',     dot: 'bg-green-600' },
  { key: 'deal_closed',           label: 'Deal Closed',       num: '11', group: 'won',        color: 'bg-green-300 text-green-900',     dot: 'bg-green-700' },
  { key: 'not_legit',             label: 'Not Legit',         num: '12', group: 'lost',       color: 'bg-slate-50 text-slate-400',      dot: 'bg-slate-300' },
] as const;

const STAGE_MAP = Object.fromEntries(AI_STAGES.map(s => [s.key, s]));
const LEGACY_STAGE_MAP: Record<string, string> = {
  qualify: 'reply_sent', discover: 'preworkshop_scheduled',
  propose: 'workshop_executed', negotiate: 'negotiation_sow',
  closed_won: 'deal_closed', closed_lost: 'not_interested',
};

const KANBAN_COLUMNS = [
  { key: 'outreach',   label: 'Outreach',      stages: ['intro_sent','interest_received','reply_sent'], accent: 'border-t-blue-300' },
  { key: 'workshop',   label: 'Workshop Prep', stages: ['preworkshop_scheduled','pending_workshop','workshop_scheduled','add_oracle'], accent: 'border-t-blue-500' },
  { key: 'executed',   label: 'Workshop Done', stages: ['workshop_executed'], accent: 'border-t-green-400' },
  { key: 'commercial', label: 'Commercial',    stages: ['enabling_ai','negotiation_sow','deal_closed'], accent: 'border-t-green-600' },
] as const;

const DEFAULT_SCENARIOS = ['MDM', 'Documantra', 'Sense AI', 'Finance AI', 'Operations Planning', 'Data Governance'];

const SCENARIO_COLORS: Record<string, string> = {
  'MDM': 'bg-blue-100 text-blue-700', 'Documantra': 'bg-blue-50 text-blue-600',
  'Sense AI': 'bg-green-100 text-green-700', 'Finance AI': 'bg-slate-100 text-slate-600',
  'Operations Planning': 'bg-blue-200 text-blue-800', 'Data Governance': 'bg-green-50 text-green-600',
};

const OWNERS_SEED = [
  'Amit Sharma','Vinod Dudeja','Prantik Chakraborty','Chetan Kulkarni',
  'Sanjay A','Manoj Rathi','Sumitesh Anand','Rishabh Chhabra',
  'Swapna','Sriram S','Shivani Sharma','Shantanu','Ravi','Manoj/Suresh',
  'Neha Chaurasia','Molly Chakraborty','TBD',
];

const SESSION_TYPES = ['Workshop','Pre-Workshop','Follow-Up','Demo','SOW Review','Commercial','Deep Dive'];

// ─── Seed data ────────────────────────────────────────────────────────────────
const CALENDAR_SEED = [
  { id:'c1',  company:'PPG',              date:'2025-09-09', time:'11:00 PST', attendees:'Viral, Shivam',         status:'executed',  type:'Workshop' },
  { id:'c2',  company:'GE Vernova',       date:'2025-09-11', time:'07:00 PST', attendees:'Amit',                  status:'executed',  type:'Workshop' },
  { id:'c3',  company:'Wonderful',        date:'2025-09-10', time:'15:00 PST', attendees:'Amit',                  status:'executed',  type:'Pre-Workshop' },
  { id:'c4',  company:'Zimvie',           date:'2025-09-11', time:'12:00 PST', attendees:'Amit',                  status:'executed',  type:'Pre-Workshop' },
  { id:'c5',  company:'Bloom Energy',     date:'2025-09-12', time:'13:00 PST', attendees:'Amit',                  status:'executed',  type:'Workshop' },
  { id:'c6',  company:'GE Vernova',       date:'2025-09-17', time:'07:00 PST', attendees:'Viral',                 status:'executed',  type:'Workshop' },
  { id:'c7',  company:'Revvity',          date:'2025-09-17', time:'08:00 PST', attendees:'Sanjay A',              status:'executed',  type:'Pre-Workshop' },
  { id:'c8',  company:'Air Control',      date:'2025-09-17', time:'09:00 PST', attendees:'Viral, Sumitesh, Amit', status:'executed',  type:'Workshop' },
  { id:'c9',  company:'Oracle',           date:'2025-09-19', time:'14:00 PST', attendees:'Prantik',               status:'executed',  type:'Workshop' },
  { id:'c10', company:'Bloom Energy',     date:'2025-09-19', time:'09:00 PST', attendees:'Prantik',               status:'executed',  type:'Workshop' },
  { id:'c11', company:'SSE',              date:'2025-09-23', time:'06:30 PST', attendees:'Prantik',               status:'executed',  type:'Workshop' },
  { id:'c12', company:'Avery Dennison',   date:'2025-09-25', time:'10:00 PST', attendees:'Prantik',               status:'executed',  type:'Workshop' },
  { id:'c13', company:'Power Integration',date:'2025-09-25', time:'12:00 PST', attendees:'Neha',                  status:'executed',  type:'Workshop' },
  { id:'c14', company:'Watlow',           date:'2025-09-26', time:'13:30 PST', attendees:'Vinod',                 status:'executed',  type:'Workshop' },
  { id:'c15', company:'Itron',            date:'2025-09-29', time:'09:00 PST', attendees:'Chetan',                status:'executed',  type:'Workshop' },
  { id:'c16', company:'Valence',          date:'2025-09-29', time:'09:00 PST', attendees:'Manoj',                 status:'executed',  type:'Pre-Workshop' },
  { id:'c17', company:'10x Genomics',     date:'2025-10-03', time:'13:00 PST', attendees:'Manoj, Suresh',         status:'executed',  type:'Workshop' },
  { id:'c18', company:'Yageo',            date:'2025-10-07', time:'10:00 PST', attendees:'Prantik',               status:'executed',  type:'Workshop' },
  { id:'c19', company:'PPG',              date:'2025-10-09', time:'11:00 PST', attendees:'Viral, Shivam',         status:'executed',  type:'Deep Dive' },
  { id:'c20', company:'Boxout',           date:'2025-11-14', time:'10:00 PST', attendees:'Sanjay A',              status:'executed',  type:'Workshop' },
  { id:'c21', company:'Cummins Inc.',     date:'2025-11-20', time:'09:00 PST', attendees:'Chetan',                status:'executed',  type:'Workshop' },
  { id:'c22', company:'Form Energy',      date:'2025-11-22', time:'10:00 PST', attendees:'Rishabh',               status:'executed',  type:'Workshop' },
  { id:'c23', company:'GE Aerospace',     date:'2025-12-03', time:'09:00 PST', attendees:'Prantik',               status:'executed',  type:'Workshop' },
  { id:'c24', company:'Marvell',          date:'2025-12-10', time:'10:00 PST', attendees:'Prantik',               status:'executed',  type:'Workshop' },
  { id:'c25', company:'PPG',              date:'2026-01-21', time:'11:00 PST', attendees:'Viral, Chetan',         status:'executed',  type:'Deep Dive' },
  { id:'c26', company:'Altera',           date:'2026-02-14', time:'10:00 PST', attendees:'Neha',                  status:'executed',  type:'Workshop' },
  { id:'c27', company:'Air Control',      date:'2026-03-17', time:'10:00 PST', attendees:'Sumitesh',              status:'executed',  type:'Follow-Up' },
  { id:'c28', company:'Niagara Bottling', date:'2026-03-11', time:'10:00 PST', attendees:'Sanjay A',              status:'executed',  type:'Demo' },
  { id:'c29', company:'Coherent',         date:'2026-04-05', time:'10:00 PST', attendees:'Manoj',                 status:'executed',  type:'Workshop' },
  { id:'c30', company:'Onsemi',           date:'2026-06-05', time:'10:00 PST', attendees:'Prantik',               status:'scheduled', type:'Workshop' },
  { id:'c31', company:'ChargePoint',      date:'2026-06-10', time:'11:00 PST', attendees:'Sanjay A',              status:'scheduled', type:'Workshop' },
  { id:'c32', company:'Niagara Bottling', date:'2026-06-12', time:'09:00 PST', attendees:'Sanjay A',              status:'scheduled', type:'Follow-Up' },
  { id:'c33', company:'TDK',              date:'2026-06-15', time:'10:00 PST', attendees:'Sanjay A',              status:'proposed',  type:'Workshop' },
  { id:'c34', company:'Fuji Film',        date:'2026-06-18', time:'09:00 PST', attendees:'Prantik',               status:'proposed',  type:'Workshop' },
  { id:'c35', company:'JR286',            date:'2026-06-20', time:'10:00 PST', attendees:'Sanjay A, Amit',        status:'proposed',  type:'SOW Review' },
  { id:'c36', company:'Bloom Energy',     date:'2026-06-22', time:'11:00 PST', attendees:'Shantanu, Amit',        status:'proposed',  type:'Commercial' },
  { id:'c37', company:'Bimbo Bakeries',   date:'2026-06-25', time:'10:00 PST', attendees:'Sanjay A',              status:'scheduled', type:'Workshop' },
];

const ACTION_SEED = [
  { id:'act1', company:'Boxout', owner:'Sanjay A', scenarios:['Documantra'],
    requirements:['Take non-EDI AP invoices (email, inboxes) — extract, validate, auto-create POs in Oracle.','Take non-EDI Vendor ASNs (emails to buyers) — extract and create ASNs in Oracle.'],
    action:'Share technical details and commercial aspects with Nikhil.', lastDemoed:'' },
  { id:'act2', company:'Now Health Group (NowFoods)', owner:'Sanjay A', scenarios:['Sense AI','Operations Planning'],
    requirements:['Amazon and iHerb demand sensing based on consumer demand data vs existing forecasts.','Scenario Planning — assess raw material shortages, available-to-promise.','Changeover times to optimize scheduling sequencing.','Proactive Service Disruption Navigator — material shortages impact on manufacturing.','Auto creation of work orders.','AI-Powered Cost Optimization to determine most efficient production lines.'],
    action:'31 March: Reviewed cost estimate. Provide detailed commercial pricing. Confirm demo scope.', lastDemoed:'Sense AI demand scenarios' },
  { id:'act3', company:'PPG Industries', owner:'Chetan Kulkarni', scenarios:['Documantra','MDM','Finance AI'],
    requirements:['Documantra — multi-format demo: Handwritten PO, PDF formal PO, Excel PO, email PO.','MDM — Customer data deduplication and merge.','Finance — AP: IDR use case for automated invoice processing.'],
    action:'1. AP Invoice Demo. 2. Schedule 1-hour meeting 2nd/3rd week of March to demo MDM customer use case.',
    lastDemoed:'Reading docs from email/SharePoint/Google Drive. Field extraction from POs.' },
  { id:'act4', company:'Watlow Electric', owner:'Vinod Dudeja', scenarios:['Finance AI','MDM','Operations Planning'],
    requirements:['AP: Use IDR to read emailed supplier invoices; auto-match to POs; create payables.','AR: Combine bank lockbox, AutoLockbox/QuickCash, AI matching to automate cash application.','GL: Calculation Manager — AI-Accelerated Allocations & Rule Maintenance.','FP&A: IPM & Ledger/Planning Agents for variance explanation.','Period End Closing Workbench.','MDM: Data Governance, Deduplication, Data Standards, Data Synch.','Operations: BOM & WD standardization, Fab Connect, AI Production Scheduling.'],
    action:'Send recommended next steps for Finance AI and MDM paths.', lastDemoed:'Finance Demo — AP/AR/GL overview.' },
  { id:'act5', company:'Onsemi', owner:'Prantik Chakraborty', scenarios:['Operations Planning'],
    requirements:['Yield Prediction Use Case — AI model on fab output prediction.','Send automation and AI slides detailing capabilities.'],
    action:'Schedule 90-min AI workshop. Send slides. Invite CIO Niraj.', lastDemoed:'Initial AI intro session.' },
  { id:'act6', company:'GE Vernova', owner:'Prantik Chakraborty', scenarios:['Operations Planning','Documantra'],
    requirements:['Mixed ERP compatibility — how solutions work across Oracle EBS / SAP environments.','Capacity planning and constraint-based solutions.','Document automation for various operational docs.'],
    action:'Schedule specialized workshop focused on EBS migration + AI agents.', lastDemoed:'Internal GE Assessment session.' },
  { id:'act7', company:'ChargePoint', owner:'Sanjay A', scenarios:['MDM','Sense AI','Documantra'],
    requirements:['Broad discovery workshop requested — all scenarios.'],
    action:'1. Schedule 90-min workshop. 2. Invite Patty (Supply Chain). 3. Confirm attendees.', lastDemoed:'' },
  { id:'act8', company:'Bloom Energy', owner:'Shantanu', scenarios:['Data Governance','Documantra'],
    requirements:['AI Data Governance — master data quality and lineage.','Documantra — automated creation of Sales Orders and Work Orders.'],
    action:'Resolve licensing discussion. Move to SOW signing.', lastDemoed:'Full AI Lab workshop — both scenarios.' },
  { id:'act9', company:'JR286', owner:'Sanjay A', scenarios:['Sense AI','Documantra','MDM'],
    requirements:['Sense AI — demand and price sensing.','Documantra — automated document processing.','MDM — master data management.'],
    action:'Close SOW. Amit to follow up after in-person meeting.', lastDemoed:'Full multi-product demo with Amit in person.' },
  { id:'act10', company:'Niagara Bottling', owner:'Sanjay A', scenarios:['Finance AI'],
    requirements:['Investment Buy scenario — AI-powered purchasing decision support.'],
    action:'Follow up end of March. Ani and Avinash to review and respond.', lastDemoed:'Investment Buy Demo completed 11 March.' },
];

// ─── Blank forms ──────────────────────────────────────────────────────────────
const EMPTY_OPP = { name:'', contactName:'', contactTitle:'', contactEmail:'', trinamixOwner:'', aiStage:'reply_sent', dealRating:2, copyOracle:false, emailOwner:'', value:'', interestedScenarios:[] as string[], followUpNotes:'', nextSteps:'', urgentNotes:'', lastReviewed:'' };
const EMPTY_CAL = { company:'', date:'', time:'10:00 PST', attendees:'', status:'scheduled', type:'Workshop' };
const EMPTY_ACT = { company:'', owner:'', scenarios:[] as string[], requirements:[] as string[], action:'', lastDemoed:'' };

// ─── Sub-components ───────────────────────────────────────────────────────────
function StarRating({ value, onChange, readonly }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={13}
          className={cn(n <= value ? 'fill-green-500 text-green-500' : 'text-line fill-transparent',
            !readonly && 'cursor-pointer hover:fill-green-400 hover:text-green-400 transition-colors')}
          onClick={() => !readonly && onChange?.(n === value ? 0 : n)} />
      ))}
    </div>
  );
}

function StageBadge({ stageKey }: { stageKey: string }) {
  const s = STAGE_MAP[stageKey as keyof typeof STAGE_MAP];
  if (!s) return <span className="text-2xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{stageKey}</span>;
  return (
    <span className={cn('inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap', s.color)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />{s.num}. {s.label}
    </span>
  );
}

function ScenarioBadges({ scenarios }: { scenarios: string[] }) {
  if (!scenarios?.length) return <span className="text-ink-muted text-2xs">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {scenarios.map(s => (
        <span key={s} className={cn('text-2xs px-1.5 py-0.5 rounded font-medium', SCENARIO_COLORS[s] ?? 'bg-blue-100 text-blue-700')}>{s}</span>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
type TabKey = 'pipeline' | 'inquiries' | 'calendar' | 'action' | 'summary';

export default function Opportunities() {
  // ── Global filters
  const [tab, setTab] = useState<TabKey>('pipeline');
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterOwner, setFilterOwner] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // ── Opportunity hooks
  const { data: rawOpps = [], isLoading } = useOpportunities();
  const createOpp = useCreateOpportunity();
  const updateOpp = useUpdateOpportunity();
  const deleteOpp = useDeleteOpportunity();
  const toast = useToast();

  // ── Opportunity modal
  const [oppModal, setOppModal] = useState(false);
  const [oppEdit, setOppEdit] = useState<any>(null);
  const [oppForm, setOppForm] = useState({ ...EMPTY_OPP });
  const [oppSaving, setOppSaving] = useState(false);
  const [oppErr, setOppErr] = useState('');
  const [confirmDelOpp, setConfirmDelOpp] = useState<string | null>(null);
  // Scenario editing state
  const [newScenario, setNewScenario] = useState('');
  const [editScenario, setEditScenario] = useState<{ original: string; value: string } | null>(null);

  // ── Calendar state (local, mutable)
  const [calEvents, setCalEvents] = useState(() => CALENDAR_SEED.map(e => ({ ...e })));
  const [calModal, setCalModal] = useState(false);
  const [calEdit, setCalEdit] = useState<any>(null);
  const [calForm, setCalForm] = useState({ ...EMPTY_CAL });
  const [confirmDelCal, setConfirmDelCal] = useState<string | null>(null);
  const [calFilter, setCalFilter] = useState<'all'|'executed'|'scheduled'|'proposed'>('all');

  // ── Action Sheet state (local, mutable)
  const [actItems, setActItems] = useState(() => ACTION_SEED.map(a => ({ ...a })));
  const [actModal, setActModal] = useState(false);
  const [actEdit, setActEdit] = useState<any>(null);
  const [actForm, setActForm] = useState({ ...EMPTY_ACT });
  const [actNewReq, setActNewReq] = useState('');
  const [actNewScenario, setActNewScenario] = useState('');
  const [confirmDelAct, setConfirmDelAct] = useState<string | null>(null);

  // ── Owners management (local, mutable)
  const [owners, setOwners] = useState<string[]>(() => [...OWNERS_SEED]);
  const [ownersModal, setOwnersModal] = useState(false);
  const [ownerNewName, setOwnerNewName] = useState('');
  const [ownerEditing, setOwnerEditing] = useState<{ idx: number; val: string } | null>(null);

  // ── Derived data
  const opps = useMemo(() => (rawOpps as any[]).map(o => ({
    ...o,
    aiStage: o.aiStage ?? LEGACY_STAGE_MAP[o.stage] ?? 'reply_sent',
    dealRating: o.dealRating ?? 0,
    interestedScenarios: o.interestedScenarios ?? [],
    trinamixOwner: o.trinamixOwner ?? '',
  })), [rawOpps]);

  const activeOpps = useMemo(() => opps.filter(o => !['not_interested','not_legit'].includes(o.aiStage)), [opps]);

  const filtered = useMemo(() => opps.filter(o => {
    const q = search.toLowerCase();
    return (!q || (o.name??'').toLowerCase().includes(q) || (o.contactName??'').toLowerCase().includes(q) || (o.trinamixOwner??'').toLowerCase().includes(q))
      && (filterStage === 'all' || o.aiStage === filterStage)
      && (filterOwner === 'all' || o.trinamixOwner === filterOwner)
      && (filterRating === 'all' || String(o.dealRating) === filterRating);
  }), [opps, search, filterStage, filterOwner, filterRating]);

  const ownerSummary = useMemo(() => {
    const m: Record<string, any> = {};
    opps.forEach(o => {
      const ow = o.trinamixOwner || 'Unassigned';
      if (!m[ow]) m[ow] = { owner: ow, count: 0, total: 0, hotCount: 0, stages: {} };
      m[ow].count++; m[ow].total += o.dealRating;
      m[ow].stages[o.aiStage] = (m[ow].stages[o.aiStage]??0)+1;
      if (o.dealRating >= 4) m[ow].hotCount++;
    });
    return Object.values(m).sort((a,b) => b.count - a.count);
  }, [opps]);

  const visibleCal = useMemo(() =>
    calEvents.filter(e => calFilter === 'all' || e.status === calFilter), [calEvents, calFilter]);

  const hotCount = opps.filter(o => o.dealRating >= 4 && !['not_interested','not_legit','deal_closed'].includes(o.aiStage)).length;
  const negCount  = opps.filter(o => o.aiStage === 'negotiation_sow').length;

  // ── Opportunity handlers ────────────────────────────────────────────────────
  function openCreateOpp() { setOppEdit(null); setOppForm({ ...EMPTY_OPP }); setOppErr(''); setOppModal(true); }
  function openEditOpp(o: any) {
    setOppEdit(o);
    setOppForm({ name:o.name??'', contactName:o.contactName??'', contactTitle:o.contactTitle??'',
      contactEmail:o.contactEmail??'', trinamixOwner:o.trinamixOwner??'', aiStage:o.aiStage??'reply_sent',
      dealRating:o.dealRating??0, copyOracle:o.copyOracle??false, emailOwner:o.emailOwner??'',
      value:o.value!=null?String(o.value):'', interestedScenarios:o.interestedScenarios??[],
      followUpNotes:o.followUpNotes??'', nextSteps:o.nextSteps??'',
      urgentNotes:o.urgentNotes??'', lastReviewed:o.lastReviewed?o.lastReviewed.split('T')[0]:'' });
    setOppErr(''); setOppModal(true);
  }
  function setOF(k: string, v: any) { setOppForm(f => ({ ...f, [k]: v })); }

  // Scenario CRUD within opp form
  function addOppScenario(name: string) {
    const t = name.trim(); if (!t || oppForm.interestedScenarios.includes(t)) { setNewScenario(''); return; }
    setOppForm(f => ({ ...f, interestedScenarios: [...f.interestedScenarios, t] })); setNewScenario('');
  }
  function removeOppScenario(name: string) { setOppForm(f => ({ ...f, interestedScenarios: f.interestedScenarios.filter(s => s !== name) })); }
  function commitEditScenario() {
    if (!editScenario) return;
    const n = editScenario.value.trim();
    if (n) setOppForm(f => ({ ...f, interestedScenarios: f.interestedScenarios.map(s => s === editScenario.original ? n : s) }));
    setEditScenario(null);
  }

  async function handleOppSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!oppForm.name.trim()) { setOppErr('Company name is required.'); return; }
    setOppSaving(true); setOppErr('');
    const payload = { ...oppForm, name: oppForm.name.trim(), stage: oppForm.aiStage, value: oppForm.value ? Number(oppForm.value) : 0, probability: 50, lastInteractionAt: new Date().toISOString() };
    try {
      if (oppEdit) { await updateOpp.mutateAsync({ id: oppEdit.id, data: payload }); }
      else { await createOpp.mutateAsync(payload); }
      setOppModal(false);
    } catch (e: any) { setOppErr(e?.message ?? 'Save failed.'); }
    finally { setOppSaving(false); }
  }
  async function handleDeleteOpp(id: string) {
    try { await deleteOpp.mutateAsync(id); setConfirmDelOpp(null); }
    catch (e: any) { void(e?.message ?? 'Delete failed.', 'error'); }
  }

  // ── Calendar handlers ───────────────────────────────────────────────────────
  function openCreateCal() { setCalEdit(null); setCalForm({ ...EMPTY_CAL }); setCalModal(true); }
  function openEditCal(e: any) { setCalEdit(e); setCalForm({ company:e.company, date:e.date, time:e.time, attendees:e.attendees, status:e.status, type:e.type }); setCalModal(true); }
  function setCF(k: string, v: string) { setCalForm(f => ({ ...f, [k]: v })); }
  function handleCalSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!calForm.company.trim() || !calForm.date) return;
    if (calEdit) {
      setCalEvents(evts => evts.map(ev => ev.id === calEdit.id ? { ...ev, ...calForm } : ev));
    } else {
      setCalEvents(evts => [...evts, { ...calForm, id: `c-${Date.now()}` }]);
    }
    setCalModal(false);
  }
  function handleDeleteCal(id: string) {
    setCalEvents(evts => evts.filter(e => e.id !== id)); setConfirmDelCal(null);
  }

  // ── Action Sheet handlers ───────────────────────────────────────────────────
  function openCreateAct() { setActEdit(null); setActForm({ ...EMPTY_ACT }); setActNewReq(''); setActNewScenario(''); setActModal(true); }
  function openEditAct(a: any) {
    setActEdit(a);
    setActForm({ company:a.company, owner:a.owner, scenarios:[...a.scenarios], requirements:[...a.requirements], action:a.action, lastDemoed:a.lastDemoed });
    setActNewReq(''); setActNewScenario(''); setActModal(true);
  }
  function setAF(k: string, v: any) { setActForm(f => ({ ...f, [k]: v })); }
  function handleActSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!actForm.company.trim()) return;
    if (actEdit) {
      setActItems(items => items.map(i => i.id === actEdit.id ? { ...i, ...actForm } : i));
    } else {
      setActItems(items => [...items, { ...actForm, id: `act-${Date.now()}` }]);
    }
    setActModal(false);
  }
  function handleDeleteAct(id: string) {
    setActItems(items => items.filter(i => i.id !== id)); setConfirmDelAct(null);
  }

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading pipeline…</div>;

  const TABS = [
    { key:'pipeline'  as TabKey, label:'Pipeline',    icon:<LayoutGrid size={13}/> },
    { key:'inquiries' as TabKey, label:'AI Inquiries', icon:<List size={13}/> },
    { key:'calendar'  as TabKey, label:'Calendar',    icon:<Calendar size={13}/> },
    { key:'action'    as TabKey, label:'Action Sheet', icon:<ClipboardList size={13}/> },
    { key:'summary'   as TabKey, label:'Summary',     icon:<BarChart2 size={13}/> },
  ];

  return (
    <div>
      {/* Header */}
      <PageHeader eyebrow="AI Experience Labs" title="Opportunities"
        subtitle={`${opps.length} companies · ${hotCount} hot (rating ≥4) · ${negCount} in negotiation`}
        actions={
          <div className="flex items-center gap-1 flex-wrap">
            {TABS.map(t => (
              <Button key={t.key} variant={tab === t.key ? 'primary' : 'ghost'} size="sm"
                onClick={() => setTab(t.key)} className="gap-1">{t.icon}{t.label}
              </Button>
            ))}
            <Button variant="primary" onClick={openCreateOpp} className="ml-1"><Plus size={13}/> New</Button>
          </div>
        }
      />

      {/* Filter bar — Inquiries */}
      {tab === 'inquiries' && (
        <div className="px-6 py-3 border-b border-line flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted"/>
            <Input placeholder="Company, contact, owner…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-52 text-xs"/>
          </div>
          <Select value={filterStage} onChange={e => setFilterStage(e.target.value)} className="text-xs w-40">
            <option value="all">All stages</option>
            {AI_STAGES.map(s => <option key={s.key} value={s.key}>{s.num}. {s.label}</option>)}
          </Select>
          <Select value={filterOwner} onChange={e => setFilterOwner(e.target.value)} className="text-xs w-40">
            <option value="all">All owners</option>
            {owners.map(o => <option key={o} value={o}>{o}</option>)}
          </Select>
          <button onClick={() => setOwnersModal(true)} className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink px-2 py-1 rounded hover:bg-paper-sunken transition-colors"><Settings size={12}/>Owners</button>
          <Select value={filterRating} onChange={e => setFilterRating(e.target.value)} className="text-xs w-28">
            <option value="all">All ratings</option>
            {[5,4,3,2,1,0].map(r => <option key={r} value={r}>{r > 0 ? '★'.repeat(r) : '☆ 0'}</option>)}
          </Select>
          <span className="ml-auto text-2xs text-ink-muted">{filtered.length} of {opps.length}</span>
        </div>
      )}

      {/* ══ PIPELINE ══════════════════════════════════════════════════════════ */}
      {tab === 'pipeline' && (
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {KANBAN_COLUMNS.map(col => {
            const cards = activeOpps.filter(o => (col.stages as readonly string[]).includes(o.aiStage));
            return (
              <div key={col.key}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-ink">{col.label}</span>
                  <span className="text-2xs text-ink-muted bg-paper-sunken px-1.5 py-0.5 rounded-full">{cards.length}</span>
                </div>
                <div className="space-y-2">
                  {cards.length === 0 && (
                    <div className={cn('rounded-lg border-t-2 border bg-paper p-4 text-center text-2xs text-ink-muted', col.accent)}>No companies</div>
                  )}
                  {cards.map(o => {
                    const expanded = expandedCard === o.id;
                    return (
                      <Card key={o.id} className={cn('border-t-2 hover:shadow-md transition-shadow', col.accent)}>
                        <div className="p-3 space-y-2">
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-semibold text-ink leading-tight">{o.name}</span>
                            <div className="flex gap-0.5 shrink-0">
                              <button onClick={() => openEditOpp(o)} className="p-0.5 rounded text-ink-muted hover:text-ink"><Edit2 size={11}/></button>
                              <button onClick={() => setExpandedCard(expanded ? null : o.id)} className="p-0.5 rounded text-ink-muted hover:text-ink">
                                {expanded ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
                              </button>
                            </div>
                          </div>
                          {o.contactName && <div className="text-2xs text-ink-muted">{o.contactName}{o.contactTitle ? ` · ${o.contactTitle}` : ''}</div>}
                          <div className="flex items-center justify-between gap-2">
                            <StarRating value={o.dealRating} readonly/>
                            <StageBadge stageKey={o.aiStage}/>
                          </div>
                          {o.trinamixOwner && <div className="text-2xs text-ink-muted flex items-center gap-1"><User size={9}/>{o.trinamixOwner}</div>}
                          <ScenarioBadges scenarios={o.interestedScenarios}/>
                          {o.urgentNotes && <div className="flex items-center gap-1 text-2xs text-blue-700 bg-blue-50 rounded p-1"><AlertCircle size={10}/>{o.urgentNotes}</div>}
                          {expanded && (
                            <div className="border-t border-line pt-2 space-y-1 text-2xs text-ink-muted">
                              {o.followUpNotes && <p><strong className="text-ink">Notes:</strong> {o.followUpNotes}</p>}
                              {o.nextSteps && <p><strong className="text-ink">Next:</strong> {o.nextSteps}</p>}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ AI INQUIRIES ══════════════════════════════════════════════════════ */}
      {tab === 'inquiries' && (
        <div className="p-6">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-paper-sunken/40 border-b border-line">
                  <tr className="text-2xs uppercase tracking-wider text-ink-muted">
                    <th className="text-left px-4 py-2.5 font-medium w-8">#</th>
                    <th className="text-left px-4 py-2.5 font-medium">Company</th>
                    <th className="text-left px-4 py-2.5 font-medium">Contact</th>
                    <th className="text-left px-4 py-2.5 font-medium">Status</th>
                    <th className="text-center px-4 py-2.5 font-medium">Rating</th>
                    <th className="text-left px-4 py-2.5 font-medium">Owner</th>
                    <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">Scenarios</th>
                    <th className="text-right px-4 py-2.5 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-sm text-ink-muted">No results.</td></tr>}
                  {filtered.map((o, idx) => {
                    const expanded = expandedRows.has(o.id);
                    return (
                      <>
                        <tr key={o.id} className={cn('hover:bg-paper-sunken/30 transition-colors group', expanded && 'bg-paper-sunken/20')}>
                          <td className="px-4 py-2.5 text-2xs text-ink-muted">{idx+1}</td>
                          <td className="px-4 py-2.5">
                            <button onClick={() => setExpandedRows(s => { const n=new Set(s); n.has(o.id)?n.delete(o.id):n.add(o.id); return n; })} className="flex items-start gap-1 text-left">
                              <span className="font-semibold text-xs text-ink hover:text-brand-700">{o.name}</span>
                              {expanded ? <ChevronUp size={12} className="mt-0.5 text-ink-muted shrink-0"/> : <ChevronDown size={12} className="mt-0.5 text-ink-muted shrink-0"/>}
                            </button>
                            {o.urgentNotes && <div className="flex items-center gap-1 text-2xs text-blue-700 mt-0.5"><AlertCircle size={9}/>{o.urgentNotes.slice(0,50)}</div>}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="text-xs text-ink">{o.contactName}</div>
                            {o.contactTitle && <div className="text-2xs text-ink-muted">{o.contactTitle}</div>}
                            {o.contactEmail && <a href={`mailto:${o.contactEmail}`} className="text-2xs text-brand-600 hover:underline flex items-center gap-0.5"><Mail size={9}/>{o.contactEmail.slice(0,26)}{o.contactEmail.length>26?'…':''}</a>}
                          </td>
                          <td className="px-4 py-2.5"><StageBadge stageKey={o.aiStage}/></td>
                          <td className="px-4 py-2.5 text-center"><StarRating value={o.dealRating} readonly/></td>
                          <td className="px-4 py-2.5 text-xs text-ink-muted whitespace-nowrap">{o.trinamixOwner||'—'}</td>
                          <td className="px-4 py-2.5 hidden lg:table-cell"><ScenarioBadges scenarios={o.interestedScenarios}/></td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEditOpp(o)} className="p-1 rounded hover:bg-line text-ink-muted hover:text-ink"><Edit2 size={13}/></button>
                              {confirmDelOpp === o.id ? (
                                <div className="flex gap-1">
                                  <button onClick={() => handleDeleteOpp(o.id)} className="text-2xs px-1.5 py-0.5 rounded bg-red-500 text-white">Del</button>
                                  <button onClick={() => setConfirmDelOpp(null)} className="text-2xs px-1.5 py-0.5 rounded border border-line">✕</button>
                                </div>
                              ) : (
                                <button onClick={() => setConfirmDelOpp(o.id)} className="p-1 rounded hover:bg-line text-ink-muted hover:text-red-500"><Trash2 size={13}/></button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expanded && (
                          <tr key={`${o.id}-exp`} className="bg-paper-sunken/20">
                            <td/><td colSpan={7} className="px-4 pb-4 pt-1">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="space-y-2">
                                  {o.followUpNotes && <div><p className="text-2xs font-semibold uppercase text-ink-muted mb-0.5">Follow-up Notes</p><p className="text-ink bg-paper rounded p-2 border border-line leading-relaxed">{o.followUpNotes}</p></div>}
                                  {o.nextSteps && <div><p className="text-2xs font-semibold uppercase text-ink-muted mb-0.5">Next Steps</p><p className="text-ink bg-paper rounded p-2 border border-line leading-relaxed">{o.nextSteps}</p></div>}
                                </div>
                                <div className="bg-paper rounded p-2 border border-line space-y-1.5">
                                  {o.interestedScenarios?.length > 0 && <div><span className="text-2xs text-ink-muted">Scenarios: </span><ScenarioBadges scenarios={o.interestedScenarios}/></div>}
                                  {o.copyOracle && <p className="text-brand-700 text-2xs">📋 Copy Oracle on comms</p>}
                                  {o.emailOwner && <p className="text-2xs text-ink-muted">Email owner: {o.emailOwner}</p>}
                                  {o.lastReviewed && <p className="text-2xs text-ink-muted flex items-center gap-1"><Clock size={9}/>Last reviewed: {fmtDate(o.lastReviewed)}</p>}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ══ CALENDAR ══════════════════════════════════════════════════════════ */}
      {tab === 'calendar' && (
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-ink-muted">Show:</span>
            {(['all','scheduled','proposed','executed'] as const).map(f => (
              <button key={f} onClick={() => setCalFilter(f)}
                className={cn('text-xs px-3 py-1 rounded-full border transition-all', calFilter===f?'bg-brand-600 text-white border-brand-600':'border-line text-ink-muted hover:border-ink')}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
            <span className="text-2xs text-ink-muted">{visibleCal.length} events</span>
            <Button variant="primary" size="sm" onClick={openCreateCal} className="ml-auto gap-1"><Plus size={13}/>New Event</Button>
          </div>

          {(() => {
            const today = new Date().toISOString().split('T')[0];
            const upcoming = visibleCal.filter(e => e.date >= today).sort((a,b) => a.date.localeCompare(b.date));
            const past = visibleCal.filter(e => e.date < today).sort((a,b) => b.date.localeCompare(a.date));
            return (
              <>
                {upcoming.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2"><CheckCircle2 size={14} className="text-green-600"/>Upcoming Workshops</h3>
                    <div className="space-y-2">
                      {upcoming.map(e => (
                        <Card key={e.id} className="border-l-4 border-l-green-400">
                          <div className="p-3 flex items-center gap-4 group">
                            <div className="min-w-[100px] text-center shrink-0">
                              <div className="text-xs font-bold text-ink">{new Date(e.date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
                              <div className="text-2xs text-ink-muted">{new Date(e.date+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',year:'numeric'})}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-ink">{e.company}</span>
                                <span className={cn('text-2xs px-2 py-0.5 rounded-full font-medium', e.status==='scheduled'?'bg-green-100 text-green-700':'bg-blue-100 text-blue-700')}>{e.status}</span>
                                <span className="text-2xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{e.type}</span>
                              </div>
                              <div className="text-2xs text-ink-muted mt-0.5 flex items-center gap-1"><Clock size={9}/>{e.time} · {e.attendees}</div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button onClick={() => openEditCal(e)} className="p-1 rounded hover:bg-line text-ink-muted hover:text-ink"><Edit2 size={13}/></button>
                              {confirmDelCal === e.id ? (
                                <div className="flex gap-1">
                                  <button onClick={() => handleDeleteCal(e.id)} className="text-2xs px-1.5 py-0.5 rounded bg-red-500 text-white">Del</button>
                                  <button onClick={() => setConfirmDelCal(null)} className="text-2xs px-1.5 py-0.5 rounded border border-line">✕</button>
                                </div>
                              ) : (
                                <button onClick={() => setConfirmDelCal(e.id)} className="p-1 rounded hover:bg-line text-ink-muted hover:text-red-500"><Trash2 size={13}/></button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                {past.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2"><Clock size={14} className="text-ink-muted"/>Past Workshops <span className="text-2xs text-ink-muted font-normal">({past.length} executed)</span></h3>
                    {(() => {
                      const byMonth: Record<string, typeof past> = {};
                      past.forEach(e => { const m=e.date.slice(0,7); if(!byMonth[m]) byMonth[m]=[]; byMonth[m].push(e); });
                      return Object.entries(byMonth).sort((a,b)=>b[0].localeCompare(a[0])).map(([month, evts]) => (
                        <div key={month} className="mb-4">
                          <div className="text-xs font-semibold text-ink-muted mb-2 px-1">{new Date(month+'-15').toLocaleDateString('en-US',{month:'long',year:'numeric'})}</div>
                          <Card>
                            <div className="divide-y divide-line">
                              {evts.map(e => (
                                <div key={e.id} className="flex items-center gap-4 px-4 py-2.5 group hover:bg-paper-sunken/30">
                                  <div className="text-xs text-ink-muted min-w-[36px]">{new Date(e.date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
                                  <div className="flex-1 flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-medium text-ink">{e.company}</span>
                                    <span className="text-2xs px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700">{e.type}</span>
                                    <span className="text-2xs text-ink-muted">{e.time}</span>
                                  </div>
                                  <div className="text-2xs text-ink-muted hidden sm:block">{e.attendees}</div>
                                  <span className="text-2xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">done</span>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditCal(e)} className="p-1 rounded hover:bg-line text-ink-muted hover:text-ink"><Edit2 size={12}/></button>
                                    {confirmDelCal === e.id ? (
                                      <div className="flex gap-1">
                                        <button onClick={() => handleDeleteCal(e.id)} className="text-2xs px-1.5 py-0.5 rounded bg-red-500 text-white">Del</button>
                                        <button onClick={() => setConfirmDelCal(null)} className="text-2xs px-1.5 py-0.5 rounded border border-line">✕</button>
                                      </div>
                                    ) : (
                                      <button onClick={() => setConfirmDelCal(e.id)} className="p-1 rounded hover:bg-line text-ink-muted hover:text-red-500"><Trash2 size={12}/></button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Card>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* ══ ACTION SHEET ══════════════════════════════════════════════════════ */}
      {tab === 'action' && (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-muted">Scenario requirements and action items per active account.</p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOwnersModal(true)} className="gap-1 text-ink-muted"><Settings size={13}/>Manage Owners</Button>
              <Button variant="primary" size="sm" onClick={openCreateAct} className="gap-1"><Plus size={13}/>New Entry</Button>
            </div>
          </div>
          {actItems.map(item => (
            <Card key={item.id}>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-ink">{item.company}</h3>
                      <span className="text-2xs text-ink-muted flex items-center gap-0.5"><User size={9}/>{item.owner}</span>
                    </div>
                    <div className="mt-1"><ScenarioBadges scenarios={item.scenarios}/></div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEditAct(item)} className="p-1.5 rounded hover:bg-line text-ink-muted hover:text-ink transition-colors"><Edit2 size={13}/></button>
                    {confirmDelAct === item.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDeleteAct(item.id)} className="text-2xs px-2 py-1 rounded bg-red-500 text-white">Delete</button>
                        <button onClick={() => setConfirmDelAct(null)} className="text-2xs px-2 py-1 rounded border border-line">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelAct(item.id)} className="p-1.5 rounded hover:bg-line text-ink-muted hover:text-red-500 transition-colors"><Trash2 size={13}/></button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <p className="text-2xs font-semibold uppercase text-ink-muted mb-1.5">Scenario Requirements</p>
                    <ul className="space-y-1">
                      {item.requirements.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-ink">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0"/>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-2xs font-semibold text-blue-800 mb-1">Action</p>
                      <p className="text-xs text-blue-900 leading-relaxed">{item.action}</p>
                    </div>
                    {item.lastDemoed && (
                      <div className="bg-paper-sunken rounded-lg p-3">
                        <p className="text-2xs font-semibold text-ink-muted mb-1">Last Demo</p>
                        <p className="text-xs text-ink leading-relaxed">{item.lastDemoed}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ══ SUMMARY ═══════════════════════════════════════════════════════════ */}
      {tab === 'summary' && (
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">AI Product Interest</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {DEFAULT_SCENARIOS.map(s => {
                const cnt = opps.filter(o => (o.interestedScenarios??[]).includes(s)).length;
                return (
                  <Card key={s} className="p-3 text-center">
                    <div className="text-2xl font-bold text-ink">{cnt}</div>
                    <div className={cn('text-2xs mt-1 px-2 py-0.5 rounded-full font-medium', SCENARIO_COLORS[s]??'bg-gray-100 text-gray-600')}>{s}</div>
                  </Card>
                );
              })}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">Pipeline Funnel</h3>
            <Card>
              <div className="divide-y divide-line">
                {AI_STAGES.map(s => {
                  const cnt = opps.filter(o => o.aiStage === s.key).length;
                  if (!cnt) return null;
                  return (
                    <div key={s.key} className="flex items-center gap-3 px-4 py-2">
                      <span className={cn('text-2xs px-2 py-0.5 rounded-full font-medium w-36 text-center', s.color)}>{s.num}. {s.label}</span>
                      <div className="flex-1 bg-line rounded-full h-2"><div className={cn('h-2 rounded-full', s.dot)} style={{width:`${(cnt/opps.length)*100}%`}}/></div>
                      <span className="text-xs font-semibold text-ink w-6 text-right">{cnt}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">Owner Leaderboard</h3>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-paper-sunken/40 border-b border-line">
                    <tr className="text-2xs uppercase tracking-wider text-ink-muted">
                      <th className="text-left px-4 py-2 font-medium">Owner</th>
                      <th className="text-center px-4 py-2 font-medium">Total</th>
                      <th className="text-center px-4 py-2 font-medium">🔥 Hot</th>
                      <th className="text-center px-4 py-2 font-medium">Avg ★</th>
                      <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Top Stages</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {ownerSummary.map(row => (
                      <tr key={row.owner} className="hover:bg-paper-sunken/30">
                        <td className="px-4 py-2.5 font-medium text-xs text-ink">{row.owner}</td>
                        <td className="px-4 py-2.5 text-center text-xs font-semibold">{row.count}</td>
                        <td className="px-4 py-2.5 text-center text-xs">{row.hotCount > 0 ? <span className="text-green-700 font-semibold">{row.hotCount}</span> : '—'}</td>
                        <td className="px-4 py-2.5 text-center"><StarRating value={Math.round(row.total/row.count)} readonly/></td>
                        <td className="px-4 py-2.5 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(row.stages).sort((a,b)=>Number(b[1])-Number(a[1])).slice(0,3).map(([st,n]) => {
                              const s = STAGE_MAP[st as keyof typeof STAGE_MAP];
                              return s ? <span key={st} className={cn('text-2xs px-1.5 py-0.5 rounded-full',s.color)}>{s.num}. {s.label} ({n as number})</span> : null;
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ══ OPPORTUNITY MODAL ════════════════════════════════════════════════ */}
      <Dialog open={oppModal} onOpenChange={setOppModal}>
        <form onSubmit={handleOppSubmit}>
          <DialogHeader title={oppEdit ? `Edit — ${oppEdit.name}` : 'New Opportunity'} onClose={() => setOppModal(false)} />
          <DialogBody>
            <div className="space-y-4">
              <Field label="Company Name *"><Input value={oppForm.name} onChange={e => setOF('name',e.target.value)} placeholder="Acme Corp"/></Field>
              <FormRow>
                <Field label="Contact Name"><Input value={oppForm.contactName} onChange={e => setOF('contactName',e.target.value)} placeholder="John Smith"/></Field>
                <Field label="Title"><Input value={oppForm.contactTitle} onChange={e => setOF('contactTitle',e.target.value)} placeholder="IT Director"/></Field>
              </FormRow>
              <Field label="Contact Email"><Input type="email" value={oppForm.contactEmail} onChange={e => setOF('contactEmail',e.target.value)} placeholder="john@company.com"/></Field>
              <FormRow>
                <Field label="Trinamix Owner">
                  <Select value={oppForm.trinamixOwner} onChange={e => setOF('trinamixOwner',e.target.value)}>
                    <option value="">Select…</option>
                    {owners.map(o => <option key={o} value={o}>{o}</option>)}
                  </Select>
                </Field>
                <Field label="Stage">
                  <Select value={oppForm.aiStage} onChange={e => setOF('aiStage',e.target.value)}>
                    {AI_STAGES.map(s => <option key={s.key} value={s.key}>{s.num}. {s.label}</option>)}
                  </Select>
                </Field>
              </FormRow>
              <FormRow>
                <Field label="Deal Rating (0–5)">
                  <div className="flex items-center gap-2 h-9">
                    <StarRating value={oppForm.dealRating} onChange={v => setOF('dealRating',v)}/>
                    <span className="text-xs text-ink-muted">{oppForm.dealRating}/5</span>
                  </div>
                </Field>
                <Field label="CRM Value (USD)"><Input type="number" value={oppForm.value} onChange={e => setOF('value',e.target.value)} placeholder="0"/></Field>
              </FormRow>
              <FormRow>
                <Field label="Email Owner"><Input value={oppForm.emailOwner} onChange={e => setOF('emailOwner',e.target.value)} placeholder="Account rep"/></Field>
                <Field label="Last Reviewed"><Input type="date" value={oppForm.lastReviewed} onChange={e => setOF('lastReviewed',e.target.value)}/></Field>
              </FormRow>
              <Field label="Copy Oracle?">
                <label className="flex items-center gap-2 cursor-pointer h-9">
                  <input type="checkbox" checked={oppForm.copyOracle} onChange={e => setOF('copyOracle',e.target.checked)} className="w-4 h-4 rounded"/>
                  <span className="text-sm text-ink">Yes — include Oracle in communications</span>
                </label>
              </Field>

              {/* ── Editable Scenarios ── */}
              <Field label="Interested AI Scenarios">
                {/* Selected pills — click name to edit, ✕ to remove */}
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                  {oppForm.interestedScenarios.length === 0 && <span className="text-xs text-ink-muted">None selected</span>}
                  {oppForm.interestedScenarios.map(s => {
                    const isEditing = editScenario?.original === s;
                    return isEditing ? (
                      <input key={s} autoFocus value={editScenario.value}
                        onChange={e => setEditScenario({ original: s, value: e.target.value })}
                        onBlur={commitEditScenario}
                        onKeyDown={e => { if (e.key==='Enter'){ e.preventDefault(); commitEditScenario(); } if(e.key==='Escape') setEditScenario(null); }}
                        className="text-xs px-2.5 py-1 rounded-full border border-brand-500 focus:outline-none bg-white w-32 font-medium"
                      />
                    ) : (
                      <span key={s} className={cn('inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium', SCENARIO_COLORS[s] ?? 'bg-blue-100 text-blue-700')}>
                        <button type="button" title="Click to rename" onClick={() => setEditScenario({ original: s, value: s })} className="hover:opacity-70 transition-opacity">{s}</button>
                        <button type="button" onClick={() => removeOppScenario(s)} className="opacity-60 hover:opacity-100 transition-opacity ml-0.5"><X size={11}/></button>
                      </span>
                    );
                  })}
                </div>
                {/* Add custom input */}
                <div className="flex gap-2 mb-2">
                  <Input value={newScenario} onChange={e => setNewScenario(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter'){ e.preventDefault(); addOppScenario(newScenario); } }}
                    placeholder="Type scenario name…" className="flex-1 text-xs"/>
                  <Button type="button" variant="ghost" size="sm" onClick={() => addOppScenario(newScenario)} disabled={!newScenario.trim()}>
                    <Plus size={13}/> Add
                  </Button>
                </div>
                {/* Quick-add predefined suggestions */}
                {DEFAULT_SCENARIOS.filter(s => !oppForm.interestedScenarios.includes(s)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-2xs text-ink-muted">Quick add:</span>
                    {DEFAULT_SCENARIOS.filter(s => !oppForm.interestedScenarios.includes(s)).map(s => (
                      <button type="button" key={s} onClick={() => addOppScenario(s)}
                        className="text-2xs px-2 py-0.5 rounded-full border border-line text-ink-muted hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50 transition-all">
                        + {s}
                      </button>
                    ))}
                  </div>
                )}
              </Field>

              <Field label="Follow-up Notes">
                <textarea value={oppForm.followUpNotes} onChange={e => setOF('followUpNotes',e.target.value)} rows={3} placeholder="Meeting notes, history…"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"/>
              </Field>
              <Field label="Next Steps">
                <textarea value={oppForm.nextSteps} onChange={e => setOF('nextSteps',e.target.value)} rows={2} placeholder="What needs to happen next…"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"/>
              </Field>
              <Field label="Urgent Notes"><Input value={oppForm.urgentNotes} onChange={e => setOF('urgentNotes',e.target.value)} placeholder="Any urgent action items…"/></Field>
              {oppErr && <p className="text-sm text-red-600">{oppErr}</p>}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOppModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={oppSaving}>{oppSaving ? 'Saving…' : oppEdit ? 'Save changes' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* ══ CALENDAR MODAL ═══════════════════════════════════════════════════ */}
      <Dialog open={calModal} onOpenChange={setCalModal}>
        <form onSubmit={handleCalSubmit}>
          <DialogHeader title={calEdit ? 'Edit Event' : 'New Calendar Event'} onClose={() => setCalModal(false)} />
          <DialogBody>
            <div className="space-y-4">
              <Field label="Company *"><Input value={calForm.company} onChange={e => setCF('company',e.target.value)} placeholder="Acme Corp"/></Field>
              <FormRow>
                <Field label="Date *"><Input type="date" value={calForm.date} onChange={e => setCF('date',e.target.value)}/></Field>
                <Field label="Time (PST)"><Input value={calForm.time} onChange={e => setCF('time',e.target.value)} placeholder="10:00 PST"/></Field>
              </FormRow>
              <Field label="Attendees"><Input value={calForm.attendees} onChange={e => setCF('attendees',e.target.value)} placeholder="Amit, Viral, Sanjay A"/></Field>
              <FormRow>
                <Field label="Session Type">
                  <Select value={calForm.type} onChange={e => setCF('type',e.target.value)}>
                    {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </Field>
                <Field label="Status">
                  <Select value={calForm.status} onChange={e => setCF('status',e.target.value)}>
                    <option value="scheduled">Scheduled</option>
                    <option value="proposed">Proposed</option>
                    <option value="executed">Executed</option>
                  </Select>
                </Field>
              </FormRow>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setCalModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{calEdit ? 'Save changes' : 'Add Event'}</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* ══ ACTION SHEET MODAL ═══════════════════════════════════════════════ */}
      <Dialog open={actModal} onOpenChange={setActModal}>
        <form onSubmit={handleActSubmit}>
          <DialogHeader title={actEdit ? `Edit — ${actEdit.company}` : 'New Action Item'} onClose={() => setActModal(false)} />
          <DialogBody>
            <div className="space-y-4">
              <FormRow>
                <Field label="Company *"><Input value={actForm.company} onChange={e => setAF('company',e.target.value)} placeholder="PPG Industries"/></Field>
                <Field label="Owner">
                  <Select value={actForm.owner} onChange={e => setAF('owner',e.target.value)}>
                    <option value="">Select…</option>
                    {owners.map(o => <option key={o} value={o}>{o}</option>)}
                  </Select>
                </Field>
              </FormRow>

              {/* Scenarios */}
              <Field label="Scenarios">
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                  {actForm.scenarios.map(s => (
                    <span key={s} className={cn('inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium', SCENARIO_COLORS[s] ?? 'bg-blue-100 text-blue-700')}>
                      {s}
                      <button type="button" onClick={() => setAF('scenarios', actForm.scenarios.filter(x => x !== s))} className="opacity-60 hover:opacity-100"><X size={11}/></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mb-2">
                  <Input value={actNewScenario} onChange={e => setActNewScenario(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter'){ e.preventDefault(); const t=actNewScenario.trim(); if(t && !actForm.scenarios.includes(t)){ setAF('scenarios',[...actForm.scenarios,t]); setActNewScenario(''); } }}}
                    placeholder="Scenario name…" className="flex-1 text-xs"/>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { const t=actNewScenario.trim(); if(t && !actForm.scenarios.includes(t)){ setAF('scenarios',[...actForm.scenarios,t]); setActNewScenario(''); } }} disabled={!actNewScenario.trim()}><Plus size={13}/> Add</Button>
                </div>
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-2xs text-ink-muted">Quick:</span>
                  {DEFAULT_SCENARIOS.filter(s => !actForm.scenarios.includes(s)).map(s => (
                    <button type="button" key={s} onClick={() => setAF('scenarios',[...actForm.scenarios,s])} className="text-2xs px-2 py-0.5 rounded-full border border-line text-ink-muted hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50 transition-all">+ {s}</button>
                  ))}
                </div>
              </Field>

              {/* Requirements */}
              <Field label="Scenario Requirements">
                <div className="space-y-1.5 mb-2">
                  {actForm.requirements.map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0"/>
                      <Input value={r} onChange={e => setAF('requirements', actForm.requirements.map((x,j) => j===i ? e.target.value : x))} className="flex-1 text-xs"/>
                      <button type="button" onClick={() => setAF('requirements', actForm.requirements.filter((_,j) => j!==i))} className="mt-1.5 text-ink-muted hover:text-red-500"><X size={13}/></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={actNewReq} onChange={e => setActNewReq(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter'){ e.preventDefault(); const t=actNewReq.trim(); if(t){ setAF('requirements',[...actForm.requirements,t]); setActNewReq(''); } }}}
                    placeholder="Add requirement…" className="flex-1 text-xs"/>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { const t=actNewReq.trim(); if(t){ setAF('requirements',[...actForm.requirements,t]); setActNewReq(''); } }} disabled={!actNewReq.trim()}><Plus size={13}/> Add</Button>
                </div>
              </Field>

              <Field label="Action / Next Steps">
                <textarea value={actForm.action} onChange={e => setAF('action',e.target.value)} rows={3}
                  placeholder="What needs to be done..."
                  className="w-full text-sm px-3 py-2 rounded-lg border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"/>
              </Field>
              <Field label="Last Demo">
                <Input value={actForm.lastDemoed} onChange={e => setAF('lastDemoed',e.target.value)} placeholder="What was shown in the last session..."/>
              </Field>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setActModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{actEdit ? 'Save changes' : 'Add Entry'}</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* OWNERS MANAGEMENT MODAL */}
      <Dialog open={ownersModal} onOpenChange={setOwnersModal} maxWidth="max-w-sm">
        <DialogHeader title="Manage Owners" description="Add, rename, or remove owners from the dropdown." onClose={() => setOwnersModal(false)} />
        <DialogBody>
          <ul className="space-y-1">
            {owners.map((name, idx) => (
              <li key={idx} className="flex items-center gap-2 group">
                {ownerEditing?.idx === idx ? (
                  <>
                    <input
                      autoFocus
                      value={ownerEditing.val}
                      onChange={e => setOwnerEditing({ idx, val: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const v = ownerEditing.val.trim();
                          if (v) setOwners(prev => prev.map((o, i) => i === idx ? v : o));
                          setOwnerEditing(null);
                        }
                        if (e.key === 'Escape') setOwnerEditing(null);
                      }}
                      className="flex-1 text-xs px-2 py-1 border border-brand rounded focus:outline-none"
                    />
                    <button onClick={() => { const v = ownerEditing.val.trim(); if (v) setOwners(prev => prev.map((o, i) => i === idx ? v : o)); setOwnerEditing(null); }} className="text-2xs px-2 py-1 rounded bg-brand text-white">Save</button>
                    <button onClick={() => setOwnerEditing(null)} className="text-2xs px-2 py-1 rounded border border-line text-ink-muted">Cancel</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-xs text-ink py-1">{name}</span>
                    <button onClick={() => setOwnerEditing({ idx, val: name })} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-paper-sunken text-ink-muted hover:text-ink transition-all"><Edit2 size={12}/></button>
                    <button onClick={() => setOwners(prev => prev.filter((_, i) => i !== idx))} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-paper-sunken text-ink-muted hover:text-red-500 transition-all"><Trash2 size={12}/></button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="flex gap-2 mt-4 pt-3 border-t border-line">
            <input
              value={ownerNewName}
              onChange={e => setOwnerNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { const v = ownerNewName.trim(); if (v && !owners.includes(v)) { setOwners(prev => [...prev, v]); setOwnerNewName(''); } } }}
              placeholder="New owner name..."
              className="flex-1 text-xs px-2 py-1.5 border border-line rounded focus:outline-none focus:border-brand"
            />
            <button
              onClick={() => { const v = ownerNewName.trim(); if (v && !owners.includes(v)) { setOwners(prev => [...prev, v]); setOwnerNewName(''); } }}
              disabled={!ownerNewName.trim() || owners.includes(ownerNewName.trim())}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-brand text-white disabled:opacity-40"
            ><Plus size={12}/>Add</button>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="primary" onClick={() => setOwnersModal(false)}>Done</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
