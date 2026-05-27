import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useTasks, useResources, useProjects, useCreateTask, useUpdateTask, useDeleteTask, useLookups } from '@/lib/hooks';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Field, FormRow } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { PriorityBadge, StatusBadge } from '@/components/shared/Badges';
import { useToast } from '@/components/ui/toast';
import { fmtDate, cn } from '@/lib/utils';

const STATUSES = ['not_started','in_progress','blocked','done'];
const PRIORITIES = ['low','medium','high','critical'];

const statusCol: Record<string, string> = {
  not_started: 'bg-line-subtle text-ink-muted',
  in_progress: 'bg-info-bg text-info',
  blocked: 'bg-crit-bg text-crit',
  done: 'bg-ok-bg text-ok',
};

const EMPTY = { title: '', description: '', priority: 'medium', status: 'not_started', assigneeId: '', projectId: '', dueDate: '' };

type FormState = typeof EMPTY;

export default function Tasks() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: resources = [] } = useResources();
  const { data: projects = [] } = useProjects();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState<FormState>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function openCreate() { setEditTarget(null); setForm({ ...EMPTY }); setError(''); setOpen(true); }
  function openEdit(t: any) {
    setEditTarget(t);
    setForm({
      title: t.title ?? '',
      description: t.description ?? '',
      priority: t.priority ?? 'medium',
      status: t.status ?? 'not_started',
      assigneeId: t.assigneeId ?? '',
      projectId: t.projectId ?? '',
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
    });
    setError('');
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSaving(true); setError('');
    const payload: any = {
      title: form.title.trim(),
      description: form.description.trim() || '',
      priority: form.priority,
      status: form.status,
      assigneeId: form.assigneeId || null,
      projectId: form.projectId || null,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    };
    try {
      if (editTarget) {
        await updateTask.mutateAsync({ id: editTarget.id, ...payload });
        toast('Task updated successfully');
      } else {
        await createTask.mutateAsync(payload);
        toast('Task created successfully');
      }
      setOpen(false);
      setForm({ ...EMPTY });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save task.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTask.mutateAsync(id);
      toast('Task deleted', 'info');
    } finally {
      setConfirmDelete(null);
    }
  }

  const filtered = statusFilter === 'all'
    ? (tasks as any[])
    : (tasks as any[]).filter(t => t.status === statusFilter);

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading tasks…</div>;

  const grouped = STATUSES.reduce<Record<string, any[]>>((acc, s) => {
    acc[s] = filtered.filter(t => t.status === s);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        eyebrow="Execution"
        title="Tasks"
        subtitle={filtered.length + ' tasks'}
        actions={
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-xs w-36">
              <option value="all">All statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </Select>
            <Button variant="primary" onClick={openCreate}><Plus size={13} /> New task</Button>
          </div>
        }
      />

      {/* Kanban board */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATUSES.map(status => (
          <div key={status} className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Badge className={cn('text-2xs', statusCol[status])}>{status.replace('_', ' ')}</Badge>
              <span className="text-2xs text-ink-muted">{grouped[status].length}</span>
            </div>
            {grouped[status].map((t: any) => {
              const assignee = (resources as any[]).find(r => r.id === t.assigneeId);
              const project = (projects as any[]).find(p => p.id === t.projectId);
              const isConfirming = confirmDelete === t.id;
              return (
                <div key={t.id} className="bg-paper-raised border border-line rounded p-3 space-y-2 hover:shadow-card transition-shadow">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-medium text-ink leading-snug flex-1">{t.title}</span>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button onClick={() => openEdit(t)} className="text-ink-muted hover:text-brand-700 p-1 rounded hover:bg-brand-50 transition-colors">
                        <Pencil size={11} />
                      </button>
                      {isConfirming ? (
                        <>
                          <button onClick={() => handleDelete(t.id)} className="text-2xs text-white bg-crit hover:bg-crit/80 px-1.5 py-0.5 rounded">Del</button>
                          <button onClick={() => setConfirmDelete(null)} className="text-2xs text-ink-muted hover:text-ink px-1 py-0.5 rounded border border-line">✕</button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmDelete(t.id)} className="text-ink-muted hover:text-crit p-1 rounded hover:bg-crit-bg transition-colors">
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                  {project && <Badge className="bg-info-bg text-info text-2xs">{project.code}</Badge>}
                  <div className="flex items-center justify-between">
                    <PriorityBadge priority={t.priority} />
                    <div className="flex items-center gap-1">
                      {t.dueDate && <span className="text-2xs text-ink-muted">{fmtDate(t.dueDate)}</span>}
                      {assignee && <Avatar initials={assignee.initials} size="xs" title={assignee.name} />}
                    </div>
                  </div>
                </div>
              );
            })}
            {grouped[status].length === 0 && (
              <div className="border-2 border-dashed border-line rounded p-4 text-center text-2xs text-ink-subtle">Empty</div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit}>
          <DialogHeader title={editTarget ? 'Edit task' : 'New task'} onClose={() => setOpen(false)} />
          <DialogBody className="space-y-3">
            <Field label="Title" required>
              <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Set up CI pipeline" required />
            </Field>
            <FormRow>
              <Field label="Status">
                <Select value={form.status} onChange={e => set('status', e.target.value)} className="w-full">
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </Select>
              </Field>
              <Field label="Priority">
                <Select value={form.priority} onChange={e => set('priority', e.target.value)} className="w-full">
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Assignee">
                <Select value={form.assigneeId} onChange={e => set('assigneeId', e.target.value)} className="w-full">
                  <option value="">-- none --</option>
                  {(resources as any[]).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </Field>
              <Field label="Project">
                <Select value={form.projectId} onChange={e => set('projectId', e.target.value)} className="w-full">
                  <option value="">-- none --</option>
                  {(projects as any[]).map(p => <option key={p.id} value={p.id}>{p.code} – {p.name}</option>)}
                </Select>
              </Field>
            </FormRow>
            <Field label="Due date">
              <Input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </Field>
            <Field label="Description">
              <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Additional context…" />
            </Field>
            {error && <p className="text-xs text-crit bg-crit-bg border border-crit/20 rounded px-3 py-2">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : editTarget ? 'Save changes' : 'Create task'}</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
