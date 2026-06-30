import { useState, useMemo, useRef } from 'react';
import {
  Plus, Star, LayoutGrid, List, BarChart2, Search, Edit2, Trash2,
  AlertCircle, ChevronDown, ChevronUp, Calendar, ClipboardList,
  Mail, User, CheckCircle2, Clock, X, Settings,
  Mic, Send, Download, AlertTriangle, Sheet, History,
} from 'lucide-react';
import { useOpportunities, useCreateOpportunity, useUpdateOpportunity, useDeleteOpportunity } from '@/lib/hooks';
import { getUser } from '@/lib/api';
import { AI_STAGES } from '@/lib/stages';
import { SheetGrid, SHEETS } from '@/pages/Spreadsheet';
import { isFollowUpDue, buildFollowUpMailto, sortOpportunities, findDuplicateNames, sortPlanningRows, sumPlannedResources, appendHistory, toPlanningCsv } from '@/lib/opportunityUtils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Field, FormRow } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { fmtDate, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

// ─── Stage definitions ────────────────────────────────────────────────────────

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
const EMPTY_OPP = { name:'', contactName:'', contactTitle:'', contactEmail:'', trinamixOwner:'', aiStage:'reply_sent', dealRating:2, copyOracle:false, emailOwner:'', value:'', interestedScenarios:[] as string[], followUpNotes:'', nextSteps:'', urgentNotes:'', lastReviewed:'', followUpDate:'', plannedStartDate:'', plannedEndDate:'', plannedResources:'', teamAssignment:'', parked:false, history:[] as any[], newUpdate:'' };
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

// Mic dictation (Web Speech API)
function MicButton({ onResult, title }: { onResult: (t: string) => void; title?: string }) {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('');
  const recRef = useRef<any>(null);

  async function ensureMicPermission(): Promise<boolean> {
    try {
      const md = (navigator as any).mediaDevices;
      if (md?.getUserMedia) {
        const stream = await md.getUserMedia({ audio: true });
        stream.getTracks().forEach((t: any) => t.stop());
      }
      return true;
    } catch {
      setStatus('Mic blocked — click the camera/lock icon in the address bar, allow microphone, reload.');
      return false;
    }
  }

  async function start() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setStatus('Use Chrome or Edge for voice.'); return; }
    if (!(window as any).isSecureContext) { setStatus('Voice needs an https page.'); return; }
    const ok = await ensureMicPermission();
    if (!ok) return;
    let rec: any;
    try { rec = new SR(); } catch { setStatus('Could not start mic.'); return; }
    rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = true; rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const txt = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          const t = (txt || '').trim();
          if (t) { onResult(t); setStatus('Added \u2713  still listening…'); }
        } else interim += txt;
      }
      if (interim.trim()) setStatus('Hearing: ' + interim.trim().slice(0, 60));
    };
    rec.onerror = (e: any) => {
      setListening(false);
      const code = e?.error;
      if (code === 'not-allowed' || code === 'service-not-allowed') setStatus('Mic blocked — allow it in the address bar, then reload.');
      else if (code === 'no-speech') setStatus('No speech heard — click and speak.');
      else if (code === 'audio-capture') setStatus('No microphone found.');
      else if (code === 'network') setStatus('No internet for voice service.');
      else if (code && code !== 'aborted') setStatus('Voice error: ' + code);
    };
    rec.onend = () => { setListening(false); setStatus(p => (p.startsWith('Hearing') ? '' : p)); };
    recRef.current = rec;
    setListening(true); setStatus('Listening… speak now');
    try { rec.start(); } catch { setListening(false); }
  }

  function toggle() {
    if (listening) { try { recRef.current?.stop(); } catch {} setListening(false); setStatus(''); return; }
    setStatus(''); void start();
  }

  return (
    <div className="flex flex-col items-center gap-1 shrink-0 self-start w-24">
      <button type="button" onClick={toggle} title={title || (listening ? 'Listening — click to stop' : 'Click, then speak')}
        className={cn('p-2 rounded-lg border transition-colors',
          listening ? 'bg-red-500 text-white border-red-500 animate-pulse' : 'border-line text-ink-muted hover:text-brand-700 hover:border-brand-400')}>
        <Mic size={14} />
      </button>
      {status && <span className="text-[10px] leading-tight text-ink-muted text-center">{status}</span>}
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
type TabKey = 'grid' | 'pipeline' | 'inquiries' | 'planning' | 'calendar' | 'action' | 'summary';

export default function Opportunities() {
  // ── Global filters
  const [tab, setTab] = useState<TabKey>('grid');
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterOwner, setFilterOwner] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [sortKey, setSortKey] = useState<'rating'|'name'|'followup'>('rating');
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
  const [modalConfirmDel, setModalConfirmDel] = useState(false);
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
    aiStage:o.aiStage??o.stage??o.stage??o.stage?? LEGACY_STAGE_MAP[o.stage] ?? 'reply_sent',
    dealRating: o.dealRating ?? 0,
    interestedScenarios: o.interestedScenarios ?? [],
    trinamixOwner: o.trinamixOwner ?? '',
  })), [rawOpps]);

  const activeOpps = useMemo(() => opps.filter(o => !['not_interested','not_legit'].includes(o.aiStage)), [opps]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = opps.filter(o =>
      (!q || (o.name??'').toLowerCase().includes(q) || (o.contactName??'').toLowerCase().includes(q) || (o.trinamixOwner??'').toLowerCase().includes(q))
      && (filterStage === 'all' || o.aiStage === filterStage)
      && (filterOwner === 'all' || o.trinamixOwner === filterOwner)
      && (filterRating === 'all' || String(o.dealRating) === filterRating));
    return sortOpportunities(list, sortKey);
  }, [opps, search, filterStage, filterOwner, filterRating, sortKey]);

  // Duplicate company-name detection (normalized)
  const dupNames = useMemo(() => findDuplicateNames(opps), [opps]);

  // Follow-ups due today/overdue
  const dueOpps = useMemo(() => opps.filter(isFollowUpDue), [opps]);

  // Resource-planning rows: active first by start date, parked sink to bottom
  const planningRows = useMemo(() => sortPlanningRows(opps), [opps]);
  const totalPlannedResources = useMemo(() => sumPlannedResources(planningRows), [planningRows]);

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
  function openCreateOpp() { setOppEdit(null); setOppForm({ ...EMPTY_OPP }); setOppErr(''); setModalConfirmDel(false); setOppModal(true); }
  function openEditOpp(o: any) {
    setOppEdit(o);
    setOppForm({ name:o.name??'', contactName:o.contactName??'', contactTitle:o.contactTitle??'',
      contactEmail:o.contactEmail??'', trinamixOwner:o.trinamixOwner??'', aiStage:o.aiStage??o.stage??o.stage??o.stage??'reply_sent',
      dealRating:o.dealRating??0, copyOracle:o.copyOracle??false, emailOwner:o.emailOwner??'',
      value:o.value!=null?String(o.value):'', interestedScenarios:o.interestedScenarios??[],
      followUpNotes:o.followUpNotes??'', nextSteps:o.nextSteps??'',
      urgentNotes:o.urgentNotes??'', lastReviewed:o.lastReviewed?o.lastReviewed.split('T')[0]:'',
      followUpDate:o.followUpDate?o.followUpDate.split('T')[0]:'',
      plannedStartDate:o.plannedStartDate?o.plannedStartDate.split('T')[0]:'',
      plannedEndDate:o.plannedEndDate?o.plannedEndDate.split('T')[0]:'',
      plannedResources:o.plannedResources!=null?String(o.plannedResources):'',
      teamAssignment:o.teamAssignment??'', parked:Boolean(o.parked),
      history:Array.isArray(o.history)?o.history:[], newUpdate:'' });
    setOppErr(''); setModalConfirmDel(false); setOppModal(true);
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

  async function handleOppSubmit(e) {
    e.preventDefault();
    if (!oppForm.name.trim()) { setOppErr("Company name is required."); return; }
    setOppSaving(true); setOppErr("");
    var isNew = !oppEdit;
    const nextHistory = appendHistory(oppForm.history, oppForm.newUpdate, getUser()?.name || oppForm.trinamixOwner || 'You');
    var payload = {
      name:                oppForm.name.trim(),
      description:         oppForm.followUpNotes && oppForm.followUpNotes.trim() ? oppForm.followUpNotes.trim() : oppForm.name.trim(),
      stage:               oppForm.aiStage || oppForm.stage || "qualify",
      value:               oppForm.value ? Number(oppForm.value) : 0,
      probability:         50,
      strategicImportance: "medium",
      lastInteractionAt:   new Date().toISOString(),
      nextSteps:           oppForm.nextSteps || null,
      contactName:         oppForm.contactName || null,
      contactTitle:        oppForm.contactTitle || null,
      contactEmail:        oppForm.contactEmail || null,
      trinamixOwner:       oppForm.trinamixOwner || null,
      dealRating:          Number(oppForm.dealRating) || 0,
      copyOracle:          Boolean(oppForm.copyOracle),
      emailOwner:          oppForm.emailOwner || null,
      interestedScenarios: oppForm.interestedScenarios || [],
      followUpNotes:       oppForm.followUpNotes || null,
      urgentNotes:         oppForm.urgentNotes || null,
      lastReviewed:        oppForm.lastReviewed ? new Date(oppForm.lastReviewed).toISOString() : null,
      followUpDate:        oppForm.followUpDate ? new Date(oppForm.followUpDate).toISOString() : null,
      plannedStartDate:    oppForm.plannedStartDate ? new Date(oppForm.plannedStartDate).toISOString() : null,
      plannedEndDate:      oppForm.plannedEndDate ? new Date(oppForm.plannedEndDate).toISOString() : null,
      plannedResources:    oppForm.plannedResources ? Number(oppForm.plannedResources) : 0,
      teamAssignment:      oppForm.teamAssignment || null,
      parked:              Boolean(oppForm.parked),
      history:             nextHistory,
    };
    if (isNew) {
      payload.expectedCloseDate = new Date(Date.now() + 90*86400000).toISOString();
      payload.clientId = "c-roku";
      payload.ownerId  = "r-viral";
    }
    try {
      if (oppEdit) { await updateOpp.mutateAsync(Object.assign({ id: oppEdit.id }, payload)); }
      else { await createOpp.mutateAsync(payload); }
      setOppModal(false);
    } catch(err) { setOppErr(err && err.message ? err.message : "Save failed."); }
    finally { setOppSaving(false); }
  }
  async function handleDeleteOpp(id: string) {
    try { await deleteOpp.mutateAsync(id); setConfirmDelOpp(null); }
    catch (e: any) { void(e?.message ?? 'Delete failed.', 'error'); }
  }
  async function handleModalDelete() {
    if (!oppEdit) return;
    try { await deleteOpp.mutateAsync(oppEdit.id); setModalConfirmDel(false); setOppModal(false); }
    catch (e: any) { setOppErr(e?.message ?? 'Delete failed.'); }
  }
  async function patchOpp(id: string, data: Record<string, any>) {
    try { await updateOpp.mutateAsync({ id, ...data }); }
    catch (e: any) { setOppErr(e?.message ?? 'Update failed.'); }
  }
  function exportPlanningCsv() {
    const csv = toPlanningCsv(planningRows, (k) => STAGE_MAP[k as keyof typeof STAGE_MAP]?.label ?? k);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'opportunity-planning.csv'; a.click();
    URL.revokeObjectURL(url);
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
    { key:'grid'      as TabKey, label:'Grid',        icon:<Sheet size={13}/> },
    { key:'pipeline'  as TabKey, label:'Pipeline',    icon:<LayoutGrid size={13}/> },
    { key:'inquiries' as TabKey, label:'AI Inquiries', icon:<List size={13}/> },
    { key:'planning'  as TabKey, label:'Planning',    icon:<Sheet size={13}/> },
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


      {/* ══ GRID (inline editable, sort + filter, no popup) ══════════════════ */}
      {tab === 'grid' && (
        <div className="p-6"><SheetGrid def={SHEETS[0]} enabled={tab === 'grid'} /></div>
      )}

      {/* ══ PIPELINE ══ (inline grid) */}
      {tab === 'pipeline' && (
        <div className="p-6"><SheetGrid def={SHEETS[0]} enabled={tab === 'pipeline'} /></div>
      )}

      {/* ══ AI INQUIRIES ══ (inline grid) */}
      {tab === 'inquiries' && (
        <div className="p-6"><SheetGrid def={SHEETS[0]} enabled={tab === 'inquiries'} /></div>
      )}

      {/* ══ PLANNING (inline editable grid) ══════════════════════════════════ */}
      {tab === 'planning' && (
        <div className="p-6"><SheetGrid def={SHEETS[1]} enabled={tab === 'planning'} /></div>
      )}

      {/* ══ CALENDAR / WORKSHOPS ══ (inline grid) */}
      {tab === 'calendar' && (
        <div className="p-6"><SheetGrid def={SHEETS[2]} enabled={tab === 'calendar'} /></div>
      )}

      {/* ══ ACTION SHEET ══ (inline grid) */}
      {tab === 'action' && (
        <div className="p-6"><SheetGrid def={SHEETS[3]} enabled={tab === 'action'} /></div>
      )}

      {/* ══ SUMMARY ══ (inline grid) */}
      {tab === 'summary' && (
        <div className="p-6"><SheetGrid def={SHEETS[4]} enabled={tab === 'summary'} /></div>
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
              <FormRow>
                <Field label="Follow-up Date (highlights when due)"><Input type="date" value={oppForm.followUpDate} onChange={e => setOF('followUpDate',e.target.value)}/></Field>
                <Field label="# Resources (planning)"><Input type="number" min="0" value={oppForm.plannedResources} onChange={e => setOF('plannedResources',e.target.value)} placeholder="0"/></Field>
              </FormRow>
              <FormRow>
                <Field label="Planned Start"><Input type="date" value={oppForm.plannedStartDate} onChange={e => setOF('plannedStartDate',e.target.value)}/></Field>
                <Field label="Planned End"><Input type="date" value={oppForm.plannedEndDate} onChange={e => setOF('plannedEndDate',e.target.value)}/></Field>
              </FormRow>
              <FormRow>
                <Field label="Team Assignment"><Input value={oppForm.teamAssignment} onChange={e => setOF('teamAssignment',e.target.value)} placeholder="e.g. Rohit + 2 devs"/></Field>
                <Field label="Parked?">
                  <label className="flex items-center gap-2 cursor-pointer h-9">
                    <input type="checkbox" checked={oppForm.parked} onChange={e => setOF('parked',e.target.checked)} className="w-4 h-4 rounded"/>
                    <span className="text-sm text-ink">Not starting yet — lowlight in planning</span>
                  </label>
                </Field>
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

              <Field label="Add Update (timestamped — previous updates are preserved)">
                <div className="flex gap-2 items-start">
                  <textarea value={oppForm.newUpdate} onChange={e => setOF('newUpdate',e.target.value)} rows={2} placeholder="Type or dictate an update — saved with today's date on top of the history…"
                    className="w-full text-sm px-3 py-2 rounded-lg border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"/>
                  <MicButton title="Dictate update" onResult={t => setOppForm(f => ({ ...f, newUpdate: (f.newUpdate ? f.newUpdate + ' ' : '') + t }))}/>
                </div>
                {oppForm.history.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-line bg-paper-sunken/40 divide-y divide-line">
                    {oppForm.history.map((h:any,i:number) => (
                      <div key={i} className="px-3 py-1.5">
                        <div className="text-2xs text-ink-muted">{fmtDate(h.date)}{h.author?` · ${h.author}`:''}</div>
                        <div className="text-2xs text-ink leading-relaxed">{h.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Field>
              <Field label="Follow-up Notes (general)">
                <div className="flex gap-2 items-start">
                  <textarea value={oppForm.followUpNotes} onChange={e => setOF('followUpNotes',e.target.value)} rows={3} placeholder="General notes…"
                    className="w-full text-sm px-3 py-2 rounded-lg border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"/>
                  <MicButton title="Dictate notes" onResult={t => setOppForm(f => ({ ...f, followUpNotes: (f.followUpNotes ? f.followUpNotes + ' ' : '') + t }))}/>
                </div>
              </Field>
              <Field label="Next Steps">
                <div className="flex gap-2 items-start">
                  <textarea value={oppForm.nextSteps} onChange={e => setOF('nextSteps',e.target.value)} rows={2} placeholder="What needs to happen next…"
                    className="w-full text-sm px-3 py-2 rounded-lg border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"/>
                  <MicButton title="Dictate next steps" onResult={t => setOppForm(f => ({ ...f, nextSteps: (f.nextSteps ? f.nextSteps + ' ' : '') + t }))}/>
                </div>
              </Field>
              <Field label="Urgent Notes"><Input value={oppForm.urgentNotes} onChange={e => setOF('urgentNotes',e.target.value)} placeholder="Any urgent action items…"/></Field>
              {oppErr && <p className="text-sm text-red-600">{oppErr}</p>}
            </div>
          </DialogBody>
          <DialogFooter>
            {oppEdit && (
              modalConfirmDel ? (
                <div className="mr-auto flex items-center gap-2">
                  <span className="text-xs text-red-600 font-medium">Delete this opportunity?</span>
                  <Button type="button" variant="ghost" onClick={() => setModalConfirmDel(false)}>Cancel</Button>
                  <button type="button" onClick={handleModalDelete} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-red-500 text-white hover:bg-red-600"><Trash2 size={13}/>Delete</button>
                </div>
              ) : (
                <button type="button" onClick={() => setModalConfirmDel(true)} className="mr-auto inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50"><Trash2 size={13}/>Delete</button>
              )
            )}
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
