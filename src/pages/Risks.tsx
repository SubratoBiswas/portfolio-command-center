import { useState } from 'react';
import { Plus, AlertTriangle, ShieldAlert, Pencil, Trash2 } from 'lucide-react';
import { useRisks, useResources, useProjects, useCreateRisk, useUpdateRisk, useDeleteRisk, useLookups } from '@/lib/hooks';
import { CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Field, FormRow } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { SeverityBadge } from '@/components/shared/Badges';
import { useToast } from '@/components/ui/toast';
import { fmtDate, cn } from '@/lib/utils';

const SEVERITIES = ['low','medium','high','critical'];
const STATUSES = ['open','mitigated','closed','accepted'];

const severityTone: Record<string, string> = {
  low: 'bg-ok-bg text-ok', medium: 'bg-amber-100 text-amber-800',
  high: 'bg-amber-200 text-amber-900', critical: 'bg-crit-bg text-crit',
};

const EMPTY = {
  title: '', description: '', severity: 'medium', likelihood: '0.5',
  impact: '3', status: 'open', mitigation: '', ownerId: '', projectId: '',
};

function likelihoodToNum(v: string) { return Math.min(1, Math.max(0, parseFloat(v) || 0.5)); }

export default function Risks() {
  const { data: risks = [], isLoading } = useRisks();
  const { data: resources = [] } = useResources();
  const { data: projects = [] } = useProjects();
  const createRisk = useCreateRisk();
  const updateRisk = useUpdateRisk();
  const deleteRisk = useDeleteRisk();
  const { resourceById, projectById } = useLookups();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }
  function openCreate() { setEditTarget(null); setForm({ ...EMPTY }); setError(''); setOpen(true); }
  function openEdit(r: any) {
    setEditTarget(r);
    setForm({
      title: r.title ?? '',
      description: r.description ?? '',
      severity: r.severity ?? 'medium',
      likelihood: String(r.likelihood ?? 0.5),
      impact: String(r.impact ?? 3),
      status: r.status ?? 'open',
      mitigation: r.mitigation ?? '',
      ownerId: r.ownerId ?? '',
      projectId: r.projectId ?? '',
    });
    setError('');
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.ownerId) { setError('Owner is required.'); return; }
    setSaving(true); setError('');
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || '',
      severity: form.severity,
      likelihood: likelihoodToNum(form.likelihood),
      impact: parseInt(form.impact, 10) || 3,
      status: form.status,
      mitigation: form.mitigation.trim() || '',
      ownerId: form.ownerId,
      projectId: form.projectId || null,
    };
    try {
      if (editTarget) {
        await updateRisk.mutateAsync({ id: editTarget.id, ...payload });
        toast('Risk updated successfully');
      } else {
        await createRisk.mutateAsync(payload);
        toast('Risk created successfully');
      }
      setOpen(false); setForm({ ...EMPTY });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save risk.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteRisk.mutateAsync(id);
      toast('Risk deleted', 'info');
    } finally {
      setConfirmDelete(null);
    }
  }

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading risks…</div>;

  const open_ = (risks as any[]).filter(r => r.status === 'open');
  const mitigated = (risks as any[]).filter(r => r.status === 'mitigated');
  const critical = (risks as any[]).filter(r => r.severity === 'critical');

  function RiskItem({ r }: { r: any }) {
    const owner = resourceById(r.ownerId);
    const project = r.projectId ? projectById(r.projectId) : null;
    const isConfirming = confirmDelete === r.id;
    return (
      <div className="px-4 py-3 hover:bg-paper-sunken/40 transition-colors">
        <div className="flex items-start gap-2">
          <AlertTriangle size={13} className={cn('mt-0.5 shrink-0', r.severity === 'critical' ? 'text-crit' : r.severity === 'high' ? 'text-amber-600' : 'text-amber-400')} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-medium text-ink">{r.title}</span>
              <SeverityBadge severity={r.severity} />
              {project && <Badge className="bg-info-bg text-info text-2xs">{(project as any).code}</Badge>}
            </div>
            {r.description && <p className="text-xs text-ink-muted mb-1">{r.description}</p>}
            {r.mitigation && <p className="text-xs text-ink-muted italic">↳ {r.mitigation}</p>}
            <div className="flex items-center gap-3 mt-1.5 text-2xs text-ink-muted">
              {owner && <span className="flex items-center gap-1"><Avatar initials={(owner as any).initials} size="xs" />{(owner as any).name}</span>}
              <span>L: {r.likelihood}</span>
              <span>I: {r.impact}/5</span>
              {r.identifiedAt && <span>{fmtDate(r.identifiedAt)}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => openEdit(r)} className="text-ink-muted hover:text-brand-700 p-1 rounded hover:bg-brand-50 transition-colors">
              <Pencil size={12} />
            </button>
            {isConfirming ? (
              <>
                <button onClick={() => handleDelete(r.id)} className="text-2xs text-white bg-crit hover:bg-crit/80 px-2 py-0.5 rounded">Delete</button>
                <button onClick={() => setConfirmDelete(null)} className="text-2xs text-ink-muted hover:text-ink px-1.5 py-0.5 rounded border border-line">✕</button>
              </>
            ) : (
              <button onClick={() => setConfirmDelete(r.id)} className="text-ink-muted hover:text-crit p-1 rounded hover:bg-crit-bg transition-colors">
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Risks"
        subtitle={risks.length + ' risks · ' + critical.length + ' critical · ' + open_.length + ' open'}
        actions={<Button variant="primary" onClick={openCreate}><Plus size={13} /> New risk</Button>}
      />

      <div className="p-6">
        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">All risks ({risks.length})</TabsTrigger>
            <TabsTrigger value="open">Open ({open_.length})</TabsTrigger>
            <TabsTrigger value="critical">Critical ({critical.length})</TabsTrigger>
            <TabsTrigger value="mitigated">Mitigated ({mitigated.length})</TabsTrigger>
          </TabsList>
          {[
            { value: 'list', items: risks as any[] },
            { value: 'open', items: open_ },
            { value: 'critical', items: critical },
            { value: 'mitigated', items: mitigated },
          ].map(tab => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              <div className="border border-line rounded-md divide-y divide-line bg-paper-raised">
                {tab.items.length === 0 && <p className="p-6 text-center text-xs text-ink-muted">No risks here.</p>}
                {tab.items.map(r => <RiskItem key={r.id} r={r} />)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit}>
          <DialogHeader title={editTarget ? 'Edit risk' : 'New risk'} onClose={() => setOpen(false)} />
          <DialogBody className="space-y-3">
            <Field label="Title" required>
              <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Key person dependency on lead architect" required />
            </Field>
            <FormRow>
              <Field label="Severity">
                <Select value={form.severity} onChange={e => set('severity', e.target.value)} className="w-full">
                  {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={e => set('status', e.target.value)} className="w-full">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Likelihood (0–1)" hint="e.g. 0.3 = 30%">
                <Input type="number" min="0" max="1" step="0.05" value={form.likelihood} onChange={e => set('likelihood', e.target.value)} />
              </Field>
              <Field label="Impact (1–5)">
                <Select value={form.impact} onChange={e => set('impact', e.target.value)} className="w-full">
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </Select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Owner" required>
                <Select value={form.ownerId} onChange={e => set('ownerId', e.target.value)} className="w-full">
                  <option value="">-- select --</option>
                  {(resources as any[]).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </Field>
              <Field label="Project">
                <Select value={form.projectId} onChange={e => set('projectId', e.target.value)} className="w-full">
                  <option value="">-- none --</option>
                  {(projects as any[]).map(p => <option key={p.id} value={p.id}>{(p as any).code} – {(p as any).name}</option>)}
                </Select>
              </Field>
            </FormRow>
            <Field label="Description">
              <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="What is the risk?" />
            </Field>
            <Field label="Mitigation plan">
              <Textarea value={form.mitigation} onChange={e => set('mitigation', e.target.value)} rows={2} placeholder="How will this be mitigated?" />
            </Field>
            {error && <p className="text-xs text-crit bg-crit-bg border border-crit/20 rounded px-3 py-2">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : editTarget ? 'Save changes' : 'Create risk'}</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
