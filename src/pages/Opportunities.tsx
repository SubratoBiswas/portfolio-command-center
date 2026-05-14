import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LayoutGrid, Rows, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useOpportunities, useLookups, useClients, useResources, useCreateOpportunity } from '@/lib/hooks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Field, FormRow } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { fmtCurrency, fmtDate, sumBy, daysFromNow, cn } from '@/lib/utils';

const STAGES: { key: string; label: string; tone: string }[] = [
  { key: 'qualify',   label: 'Qualify',   tone: 'bg-line-subtle text-ink-muted' },
  { key: 'discover',  label: 'Discover',  tone: 'bg-info-bg text-info' },
  { key: 'propose',   label: 'Propose',   tone: 'bg-brand-100 text-brand-800' },
  { key: 'negotiate', label: 'Negotiate', tone: 'bg-amber-100 text-amber-800' },
];

const EMPTY = { name: '', clientId: '', stage: 'qualify', value: '', probability: '50', expectedCloseDate: '', ownerId: '' };

export default function Opportunities() {
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const { data: opportunities = [], isLoading } = useOpportunities();
  const { clientById, resourceById } = useLookups();
  const { data: clients = [] } = useClients();
  const { data: resources = [] } = useResources();
  const createOpportunity = useCreateOpportunity();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      await createOpportunity.mutateAsync({
        name: form.name.trim(),
        clientId: form.clientId || null,
        stage: form.stage,
        value: form.value ? Number(form.value) : 0,
        probability: Number(form.probability),
        expectedCloseDate: form.expectedCloseDate || null,
        ownerId: form.ownerId || null,
      });
      setOpen(false);
      setForm({ ...EMPTY });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create opportunity.');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading pipeline...</div>;

  const opps = opportunities as any[];
  const visible = stageFilter === 'all' ? opps : opps.filter(o => o.stage === stageFilter);
  const totalValue = sumBy(visible, o => Number(o.value));
  const weighted = sumBy(visible, o => Number(o.value) * (o.probability / 100));
  const staleCount = visible.filter(o => daysFromNow(o.lastInteractionAt) <= -10).length;

  return (
    <div>
      <PageHeader
        eyebrow="Pipeline"
        title="Opportunities"
        subtitle={visible.length + ' opportunities · ' + fmtCurrency(totalValue, { compact: true }) + ' total · ' + fmtCurrency(weighted, { compact: true }) + ' weighted'}
        actions={
          <div className="flex items-center gap-2">
            <Button variant={view === 'kanban' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('kanban')}><LayoutGrid size={13} /></Button>
            <Button variant={view === 'table' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('table')}><Rows size={13} /></Button>
            <Button variant="primary" onClick={() => setOpen(true)}><Plus size={13} /> New opportunity</Button>
          </div>
        }
      />
      <div className="px-6 pb-2 flex items-center gap-4 border-b border-line">
        <div className="flex items-center gap-3 text-xs text-ink-muted py-3">
          <span className="flex items-center gap-1 text-ok"><TrendingUp size={12} />{fmtCurrency(weighted, { compact: true })} weighted</span>
          {staleCount > 0 && <span className="flex items-center gap-1 text-amber-700"><Clock size={12} />{staleCount} stale</span>}
        </div>
        <Select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="ml-auto text-xs w-32">
          <option value="all">All stages</option>
          {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </Select>
      </div>

      {view === 'kanban' ? (
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAGES.map(stage => {
            const cols = visible.filter(o => o.stage === stage.key);
            return (
              <div key={stage.key} className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={stage.tone}>{stage.label}</Badge>
                  <span className="text-2xs text-ink-muted">{cols.length} · {fmtCurrency(sumBy(cols, o => Number(o.value)), { compact: true })}</span>
                </div>
                {cols.map(o => {
                  const client = clientById(o.clientId);
                  const stale = daysFromNow(o.lastInteractionAt) <= -10;
                  return (
                    <Card key={o.id} className="hover:shadow-md transition-shadow">
                      <div className="p-3 space-y-2">
                        <Link to={'/opportunities/' + o.id} className="text-xs font-medium text-ink hover:text-brand-700 block leading-snug">{o.name}</Link>
                        <p className="text-2xs text-ink-muted">{(client as any)?.name}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-ink">{fmtCurrency(Number(o.value), { compact: true })}</span>
                          <span className="text-2xs text-ink-muted">{o.probability}%</span>
                        </div>
                        {stale && <span className="flex items-center gap-1 text-2xs text-amber-700"><AlertCircle size={10} />Stale</span>}
                      </div>
                    </Card>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-paper-sunken/40">
                  <tr className="text-2xs uppercase tracking-wider text-ink-muted">
                    <th className="text-left px-4 py-2 font-medium">Opportunity</th>
                    <th className="text-left px-4 py-2 font-medium">Client</th>
                    <th className="text-left px-4 py-2 font-medium">Stage</th>
                    <th className="text-right px-4 py-2 font-medium">Value</th>
                    <th className="text-right px-4 py-2 font-medium">Prob</th>
                    <th className="text-left px-4 py-2 font-medium">Close</th>
                    <th className="text-left px-4 py-2 font-medium">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visible.map(o => {
                    const client = clientById(o.clientId);
                    const owner = resourceById(o.ownerId);
                    const stale = daysFromNow(o.lastInteractionAt) <= -10;
                    const stageMeta = STAGES.find(s => s.key === o.stage);
                    return (
                      <tr key={o.id} className="hover:bg-paper-sunken/30">
                        <td className="px-4 py-3">
                          <Link to={'/opportunities/' + o.id} className="font-medium text-ink hover:text-brand-700">{o.name}</Link>
                          {stale && <span className="ml-2 text-2xs text-amber-700">stale</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-muted">{(client as any)?.name}</td>
                        <td className="px-4 py-3"><Badge className={stageMeta?.tone ?? ''}>{o.stage}</Badge></td>
                        <td className="px-4 py-3 text-right text-xs font-medium">{fmtCurrency(Number(o.value), { compact: true })}</td>
                        <td className="px-4 py-3 text-right text-xs text-ink-muted">{o.probability}%</td>
                        <td className="px-4 py-3 text-xs text-ink-muted">{fmtDate(o.expectedCloseDate)}</td>
                        <td className="px-4 py-3">{owner && <Avatar initials={(owner as any).initials} size="xs" title={(owner as any).name} />}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit}>
          <DialogHeader title="New opportunity" onClose={() => setOpen(false)} />
          <DialogBody className="space-y-3">
            <Field label="Opportunity name" required>
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. HSBC Data Platform Phase 2" required />
            </Field>
            <FormRow>
              <Field label="Client">
                <Select value={form.clientId} onChange={e => set('clientId', e.target.value)} className="w-full">
                  <option value="">-- none --</option>
                  {(clients as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Stage">
                <Select value={form.stage} onChange={e => set('stage', e.target.value)} className="w-full">
                  {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </Select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Value (USD)">
                <Input type="number" value={form.value} onChange={e => set('value', e.target.value)} placeholder="e.g. 250000" min="0" />
              </Field>
              <Field label="Win probability (%)" hint="0 to 100">
                <Input type="number" value={form.probability} onChange={e => set('probability', e.target.value)} min="0" max="100" />
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Expected close date">
                <Input type="date" value={form.expectedCloseDate} onChange={e => set('expectedCloseDate', e.target.value)} />
              </Field>
              <Field label="Owner">
                <Select value={form.ownerId} onChange={e => set('ownerId', e.target.value)} className="w-full">
                  <option value="">-- none --</option>
                  {(resources as any[]).map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </Field>
            </FormRow>
            {error && <p className="text-xs text-crit bg-crit-bg border border-crit/20 rounded px-3 py-2">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Creating...' : 'Create opportunity'}</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
