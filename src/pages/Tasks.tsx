import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTasks, useLookups, useResources, useProjects, useCreateTask } from '@/lib/hooks';
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
  { key: 'not_started', label: 'Backlog',      tone: 'bg-line-subtle text-ink-muted' },
  { key: 'in_progress', label: 'In progress',  tone: 'bg-info-bg text-info' },
  { key: 'blocked',     label: 'Blocked',       tone: 'bg-crit-bg text-crit' },
  { key: 'in_review',   label: 'Review',        tone: 'bg-amber-100 text-amber-800' },
  { key: 'done',        label: 'Done',          tone: 'bg-ok-bg text-ok' },
] as const;

const EMPTY = { title: '', projectId: '', assigneeId: '', priority: 'p2', status: 'not_started', dueDate: '' };

export default function Tasks() {
  const { data: tasks = [], isLoading } = useTasks();
  const { resourceById, projectById } = useLookups();
  const { data: resources = [] } = useResources();
  const { data: projects = [] } = useProjects();
  const createTask = useCreateTask();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading tasks…</div>;

  return (
    <div>
      <PageHeader
        eyebrow="Execution"
        title="Tasks"
        subtitle={`${tasks.length} tasks across the portfolio.`}
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
                  const overdue = t.dueDate && daysFromNow(t.dueDate) < 0 && t.s