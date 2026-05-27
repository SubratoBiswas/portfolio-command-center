import { useState } from 'react';
import { Plus, FolderKanban, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProjects, useResources, useClients, useProducts, useCreateProject, useUpdateProject, useDeleteProject, useLookups } from '@/lib/hooks';
import { CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Field, FormRow } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { RagBadge, StatusBadge } from '@/components/shared/Badges';
import { useToast } from '@/components/ui/toast';
import { fmtDate, fmtCurrency, cn } from '@/lib/utils';

const STATUSES = ['not_started','planning','in_progress','on_hold','completed','cancelled'];
const TYPES = ['delivery','internal','rd','poc'];
const RAGS = ['green','yellow','orange','red'];

const EMPTY = {
  name: '', code: '', type: 'delivery', status: 'not_started', rag: 'green',
  clientId: '', ownerId: '', productId: '', startDate: '', endDate: '',
  budget: '', charter: '', scope: '',
};

export default function Projects() {
  const { data: projects = [], isLoading } = useProjects();
  const { data: resources = [] } = useResources();
  const { data: clients = [] } = useClients();
  const { data: products = [] } = useProducts();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { clientById, resourceById } = useLookups();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }
  function openCreate() { setEditTarget(null); setForm({ ...EMPTY }); setError(''); setOpen(true); }
  function openEdit(p: any) {
    setEditTarget(p);
    setForm({
      name: p.name ?? '', code: p.code ?? '', type: p.type ?? 'delivery',
      status: p.status ?? 'not_started', rag: p.rag ?? 'green',
      clientId: p.clientId ?? '', ownerId: p.ownerId ?? '', productId: p.productId ?? '',
      startDate: p.startDate ? p.startDate.slice(0, 10) : '',
      endDate: p.endDate ? p.endDate.slice(0, 10) : '',
      budget: p.budget ? String(p.budget) : '',
      charter: p.charter ?? '', scope: p.scope ?? '',
    });
    setError(''); setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Project name is required.'); return; }
    if (!form.clientId) { setError('Client is required.'); return; }
    if (!form.ownerId) { setError('Owner is required.'); return; }
    if (!form.startDate || !form.endDate) { setError('Start and end dates are required.'); return; }
    setSaving(true); setError('');
    const payload: any = {
      name: form.name.trim(), code: form.code.trim() || form.name.trim().slice(0, 8).toUpperCase(),
      type: form.type, status: form.status, rag: form.rag,
      clientId: form.clientId, ownerId: form.ownerId,
      productId: form.productId || null,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      budget: form.budget ? Number(form.budget) : null,
      charter: form.charter.trim() || '', scope: form.scope.trim() || '',
    };
    try {
      if (editTarget) {
        await updateProject.mutateAsync({ id: editTarget.id, ...payload });
        toast('Project updated successfully');
      } else {
        await createProject.mutateAsync(payload);
        toast('Project created successfully');
      }
      setOpen(false); setForm({ ...EMPTY });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save project.');
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try { await deleteProject.mutateAsync(id); toast('Project deleted', 'info'); }
    finally { setConfirmDelete(null); }
  }

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading projects…</div>;

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        subtitle={projects.length + ' active projects'}
        actions={<Button variant="primary" onClick={openCreate}><Plus size={13} /> New project</Button>}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-line bg-paper-sunken">
              {['Code','Project','Client','Owner','Status','RAG','Dates','Budget',''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(projects as any[]).map(p => {
              const client = clientById(p.clientId);
              const owner = resourceById(p.ownerId);
              const isConfirming = confirmDelete === p.id;
              const pctSpent = p.budget && p.spent ? (p.spent / p.budget) * 100 : 0;
              return (
                <tr key={p.id} className="border-b border-line hover:bg-paper-sunken/40 transition-colors">
                  <td className="px-4 py-2.5"><span className="text-xs font-mono font-medium text-ink-soft">{p.code}</span></td>
                  <td className="px-4 py-2.5 max-w-[200px]">
                    <Link to={'/projects/' + p.id} className="text-xs font-medium text-ink hover:text-brand-700 truncate block">{p.name}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-ink-muted">{(client as any)?.name ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    {owner && <div className="flex items-center gap-1.5"><Avatar initials={(owner as any).initials} size="xs" /><span className="text-xs text-ink-soft">{(owner as any).name}</span></div>}
                  </td>
                  <td className="px-4 py-2.5"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-2.5"><RagBadge rag={p.rag} /></td>
                  <td className="px-4 py-2.5 text-xs text-ink-muted whitespace-nowrap">{fmtDate(p.startDate)} – {fmtDate(p.endDate)}</td>
                  <td className="px-4 py-2.5">
                    {p.budget ? (
                      <div className="w-24 space-y-0.5">
                        <div className="flex justify-between text-2xs text-ink-muted"><span>{fmtCurrency(p.spent ?? 0)}</span><span>{fmtCurrency(p.budget)}</span></div>
                        <Progress value={pctSpent} className={cn('h-1', pctSpent > 90 ? '[&>div]:bg-crit' : '')} />
                      </div>
                    ) : <span className="text-xs text-ink-muted">—</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="text-ink-muted hover:text-brand-700 p-1 rounded hover:bg-brand-50 transition-colors"><Pencil size={12} /></button>
                      {isConfirming ? (
                        <>
                          <button onClick={() => handleDelete(p.id)} className="text-2xs text-white bg-crit hover:bg-crit/80 px-2 py-0.5 rounded">Delete</button>
                          <button onClick={() => setConfirmDelete(null)} className="text-2xs text-ink-muted px-1.5 py-0.5 rounded border border-line">✕</button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmDelete(p.id)} className="text-ink-muted hover:text-crit p-1 rounded hover:bg-crit-bg transition-colors"><Trash2 size={12} /></button>
                      )}
                      <Link to={'/projects/' + p.id} className="text-brand-700 hover:text-brand-900 p-1"><ArrowUpRight size={13} /></Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader title={editTarget ? 'Edit project' : 'New project'} onClose={() => setOpen(false)} />
          <DialogBody className="space-y-3">
            <FormRow>
              <Field label="Project name" required>
                <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Customer Portal Rebuild" required />
              </Field>
              <Field label="Code" hint="Short identifier">
                <Input value={form.code} onChange={e => set('code', e.target.value)} placeholder="e.g. CPR-001" maxLength={12} />
              </Field>
            </FormRow>
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
              <Field label="Type">
                <Select value={form.type} onChange={e => set('type', e.target.value)} className="w-full">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Product">
                <Select value={form.productId} onChange={e => set('productId', e.target.value)} className="w-full">
                  <option value="">-- none --</option>
                  {(products as any[]).map(p => <option key={p.id} value={p.id}>{(p as any).shortName}</option>)}
                </Select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Status">
                <Select value={form.status} onChange={e => set('status', e.target.value)} className="w-full">
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </Select>
              </Field>
              <Field label="RAG">
                <Select value={form.rag} onChange={e => set('rag', e.target.value)} className="w-full">
                  {RAGS.map(r => <option key={r} value={r}>{r}</option>)}
                </Select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Start date" required>
                <Input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} required />
              </Field>
              <Field label="End date" required>
                <Input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} required />
              </Field>
            </FormRow>
            <Field label="Budget (£)" hint="Optional">
              <Input type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="e.g. 250000" />
            </Field>
            <Field label="Charter">
              <Textarea value={form.charter} onChange={e => set('charter', e.target.value)} rows={2} placeholder="Project charter / objectives…" />
            </Field>
            <Field label="Scope">
              <Textarea value={form.scope} onChange={e => set('scope', e.target.value)} rows={2} placeholder="In-scope and out-of-scope…" />
            </Field>
            {error && <p className="text-xs text-crit bg-crit-bg border border-crit/20 rounded px-3 py-2">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : editTarget ? 'Save changes' : 'Create project'}</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
