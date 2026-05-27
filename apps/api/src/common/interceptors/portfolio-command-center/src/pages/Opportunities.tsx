import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LayoutGrid, Rows, TrendingUp, Pencil, Trash2 } from 'lucide-react';
import { useOpportunities, useLookups, useClients, useResources, useCreateOpportunity, useUpdateOpportunity, useDeleteOpportunity } from '@/lib/hooks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Field, FormRow } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/components/ui/toast';
import { fmtCurrency, fmtDate, sumBy, daysFromNow, cn } from '@/lib/utils';

const STAGES: { key: string; label: string; tone: string }[] = [
  { key: 'qualify',   label: 'Qualify',   tone: 'bg-line-subtle text-ink-muted' },
  { key: 'discover',  label: 'Discover',  tone: 'bg-info-bg text-info' },
  { key: 'propose',   label: 'Propose',   tone: 'bg-brand-100 text-brand-800' },
  { key: 'negotiate', label: 'Negotiate', tone: 'bg-amber-100 text-amber-800' },
];
const ALL_STAGES = [...STAGES.map(s => s.key), 'closed_won', 'closed_lost'];
const IMPORTANCE = ['low','medium','high','critical'];

const EMPTY = {
  name: '', clientId: '', stage: 'qualify', value: '', probability: '50',
  expectedCloseDate: '', ownerId: '', description: '', strategicImportance: 'medium',
};

export default function Opportunities() {
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const { data: opportunities = [], isLoading } = useOpportunities();
  const { clientById, resourceById } = useLookups();
  const { data: clients = [] } = useClients();
  const { data: resources = [] } = useResources();
  const createOpportunity = useCreateOpportunity();
  const updateOpportunity = useUpdateOpportunity();
  const deleteOpportunity = useDeleteOpportunity();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }
  function openCreate() { setEditTarget(null); setForm({ ...EMPTY }); setError(''); setOpen(true); }
  function openEdit(o: any) {
    setEditTarget(o);
    setForm({
      name: o.name ?? '', clientId: o.clientId ?? '', stage: o.stage ?? 'qualify',
      value: o.value ? String(o.value) : '', probability: String(o.probability ?? 50),
      expectedCloseDate: o.expectedCloseDate ? o.expectedCloseDate.slice(0, 10) : '',
      ownerId: o.ownerId ?? '', description: o.description ?? '',
      strategicImportance: o.strategicImportance ?? 'medium',
    });
    setError(''); setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.clientId) { setError('Client is required.'); return; }
    if (!form.ownerId) { setError('Owner is required.'); return; }
    if (!form.expectedCloseDate) { setError('Expected close date is required.'); return; }
    setSaving(true); setError('');
    const payload = {
      name: form.name.trim(), clientId: form.clientId, stage: form.stage,
      value: form.value ? Number(form.value) : 0,
      probability: Number(form.probability),
      expectedCloseDate: new Date(form.expectedCloseDate).toISOString(),
      ownerId: form.ownerId,
      description: form.description.trim() || '',
      strategicImportance: form.strategicImportance,
      lastInteractionAt: new Date().toISOString(),
    };
    try {
      if (editTarget) {
        await updateOpportunity.mutateAsync({ id: editTarget.id, ...payload });
        toast('Opportunity updated successfully');
      } else {
        await createOpportunity.mutateAsync(payload);
        toast('Opportunity created successfully');
      }
      setOpen(false); setForm({ ...EMPTY });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save opportunity.');
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try { await deleteOpportunity.mutateAsync(id); toast('Opportunity deleted', 'info'); }
    finally { setConfirmDelete(null); }
  }

  const filtered = stageFilter === 'all'
    ? (opportunities as any[]).filter((o: any) => !['closed_won','closed_lost'].includes(o.stage))
    : (opportunities as any[]).filter((o: any) => o.stage === stageFilter);

  const totalPipeline = sumBy(filtered, (o: any) => (o.value ?? 0) * (o.probability / 100));

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading opportunities…</div>;

  function OppActions({ o }: { o: any }) {
    const isConfirming = confirmDelete === o.id;
    return (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(o)} className="text-ink-muted hover:text-brand-700 p-1 rounded hover:bg-brand-50 transition-colors"><Pencil size={11} /></button>
        {isConfirming ? (
          <>
            <button onClick={() => handleDelete(o.id)} className="text-2xs text-white bg-crit hover:bg-crit/80 px-1.5 py-0.5 rounded">Del</button>
            <button onClick={() => setConfirmDelete(null)} className="text-2xs text-ink-muted px-1 py-0.5 rounded border border-line">✕</button>
          </>
        ) : (
          <button onClick={() => setConfirmDelete(o.id)} className="text-ink-muted hover:text-crit p-1 rounded hover:bg-crit-bg transition-colors"><Trash2 size={11} /></button>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Pipeline"
        title="Opportunities"
        subtitle={'Weighted pipeline: ' + fmtCurrency(totalPipeline)}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setView('kanban')} className={cn('p-1.5 rounded', view === 'kanban' ? 'bg-brand-100 text-brand-700' : 'text-ink-muted hover:text-ink')}><LayoutGrid size={14} /></button>
            <button onClick={() => setView('table')} className={cn('p-1.5 rounded', view === 'table' ? 'bg-brand-100 text-brand-700' : 'text-ink-muted hover:text-ink')}><Rows size={14} /></button>
            <Button variant="primary" onClick={openCreate}><Plus size={13} /> New opportunity</Button>
          </div>
        }
      />

      {view === 'kanban' ? (
        <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAGES.map(stage => {
            const cards = (opportunities as any[]).filter((o: any) => o.stage === stage.key);
            return (
              <div key={stage.key} className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={cn('text-2xs', stage.tone)}>{stage.label}</Badge>
                  <span className="text-2xs text-ink-muted">{fmtCurrency(sumBy(cards, (o: any) => o.value ?? 0))}</span>
                </div>
                {cards.map((o: any) => {
                  const client = clientById(o.clientId);
                  const owner = resourceById(o.ownerId);
                  return (
                    <div key={o.id} className="bg-paper-raised border border-line rounded p-3 space-y-2 hover:shadow-card transition-shadow">
                      <div className="flex items-start justify-between gap-1">
                        <Link to={'/opportunities/' + o.id} className="text-xs font-medium text-ink hover:text-brand-700 leading-snug flex-1">{o.name}</Link>
                        <OppActions o={o} />
                      </div>
                      <p className="text-2xs text-ink-muted">{(client as any)?.name}</p>
                      <div className="flex items-center justify-between text-2xs text-ink-muted">
                        <span className="font-medium text-ink">{fmtCurrency(o.value ?? 0)}</span>
                        <span>{o.probability}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        {owner && <Avatar initials={(owner as any).initials} size="xs" title={(owner as any).name} />}
                        <span className="text-2xs text-ink-muted">{fmtDate(o.expectedCloseDate)}</span>
                      </div>
                    </div>
                  );
                })}
                {cards.length === 0 && <div className="border-2 border-dashed border-line rounded p-3 text-center text-2xs text-ink-subtle">Empty</div>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-line bg-paper-sunken">
                {['Opportunity','Client','Stage','Value','Prob.','Close Date','Owner',''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o: any) => {
                const client = clientById(o.clientId);
                const owner = resourceById(o.ownerId);
                const stageInfo = STAGES.find(s => s.key === o.stage);
                return (
                  <tr key={o.id} className="border-b border-line hover:bg-paper-sunken/40 transition-colors">
                    <td className="px-4 py-2.5"><Link to={'/opportunities/' + o.id} className="text-xs font-medium text-ink hover:text-brand-700">{o.name}</Link></td>
                    <td className="px-4 py-2.5 text-xs text-ink-muted">{(client as any)?.name ?? '—'}</td>
                    <td className="px-4 py-2.5"><Badge className={cn('text-2xs', stageInfo?.tone ?? 'bg-line-subtle text-ink-muted')}>{o.stage}</Badge></td>
                    <td className="px-4 py-2.5 text-xs font-medium">{fmtCurrency(o.value ?? 0)}</td>
                    <td className="px-4 py-2.5 text-xs text-ink-muted">{o.probability}%</td>
                    <td className="px-4 py-2.5 text-xs text-ink-muted">{fmtDate(o.expectedCloseDate)}</td>
                    <td className="px-4 py-2.5">{owner && <div className="flex items-center gap-1.5"><Avatar initials={(owner as any).initials} size="xs" /><span className="text-xs">{(owner as any).name}</span></div>}</td>
                    <td className="px-4 py-2.5"><OppActions o={o} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit}>
          <DialogHeader title={editTarget ? 'Edit opportunity' : 'New opportunity'} onClose={() => setOpen(false)} />
          <DialogBody className="space-y-3">
            <Field label="Opportunity name" required>
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Digital Transformation Programme" required />
            </Field>
            <FormRow>
              <Field label="Client" required>
                <Select value={form.clientId} onChange={e => set('clientId', e.target.value)} className="w-full">
                  <option value="">-- select --</option>
                  {(clients as any[]).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Owner" required>
                <Select value={form.ownerId} onChange={e => set('ownerId', e.target.value)} className="w-full">
                  <option value="">-- select --</option>
                  {(resources as any[]).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Stage">
                <Select value={form.stage} onChange={e => set('stage', e.target.value)} className="w-full">
                  {ALL_STAGES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </Select>
              </Field>
              <Field label="Strategic importance">
                <Select value={form.strategicImportance} onChange={e => set('strategicImportance', e.target.value)} className="w-full">
                  {IMPORTANCE.map(i => <option key={i} value={i}>{i}</option>)}
                </Select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Value (£)">
                <Input type="number" value={form.value} onChange={e => set('value', e.target.value)} placeholder="e.g. 500000" />
              </Field>
              <Field label="Probability (%)">
                <Input type="number" min="0" max="100" value={form.probability} onChange={e => set('probability', e.target.value)} />
              </Field>
            </FormRow>
            <Field label="Expected close date" required>
              <Input type="date" value={form.expectedCloseDate} onChange={e => set('expectedCloseDate', e.target.value)} required />
            </Field>
            <Field label="Description">
              <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Opportunity overview…" />
            </Field>
            {error && <p className="text-xs text-crit bg-crit-bg border border-crit/20 rounded px-3 py-2">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : editTarget ? 'Save changes' : 'Create opportunity'}</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
