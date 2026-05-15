import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useTasks, useLookups, useResources, useProjects, useCreateTask, useDeleteTask } from '@/lib/hooks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Field, FormRow } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { PriorityBadge } from '@/components/shared/Badges';
import { fmtDate, daysFromNow, cn } from '@/lib/utils';

const COLUMNS = [
  { key: 'not_started', label: 'Backlog',     tone: 'bg-line-subtle text-ink-muted' },
  { key: 'in_progress', label: 'In progress', tone: 'bg-info-bg text-info' },
  { key: 'blocked',     label: 'Blocked',     tone: 'bg-crit-bg text-crit' },
  { key: 'in_review',   label: 'Review',      tone: 'bg-amber-100 text-amber-800' },
  { key: 'done',        label: 'Done',        tone: 'bg-ok-bg text-ok' },
] as const;

const EMPTY = { title: '', projectId: '', assigneeId: '', priority: 'p2', status: 'not_started', dueDate: '' };

export default function Tasks() {
  const { data: tasks = [], isLoading } = useTasks();
  const { resourceById, projectById } = useLookups();
  const { data: resources = [] } = useResources();
  const { data: projects = [] } = useProjects();
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Task title is required.'); return; }
    setSaving(true); setError('');
    try {
      await createTask.mutateAsync({
        title: form.title.trim(),
        projectId: form.projectId || null,
        assigneeId: form.assigneeId || null,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || null,
      });
      setOpen(false);
      setForm({ ...EMPTY });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create task.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try { await deleteTask.mutateAsync(id); } finally { setConfirmDelete(null); }
  }

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading tasks...</div>;

  return (
    <div>
      <PageHeader
        eyebrow="Execution"
        title="Tasks"
        subtitle={tasks.length + ' tasks across the portfolio.'}
        actions={<Button variant="primary" onClick={() => setOpen(true)}><Plus size={13} /> New task</Button>}
      />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {COLUMNS.map(col => {
            const colTasks = (tasks as any[]).filter((t: any) => t.status === col.key);
            return (
              <div key={col.key} className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={col.tone}>{col.label}</Badge>
                  <span className="text-2xs text-ink-muted">{colTasks.length}</span>
                </div>
                {colTasks.map((t: any) => {
                  const assignee = resourceById(t.assigneeId);
                  const project = projectById(t.projectId);
                  const overdue = t.dueDate && daysFromNow(t.dueDate) < 0 && t.status !== 'done';
                  const isConfirming = confirmDelete === t.id;
                  return (
                    <Card key={t.id} className="hover:shadow-md transition-shadow">
                      <div className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-medium text-ink leading-snug flex-1">{t.title}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            <PriorityBadge priority={t.priority} />
                            {isConfirming ? (
                              <div className="flex items-center gap-0.5">
                                <button onClick={() => handleDelete(t.id)} className="text-2xs text-white bg-crit hover:bg-crit/80 px-1.5 py-0.5 rounded">Del</button>
                                <button onClick={() => setConfirmDelete(null)} className="text-2xs text-ink-muted hover:text-ink px-1 py-0.5 rounded">✕</button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmDelete(t.id)} className="text-ink-muted hover:text-crit p-0.5 rounded hover:bg-crit-bg transition-colors">
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                        {project && <p className="text-2xs text-ink-muted">{(project as any).code}</p>}
                        <div className="flex items-center justify-between">
                          {assignee ? <Avatar initials={(assignee as any).initials} size="xs" /> : <span />}
                          {t.dueDate && (
                            <span className={cn('text-2xs', overdue ? 'text-crit font-medium' : 'text-ink-muted')}>
                              {fmtDate(t.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
                {colTasks.length === 0 && <p className="text-2xs text-ink-muted text-center py-4">Empty</p>}
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit}>
          <DialogHeader title="New task" onClose={() => setOpen(false)} />
          <DialogBody className="space-y-3">
            <Field label="Task title" required>
              <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Review MDM schema design" required />
            </Field>
            <FormRow>
              <Field label="Project">
                <Select value={form.projectId} onChange={e => set('projectId', e.target.value)} className="w-full">
                  <option value="">-- none --</option>
                  {(projects as any[]).map((p: any) => <option key={p.id} value={p.id}>{p.code}</option>)}
                </Select>
              </Field>
              <Field label="Assignee">
                <Select value={form.assigneeId} onChange={e => set('assigneeId', e.target.value)} className="w-full">
                  <option value="">-- none --</option>
                  {(resources as any[]).map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Priority">
                <Select value={form.priority} onChange={e => set('priority', e.target.value)} className="w-full">
                  <option value="p0">P0 Critical</option>
                  <option value="p1">P1 High</option>
                  <option value="p2">P2 Medium</option>
                  <option value="p3">P3 Low</option>
                </Select>
              </Field>
              <Field label="Initial status">
                <Select value={form.status} onChange={e => set('status', e.target.value)} className="w-full">
                  <option value="not_started">Backlog</option>
                  <option value="in_progress">In progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="in_review">Review</option>
                </Select>
              </Field>
            </FormRow>
            <Field label="Due date">
              <Input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </Field>
            {error && <p className="text-xs text-crit bg-crit-bg border border-crit/20 rounded px-3 py-2">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Creating...' : 'Create task'}</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
