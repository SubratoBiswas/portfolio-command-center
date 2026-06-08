import * as React from 'react';
import { Plus, Gavel, Pencil, Trash2 } from 'lucide-react';
import { useDecisions, useLookups } from '@/lib/hooks';
import { api } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { fmtDate, fmtRelative } from '@/lib/utils';

const statusTone: Record<string, string> = {
  decided: 'bg-ok-bg text-ok',
  pending: 'bg-amber-100 text-amber-800',
  overturned: 'bg-crit-bg text-crit',
};

const EMPTY: any = {
  title: '', context: '', decision: '', rationale: '', status: 'pending',
  alternatives: [], decidedBy: '', productId: null, projectId: null, opportunityId: null,
};

export default function Decisions() {
  const { data: decisions = [], isLoading } = useDecisions();
  const { resourceById, productById, projectById, resources } = useLookups();
  const qc = useQueryClient();

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<any>({ ...EMPTY });
  const [editTarget, setEditTarget] = React.useState<any | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);
  const [error, setError] = React.useState('');

  function setF(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })); }

  function openCreate() { setEditTarget(null); setForm({ ...EMPTY }); setError(''); setOpen(true); }
  function openEdit(d: any) {
    setEditTarget(d);
    setForm({
      title: d.title, context: d.context, decision: d.decision,
      rationale: d.rationale ?? '', status: d.status,
      alternatives: d.alternatives ?? [], decidedBy: d.decidedBy,
      productId: d.productId ?? null, projectId: d.projectId ?? null,
    });
    setError('');
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.decision.trim() || !form.decidedBy) {
      setError('Title, decision, and decider are required.');
      return;
    }
    setSaving(true); setError('');
    try {
      const payload = { ...form, decidedAt: new Date().toISOString() };
      if (editTarget) {
        await (api as any).decisions.update(editTarget.id, payload);
      } else {
        await (api as any).decisions.create(payload);
      }
      qc.invalidateQueries({ queryKey: ['decisions'] });
      setOpen(false);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await (api as any).decisions.delete(id);
      qc.invalidateQueries({ queryKey: ['decisions'] });
    } finally { setConfirmDelete(null); }
  }

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading decisions…</div>;
  const sorted = [...(decisions as any[])].sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime());

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Decision Log"
        subtitle={`${decisions.length} decisions captured. ${(decisions as any[]).filter((d: any) => d.status === 'pending').length} pending review.`}
        actions={<Button variant="primary" onClick={openCreate}><Plus size={13} /> New decision</Button>}
      />
      <div className="p-6">
        <Card>
          <ul className="divide-y divide-line">
            {sorted.map((d: any) => {
              const by = resourceById(d.decidedBy);
              const product = d.productId ? productById(d.productId) : null;
              const project = d.projectId ? projectById(d.projectId) : null;
              const isConfirming = confirmDelete === d.id;
              return (
                <li key={d.id} className="px-5 py-4 hover:bg-paper-sunken/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                      <Gavel size={12} className="text-brand-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-ink">{d.title}</span>
                        <Badge className={statusTone[d.status] ?? 'bg-line-subtle text-ink-muted'}>{d.status}</Badge>
                        {product && <Badge className="bg-brand-100 text-brand-800">{(product as any).shortName}</Badge>}
                        {project && <Badge className="bg-info-bg text-info">{(project as any).code}</Badge>}
                      </div>
                      <p className="text-xs text-ink-muted mb-2">{d.decision}</p>
                      {d.rationale && <p className="text-xs text-ink-muted italic">{d.rationale}</p>}
                      <div className="flex items-center gap-3 mt-2 text-2xs text-ink-muted">
                        {by && <span className="flex items-center gap-1"><Avatar initials={(by as any).initials} size="xs" />{(by as any).name}</span>}
                        <span>Decided {fmtDate(d.decidedAt)}</span>
                        <span>{fmtRelative(d.decidedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEdit(d)} className="text-ink-muted hover:text-brand-700 p-1 rounded hover:bg-brand-50"><Pencil size={11} /></button>
                      {isConfirming ? (
                        <>
                          <button onClick={() => handleDelete(d.id)} className="text-2xs text-white bg-crit px-1.5 py-0.5 rounded">Del</button>
                          <button onClick={() => setConfirmDelete(null)} className="text-2xs text-ink-muted px-1 py-0.5 rounded border border-line">✕</button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmDelete(d.id)} className="text-ink-muted hover:text-crit p-1 rounded hover:bg-crit-bg"><Trash2 size={11} /></button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            {sorted.length === 0 && <li className="px-5 py-8 text-sm text-ink-muted text-center">No decisions yet. Create one above.</li>}
          </ul>
        </Card>
      </div>

      {/* Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-semibold mb-4">{editTarget ? 'Edit Decision' : 'New Decision'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-ink-muted">Title *</label>
                <input className="w-full mt-1 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" value={form.title} onChange={e => setF('title', e.target.value)} placeholder="Decision title" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted">Context</label>
                <textarea className="w-full mt-1 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 h-16 resize-none" value={form.context} onChange={e => setF('context', e.target.value)} placeholder="What situation led to this decision?" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted">Decision *</label>
                <textarea className="w-full mt-1 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 h-16 resize-none" value={form.decision} onChange={e => setF('decision', e.target.value)} placeholder="What was decided?" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted">Rationale</label>
                <textarea className="w-full mt-1 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 h-14 resize-none" value={form.rationale} onChange={e => setF('rationale', e.target.value)} placeholder="Why was this decision made?" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink-muted">Status</label>
                  <select className="w-full mt-1 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none" value={form.status} onChange={e => setF('status', e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="decided">Decided</option>
                    <option value="overturned">Overturned</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-muted">Decided by *</label>
                  <select className="w-full mt-1 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none" value={form.decidedBy} onChange={e => setF('decidedBy', e.target.value)}>
                    <option value="">-- select --</option>
                    {((resources as any[]) ?? []).map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>
              {error && <p className="text-xs text-crit">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : editTarget ? 'Save changes' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
