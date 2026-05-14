import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useProjects, useLookups, useClients, useResources, useCreateProject } from '@/lib/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input, Select } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Field, FormRow } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, RagBadge } from '@/components/shared/Badges';
import { fmtDate, fmtCurrency, daysFromNow, cn } from '@/lib/utils';

const EMPTY = { name: '', code: '', clientId: '', ownerId: '', status: 'not_started', rag: 'green', startDate: '', endDate: '', budget: '' };

export default function Projects() {
  const { data: projects = [], isLoading } = useProjects();
  const { clientById, resourceById } = useLookups();
  const { data: clients = [] } = useClients();
  const { data: resources = [] } = useResources();
  const createProject = useCreateProject();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) { setError('Name and code are required.'); return; }
    setSaving(true); setError('');
    try {
      await createProject.mutateAsync({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        clientId: form.clientId || null,
        ownerId: form.ownerId || null,
        status: form.status,
        rag: form.rag,
        startDate: form.startDate || new Date().toISOString(),
        endDate: form.endDate || null,
        budget: form.budget ? Number(form.budget) : null,
      });
      setOpen(false);
      setForm({ ...EMPTY });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create project.');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading projects...</div>;

  const ps = projects as any[];
  return (
    <div>
      <PageHeader
        eyebrow="Delivery"
        title="Projects"
        subtitle={ps.length + ' projects'}
        actions={<Button variant="primary" onClick={() => setOpen(true)}><Plus size={13} /> New project</Button>}
      />
      <div className="p-6">
        <Card>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="bg-paper-sunken/40">
                <tr className="text-2xs uppercase tracking-wider text-ink-muted">
                  <th className="text-left px-4 py-2 font-medium">Project</th>
                  <th className="text-left px-4 py-2 font-medium">Client</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">RAG</th>
                  <th className="text-left px-4 py-2 font-medium">Timeline</th>
                  <th className="text-left px-4 py-2 font-medium">Budget</th>
                  <th className="text-left px-4 py-2 font-medium">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ps.map((p: any) => {
                  const client = clientById(p.clientId);
                  const owner = resourceById(p.ownerId);
                  const pctSpent = p.budget && p.spent ? (p.spent / p.budget) * 100 : 0;
                  const daysLeft = daysFromNow(p.endDate);
                  return (
                    <tr key={p.id} className="hover:bg-paper-sunken/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={'/projects/' + p.id} className="font-medium text-ink hover:text-brand-700">{p.code}</Link>
                        <p className="text-xs text-ink-muted truncate max-w-[200px]">{p.name}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-muted">{(client as any)?.name ?? '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3"><RagBadge rag={p.rag} /></td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-ink">{fmtDate(p.startDate)} to {fmtDate(p.endDate)}</p>
                        <p className={cn('text-2xs', daysLeft < 0 ? 'text-crit' : daysLeft < 14 ? 'text-amber-700' : 'text-ink-muted')}>
                          {daysLeft < 0 ? Math.abs(daysLeft) + 'd overdue' : daysLeft + 'd left'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {p.budget ? (
                          <div className="space-y-1 min-w-[100px]">
                            <div className="flex justify-between text-2xs text-ink-muted">
                              <span>{fmtCurrency(p.spent ?? 0, { compact: true })}</span>
                              <span>{fmtCurrency(p.budget, { compact: true })}</span>
                            </div>
                            <Progress value={pctSpent} className={cn('h-1', pctSpent > 90 ? '[&>div]:bg-crit' : pctSpent > 75 ? '[&>div]:bg-amber-500' : '')} />
                          </div>
                        ) : <span className="text-xs text-ink-muted">—</span>}
                      </td>
                      <td className="px-4 py-3">{owner && <Avatar initials={(owner as any).initials} size="xs" title={(owner as any).name} />}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit}>
          <DialogHeader title="New project" onClose={() => setOpen(false)} />
          <DialogBody className="space-y-3">
            <FormRow>
              <Field label="Project name" required>
                <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. MDM Modernisation" required />
              </Field>
              <Field label="Code" required hint="Short identifier e.g. MDM-01">
                <Input value={form.code} onChange={e => set('code', e.target.value)} placeholder="PROJ-001" required />
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Client">
                <Select value={form.clientId} onChange={e => set('clientId', e.target.value)} className="w-full">
                  <option value="">-- none --</option>
                  {(clients as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Owner">
                <Select value={form.ownerId} onChange={e => set('ownerId', e.target.value)} className="w-full">
                  <option value="">-- none --</option>
                  {(resources as any[]).map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Status">
                <Select value={form.status} onChange={e => set('status', e.target.value)} className="w-full">
                  <option value="not_started">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="on_track">On track</option>
                  <option value="at_risk">At risk</option>
                  <option value="blocked">Blocked</option>
                </Select>
              </Field>
              <Field label="RAG">
                <Select value={form.rag} onChange={e => set('rag', e.target.value)} className="w-full">
                  <option value="green">Green</option>
                  <option value="yellow">Yellow</option>
                  <option value="orange">Orange</option>
                  <option value="red">Red</option>
                </Select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Start date">
                <Input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
              </Field>
              <Field label="End date">
                <Input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
              </Field>
            </FormRow>
            <Field label="Budget (USD)">
              <Input type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="e.g. 500000" min="0" />
            </Field>
            {error && <p className="text-xs text-crit bg-crit-bg border border-crit/20 rounded px-3 py-2">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Creating...' : 'Create project'}</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
