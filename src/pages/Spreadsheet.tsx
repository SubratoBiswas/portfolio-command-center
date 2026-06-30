import { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sheet, Plus, Trash2, Download, Search, Star, ChevronUp, ChevronDown, ArrowUpDown, X,
  Target, CalendarRange, ClipboardList, Users, BarChart3,
} from 'lucide-react';
import { api } from '@/lib/api';
import { AI_STAGES } from '@/lib/stages';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';
import { type CellType, toDraft, coerce, csvValue } from '@/lib/sheetUtils';

// ── Column / sheet types ──────────────────────────────────────────────────────
export interface Column {
  key: string;
  label: string;
  type: CellType;
  width?: number;
  options?: { value: string; label: string; color?: string }[];
  min?: number;
}
export interface SheetDef {
  key: string;
  label: string;
  icon: JSX.Element;
  columns: Column[];
  queryKey: any[];
  list: () => Promise<any[]>;
  create: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<any>;
  remove: (id: string) => Promise<any>;
  newRow: () => any;
  sort?: (rows: any[]) => any[];
  rowClass?: (row: any) => string;
  footer?: (rows: any[]) => Record<string, any>;
  readOnly?: boolean;
}

const STAGE_OPTS = AI_STAGES.map((s: any) => ({ value: s.key, label: `${s.num}. ${s.label}`, color: s.color }));
const SESSION_OPTS = ['Workshop', 'Pre-Workshop', 'Follow-Up', 'Demo', 'SOW Review', 'Commercial', 'Deep Dive']
  .map((t) => ({ value: t, label: t }));
const WS_STATUS_OPTS = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-green-100 text-green-700' },
  { value: 'proposed', label: 'Proposed', color: 'bg-blue-100 text-blue-700' },
  { value: 'executed', label: 'Executed', color: 'bg-gray-100 text-gray-600' },
];
const AI_STATUS_OPTS = [
  { value: 'open', label: 'Open', color: 'bg-amber-100 text-amber-800' },
  { value: 'in_progress', label: 'In progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'done', label: 'Done', color: 'bg-green-100 text-green-700' },
];

const today90 = () => new Date(Date.now() + 90 * 86400000).toISOString();
const oppNewRow = () => ({
  name: 'New opportunity', description: 'New opportunity', stage: 'reply_sent',
  value: 0, probability: 50, strategicImportance: 'medium',
  expectedCloseDate: today90(), lastInteractionAt: new Date().toISOString(),
  clientId: 'c-roku', ownerId: 'r-viral', dealRating: 0, interestedScenarios: [], parked: false,
});

function isDue(o: any): boolean {
  if (!o?.followUpDate || ['not_interested', 'not_legit', 'deal_closed'].includes(o.stage)) return false;
  const d = new Date(o.followUpDate); if (isNaN(d.getTime())) return false;
  const end = new Date(); end.setHours(23, 59, 59, 999);
  return d.getTime() <= end.getTime();
}

// ── Sheet definitions ─────────────────────────────────────────────────────────
export const SHEETS: SheetDef[] = [
  {
    key: 'opportunities', label: 'Opportunities', icon: <Target size={13} />,
    queryKey: ['opportunities'],
    list: api.opportunities.list, create: api.opportunities.create,
    update: api.opportunities.update, remove: api.opportunities.delete, newRow: oppNewRow,
    rowClass: (o) => (isDue(o) ? 'bg-amber-50' : ''),
    columns: [
      { key: 'name', label: 'Company', type: 'text', width: 170 },
      { key: 'contactName', label: 'Contact', type: 'text', width: 130 },
      { key: 'stage', label: 'Stage', type: 'select', options: STAGE_OPTS, width: 150 },
      { key: 'dealRating', label: 'Rating', type: 'stars', width: 96 },
      { key: 'followUpDate', label: 'Follow-up', type: 'date', width: 120 },
      { key: 'trinamixOwner', label: 'Owner', type: 'text', width: 120 },
      { key: 'value', label: 'Value', type: 'currency', width: 110 },
      { key: 'interestedScenarios', label: 'Scenarios', type: 'tags', width: 180 },
      { key: 'nextSteps', label: 'Next Steps', type: 'text', width: 200 },
    ],
  },
  {
    key: 'planning', label: 'Resource Planning', icon: <Users size={13} />,
    queryKey: ['opportunities'],
    list: api.opportunities.list, create: api.opportunities.create,
    update: api.opportunities.update, remove: api.opportunities.delete,
    newRow: oppNewRow,
    sort: (rows) => [...rows]
      .filter((o) => !['not_interested', 'not_legit'].includes(o.stage))
      .sort((a, b) => {
        const ap = a.parked ? 1 : 0, bp = b.parked ? 1 : 0; if (ap !== bp) return ap - bp;
        const ad = a.plannedStartDate || '', bd = b.plannedStartDate || '';
        if (ad && bd) return ad.localeCompare(bd); if (ad) return -1; if (bd) return 1;
        return (b.dealRating || 0) - (a.dealRating || 0);
      }),
    rowClass: (o) => (o.parked ? 'opacity-50' : ''),
    footer: (rows) => ({ plannedResources: rows.filter((o) => !o.parked).reduce((s, o) => s + (Number(o.plannedResources) || 0), 0) }),
    columns: [
      { key: 'name', label: 'Company', type: 'text', width: 170 },
      { key: 'stage', label: 'Stage', type: 'select', options: STAGE_OPTS, width: 150 },
      { key: 'dealRating', label: 'Rating', type: 'stars', width: 96 },
      { key: 'plannedStartDate', label: 'Start', type: 'date', width: 120 },
      { key: 'plannedEndDate', label: 'End', type: 'date', width: 120 },
      { key: 'plannedResources', label: 'Resources', type: 'number', width: 96, min: 0 },
      { key: 'teamAssignment', label: 'Team', type: 'text', width: 160 },
      { key: 'trinamixOwner', label: 'Owner', type: 'text', width: 120 },
      { key: 'parked', label: 'Parked', type: 'check', width: 70 },
    ],
  },
  {
    key: 'workshops', label: 'Workshops / Calendar', icon: <CalendarRange size={13} />,
    queryKey: ['meetings'],
    list: api.meetings.list, create: api.meetings.create,
    update: api.meetings.update, remove: api.meetings.delete,
    newRow: () => ({ title: 'New workshop', scheduledAt: new Date().toISOString(), durationMin: 60, attendeeIds: [], sessionType: 'Workshop', status: 'scheduled' }),
    sort: (rows) => [...rows].sort((a, b) => String(b.scheduledAt || '').localeCompare(String(a.scheduledAt || ''))),
    columns: [
      { key: 'title', label: 'Company', type: 'text', width: 180 },
      { key: 'scheduledAt', label: 'Date', type: 'date', width: 130 },
      { key: 'timeText', label: 'Time', type: 'text', width: 110 },
      { key: 'attendeesText', label: 'Attendees', type: 'text', width: 200 },
      { key: 'sessionType', label: 'Type', type: 'select', options: SESSION_OPTS, width: 130 },
      { key: 'status', label: 'Status', type: 'select', options: WS_STATUS_OPTS, width: 120 },
    ],
  },
  {
    key: 'actions', label: 'Action Items', icon: <ClipboardList size={13} />,
    queryKey: ['action-items'],
    list: api.actionItems.list, create: api.actionItems.create,
    update: api.actionItems.update, remove: api.actionItems.delete,
    newRow: () => ({ title: 'New action item', status: 'open', source: 'manual', reviewed: false, scenarios: [] }),
    columns: [
      { key: 'title', label: 'Company / Item', type: 'text', width: 180 },
      { key: 'owner', label: 'Owner', type: 'text', width: 130 },
      { key: 'status', label: 'Status', type: 'select', options: AI_STATUS_OPTS, width: 120 },
      { key: 'action', label: 'Next Action', type: 'text', width: 240 },
      { key: 'lastDemoed', label: 'Last Demo', type: 'text', width: 200 },
      { key: 'dueDate', label: 'Due', type: 'date', width: 120 },
      { key: 'scenarios', label: 'Scenarios', type: 'tags', width: 160 },
    ],
  },
  {
    key: 'summary', label: 'Summary', icon: <BarChart3 size={13} />, readOnly: true,
    queryKey: ['opportunities', 'owner-summary'],
    list: async () => {
      const opps = (await api.opportunities.list()) as any[];
      const m: Record<string, any> = {};
      opps.forEach((o) => {
        const owner = o.trinamixOwner || 'Unassigned';
        if (!m[owner]) m[owner] = { id: owner, owner, count: 0, hot: 0, ratingSum: 0, value: 0, negotiation: 0 };
        const r = m[owner];
        r.count++; r.ratingSum += Number(o.dealRating) || 0; r.value += Number(o.value) || 0;
        if ((Number(o.dealRating) || 0) >= 4) r.hot++;
        if (o.stage === 'negotiation_sow') r.negotiation++;
      });
      return Object.values(m).map((r: any) => ({ ...r, avgRating: r.count ? Math.round(r.ratingSum / r.count) : 0 }));
    },
    create: async () => ({}), update: async () => ({}), remove: async () => ({}), newRow: () => ({}),
    sort: (rows) => [...rows].sort((a, b) => b.count - a.count),
    columns: [
      { key: 'owner', label: 'Owner', type: 'text', width: 170 },
      { key: 'count', label: 'Opportunities', type: 'number', width: 110 },
      { key: 'hot', label: 'Hot (>=4 stars)', type: 'number', width: 100 },
      { key: 'avgRating', label: 'Avg Rating', type: 'stars', width: 110 },
      { key: 'value', label: 'Pipeline Value', type: 'currency', width: 130 },
      { key: 'negotiation', label: 'In Negotiation', type: 'number', width: 120 },
    ],
  },
];


function Stars({ value, onChange, readonly }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={13}
          className={cn('transition-colors', !readonly && 'cursor-pointer', n <= value ? 'fill-green-500 text-green-500' : 'text-line fill-transparent', !readonly && 'hover:text-green-400')}
          onClick={() => !readonly && onChange?.(n === value ? 0 : n)} />
      ))}
    </div>
  );
}

// ── Editable grid ─────────────────────────────────────────────────────────────
export function SheetGrid({ def, enabled }: { def: SheetDef; enabled: boolean }) {
  const qc = useQueryClient();
  const { data: raw = [], isLoading } = useQuery({ queryKey: def.queryKey, queryFn: def.list, enabled });
  const invalidate = () => qc.invalidateQueries({ queryKey: def.queryKey });
  const mCreate = useMutation({ mutationFn: (d: any) => def.create(d), onSuccess: invalidate });
  const mUpdate = useMutation({ mutationFn: ({ id, data }: { id: string; data: any }) => def.update(id, data), onSuccess: invalidate });
  const mRemove = useMutation({ mutationFn: (id: string) => def.remove(id), onSuccess: invalidate });

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [edit, setEdit] = useState<{ id: string; key: string } | null>(null);
  const [draft, setDraft] = useState('');
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = (raw as any[]).filter((r) => {
      if (q && !def.columns.some((c) => String(r[c.key] ?? '').toLowerCase().includes(q))) return false;
      return def.columns.every((c) => {
        const fv = (filters[c.key] ?? '').trim();
        if (!fv) return true;
        const v = r[c.key];
        if (c.type === 'select') return String(v ?? '') === fv;
        if (c.type === 'check') return fv === 'yes' ? !!v : !v;
        if (c.type === 'tags') return (Array.isArray(v) ? v.join(' ') : String(v ?? '')).toLowerCase().includes(fv.toLowerCase());
        return String(v ?? '').toLowerCase().includes(fv.toLowerCase());
      });
    });
    if (sortKey) {
      const col = def.columns.find((c) => c.key === sortKey);
      list = [...list].sort((a, b) => {
        let av = a[sortKey!], bv = b[sortKey!];
        if (col?.type === 'stars' || col?.type === 'number' || col?.type === 'currency') {
          av = Number(av) || 0; bv = Number(bv) || 0; return (av - bv) * sortDir;
        }
        return String(av ?? '').localeCompare(String(bv ?? '')) * sortDir;
      });
    } else if (def.sort) {
      list = def.sort(list);
    }
    return list;
  }, [raw, search, filters, sortKey, sortDir, def]);

  const footer = def.footer ? def.footer(rows) : null;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = useMemo(() => rows.slice(safePage * pageSize, safePage * pageSize + pageSize), [rows, safePage, pageSize]);
  useEffect(() => { setPage(0); }, [search, filters, sortKey, sortDir, pageSize]);

  function commit(id: string, col: Column) {
    const value = coerce(col.type, draft);
    setEdit(null);
    mUpdate.mutate({ id, data: { [col.key]: value } }, { onError: (e: any) => setErr(e?.message ?? 'Update failed') });
  }
  function toggleSort(key: string) {
    if (sortKey === key) { if (sortDir === 1) setSortDir(-1); else { setSortKey(null); } }
    else { setSortKey(key); setSortDir(1); }
  }
  function addRow() {
    mCreate.mutate(def.newRow(), { onError: (e: any) => setErr(e?.message ?? 'Add failed') });
  }
  function exportCsv() {
    const headers = def.columns.map((c) => c.label);
    const lines = rows.map((r) => def.columns.map((c) => csvValue(c.type, r[c.key], c.options)));
    const esc = (v: any) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const csv = [headers, ...lines].map((r) => r.map(esc).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${def.key}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  function renderCell(row: any, col: Column) {
    const v = row[col.key];
    const editing = !def.readOnly && edit?.id === row.id && edit?.key === col.key;

    if (col.type === 'stars') return <Stars value={Number(v) || 0} readonly={def.readOnly} onChange={(nv) => mUpdate.mutate({ id: row.id, data: { [col.key]: nv } })} />;
    if (col.type === 'check') return (
      <input type="checkbox" checked={!!v} disabled={def.readOnly} onChange={(e) => mUpdate.mutate({ id: row.id, data: { [col.key]: e.target.checked } })}
        className="w-4 h-4 rounded cursor-pointer" />
    );

    if (editing) {
      const common = {
        autoFocus: true,
        value: draft,
        onChange: (e: any) => setDraft(e.target.value),
        onBlur: () => commit(row.id, col),
        onKeyDown: (e: any) => { if (e.key === 'Enter') { e.preventDefault(); commit(row.id, col); } if (e.key === 'Escape') setEdit(null); },
        className: 'w-full text-xs px-1.5 py-1 rounded border border-brand-500 bg-white focus:outline-none',
      };
      if (col.type === 'select') return (
        <select {...common} onBlur={() => commit(row.id, col)}>
          <option value=""></option>
          {col.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      if (col.type === 'date') return <input type="date" {...common} />;
      if (col.type === 'number' || col.type === 'currency') return <input type="number" min={col.min} {...common} />;
      return <input type="text" {...common} />;
    }

    // display mode
    let display: any = v;
    if (col.type === 'select') {
      const opt = col.options?.find((o) => o.value === v);
      display = opt ? <span className={cn('text-2xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap', opt.color ?? 'bg-blue-50 text-blue-700')}>{opt.label}</span> : <span className="text-ink-muted">{v || '—'}</span>;
    } else if (col.type === 'currency') {
      display = v != null && v !== '' ? '$' + Number(v).toLocaleString() : <span className="text-ink-muted">—</span>;
    } else if (col.type === 'date') {
      display = v ? String(v).split('T')[0] : <span className="text-ink-muted">—</span>;
    } else if (col.type === 'tags') {
      const arr: string[] = Array.isArray(v) ? v : [];
      display = arr.length ? <div className="flex flex-wrap gap-1">{arr.map((t) => <span key={t} className="text-2xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{t}</span>)}</div> : <span className="text-ink-muted">—</span>;
    } else {
      display = v != null && String(v) !== '' ? String(v) : <span className="text-ink-muted">—</span>;
    }
    if (def.readOnly) return <div className="min-h-[20px] px-1 -mx-1">{display}</div>;
    return (
      <div className="min-h-[20px] cursor-text rounded px-1 -mx-1 hover:bg-brand-50/60"
        onClick={() => { setEdit({ id: row.id, key: col.key }); setDraft(toDraft(col.type, v)); }}>
        {display}
      </div>
    );
  }

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading {def.label}…</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <Input placeholder="Search rows…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 w-56 text-xs" />
        </div>
        <span className="text-2xs text-ink-muted">{rows.length} rows{def.readOnly ? '' : ' · click any cell to edit'}</span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={exportCsv} className="gap-1"><Download size={13} />Export CSV</Button>
          {!def.readOnly && <Button variant="primary" size="sm" onClick={addRow} className="gap-1"><Plus size={13} />Add row</Button>}
        </div>
      </div>
      {err && <div className="text-xs text-red-600">{err}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-paper-sunken/50 border-b border-line sticky top-0 z-10">
              <tr className="text-2xs uppercase tracking-wider text-ink-muted">
                <th className="text-left px-2 py-2 font-medium w-8">#</th>
                {def.columns.map((c) => (
                  <th key={c.key} style={{ minWidth: c.width }} className="text-left px-2 py-2 font-medium border-l border-line/60">
                    <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-ink">
                      {c.label}
                      {sortKey === c.key ? (sortDir === 1 ? <ChevronUp size={11} /> : <ChevronDown size={11} />) : <ArrowUpDown size={10} className="opacity-30" />}
                    </button>
                  </th>
                ))}
                {!def.readOnly && <th className="px-2 py-2 w-10"></th>}
              </tr>
              <tr className="bg-paper">
                <th className="px-2 py-1"></th>
                {def.columns.map((c) => (
                  <th key={c.key} className="px-1.5 py-1 border-l border-line/40 font-normal">
                    {c.type === 'select' ? (
                      <select value={filters[c.key] ?? ''} onChange={(e) => setFilters((fl) => ({ ...fl, [c.key]: e.target.value }))}
                        className="w-full text-2xs px-1 py-0.5 rounded border border-line bg-white text-ink-muted">
                        <option value="">All</option>
                        {c.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : c.type === 'check' ? (
                      <select value={filters[c.key] ?? ''} onChange={(e) => setFilters((fl) => ({ ...fl, [c.key]: e.target.value }))}
                        className="w-full text-2xs px-1 py-0.5 rounded border border-line bg-white text-ink-muted">
                        <option value="">All</option><option value="yes">Yes</option><option value="no">No</option>
                      </select>
                    ) : (
                      <input value={filters[c.key] ?? ''} onChange={(e) => setFilters((fl) => ({ ...fl, [c.key]: e.target.value }))}
                        placeholder="Filter…" className="w-full text-2xs px-1 py-0.5 rounded border border-line bg-white placeholder:text-ink-subtle" />
                    )}
                  </th>
                ))}
                {!def.readOnly && <th className="px-2 py-1"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.length === 0 && (
                <tr><td colSpan={def.columns.length + (def.readOnly ? 1 : 2)} className="text-center py-10 text-sm text-ink-muted">No rows.</td></tr>
              )}
              {pageRows.map((row, idx) => (
                <tr key={row.id} className={cn('hover:bg-paper-sunken/30 transition-colors', idx % 2 ? 'bg-paper-sunken/10' : '', def.rowClass?.(row))}>
                  <td className="px-2 py-1.5 text-2xs text-ink-muted align-top">{safePage * pageSize + idx + 1}</td>
                  {def.columns.map((c) => (
                    <td key={c.key} style={{ minWidth: c.width }} className="px-2 py-1.5 align-top border-l border-line/40 text-xs text-ink">
                      {renderCell(row, c)}
                    </td>
                  ))}
                  {!def.readOnly && (
                    <td className="px-2 py-1.5 align-top text-right">
                      {confirmDel === row.id ? (
                        <span className="inline-flex gap-1">
                          <button onClick={() => mRemove.mutate(row.id, { onSuccess: () => setConfirmDel(null) })} className="text-2xs px-1.5 py-0.5 rounded bg-red-500 text-white">Del</button>
                          <button onClick={() => setConfirmDel(null)} className="text-2xs px-1.5 py-0.5 rounded border border-line"><X size={11} /></button>
                        </span>
                      ) : (
                        <button onClick={() => setConfirmDel(row.id)} className="p-1 rounded hover:bg-line text-ink-muted hover:text-red-500"><Trash2 size={13} /></button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            {footer && (
              <tfoot>
                <tr className="border-t-2 border-line bg-paper-sunken/40 text-xs font-semibold">
                  <td className="px-2 py-2" />
                  {def.columns.map((c) => (
                    <td key={c.key} className="px-2 py-2 border-l border-line/40">
                      {c.key in footer ? (c.key === 'plannedResources' ? <span className="text-brand-700">{footer[c.key]} total</span> : footer[c.key]) : ''}
                    </td>
                  ))}
                  {!def.readOnly && <td />}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
      <div className="flex items-center gap-3 text-xs text-ink-muted flex-wrap">
        <span>Showing {rows.length === 0 ? 0 : safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, rows.length)} of {rows.length}</span>
        <label className="flex items-center gap-1">Rows:
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="text-xs px-1.5 py-1 rounded border border-line bg-white">
            {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            <option value={100000}>All</option>
          </select>
        </label>
        <div className="ml-auto flex items-center gap-1.5">
          <button disabled={safePage <= 0} onClick={() => setPage(safePage - 1)} className="px-2.5 py-1 rounded border border-line disabled:opacity-40 hover:bg-paper-sunken">Prev</button>
          <span className="px-1">Page {safePage + 1} of {totalPages}</span>
          <button disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)} className="px-2.5 py-1 rounded border border-line disabled:opacity-40 hover:bg-paper-sunken">Next</button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Spreadsheet() {
  const [active, setActive] = useState(SHEETS[0].key);
  return (
    <div>
      <PageHeader
        eyebrow="Workbench"
        title="Spreadsheet"
        subtitle="Excel-style editable sheets — click a cell to edit, add or delete rows. Changes save to the live database."
        actions={
          <div className="flex items-center gap-1 flex-wrap">
            {SHEETS.map((s) => (
              <Button key={s.key} variant={active === s.key ? 'primary' : 'ghost'} size="sm" onClick={() => setActive(s.key)} className="gap-1">
                {s.icon}{s.label}
              </Button>
            ))}
          </div>
        }
      />
      <div className="p-6">
        {SHEETS.map((s) => (
          <div key={s.key} className={active === s.key ? '' : 'hidden'}>
            <SheetGrid def={s} enabled={active === s.key} />
          </div>
        ))}
      </div>
    </div>
  );
}
