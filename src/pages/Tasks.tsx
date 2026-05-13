import { Plus } from 'lucide-react';
import { useTasks, useLookups } from '@/lib/hooks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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

export default function Tasks() {
  const { data: tasks = [], isLoading } = useTasks();
  const { resourceById, projectById } = useLookups();

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading tasks…</div>;

  return (
    <div>
      <PageHeader
        eyebrow="Execution"
        title="Tasks"
        subtitle={`${tasks.length} tasks across the portfolio. Drag-and-drop is a stub — wire up dnd-kit in production.`}
        actions={<Button variant="primary"><Plus size={13} /> New task</Button>}
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
                  return (
                    <Card key={t.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <div className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-medium text-ink leading-snug">{t.title}</p>
                          <PriorityBadge priority={t.priority} />
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
    </div>
  );
}
