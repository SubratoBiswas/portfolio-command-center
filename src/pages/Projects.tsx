import { Link } from 'react-router-dom';
import { Plus, FolderKanban } from 'lucide-react';
import { useProjects, useLookups } from '@/lib/hooks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, RagBadge } from '@/components/shared/Badges';
import { fmtDate, fmtCurrency, daysFromNow, cn } from '@/lib/utils';

export default function Projects() {
  const { data: projects = [], isLoading } = useProjects();
  const { clientById, productById, resourceById } = useLookups();

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading projects…</div>;

  return (
    <div>
      <PageHeader
        eyebrow="Delivery"
        title="Projects"
        subtitle={`${projects.length} projects · ${(projects as any[]).filter((p:any)=>p.rag==='red').length} red, ${(projects as any[]).filter((p:any)=>p.rag==='orange').length} orange, ${(projects as any[]).filter((p:any)=>p.rag==='yellow').length} yellow, ${(projects as any[]).filter((p:any)=>p.rag==='green').length} green.`}
        actions={<Button variant="primary"><Plus size={13} /> New project</Button>}
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
                {(projects as any[]).map((p: any) => {
                  const client = clientById(p.clientId);
                  const owner = resourceById(p.ownerId);
                  const pctSpent = p.budget && p.spent ? (p.spent / p.budget) * 100 : 0;
                  const daysLeft = daysFromNow(p.endDate);
                  return (
                    <tr key={p.id} className="hover:bg-paper-sunken/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/projects/${p.id}`} className="font-medium text-ink hover:text-brand-700">{p.code}</Link>
                        <p className="text-xs text-ink-muted truncate max-w-[200px]">{p.name}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-muted">{(client as any)?.name ?? '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3"><RagBadge rag={p.rag} /></td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-ink">{fmtDate(p.startDate)} – {fmtDate(p.endDate)}</p>
                        <p className={cn('text-2xs', daysLeft < 0 ? 'text-crit' : daysLeft < 14 ? 'text-amber-700' : 'text-ink-muted')}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
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
    </div>
  );
}
