import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FolderKanban, Calendar, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { useProject, useTasks, useRisks, useDecisions, useWorkstreams, useResources, useAllocations, useLookups } from '@/lib/hooks';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, RagBadge, SeverityBadge, PriorityBadge } from '@/components/shared/Badges';
import { fmtCurrency, fmtDate, fmtRelative, sumBy, daysFromNow, cn } from '@/lib/utils';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useProject(id!);
  const { data: allTasks = [] } = useTasks();
  const { data: allRisks = [] } = useRisks();
  const { data: allDecisions = [] } = useDecisions();
  const { data: allWorkstreams = [] } = useWorkstreams();
  const { data: resources = [] } = useResources();
  const { data: allocations = [] } = useAllocations();
  const { clientById, productById, resourceById } = useLookups();

  if (isLoading) return <div className="p-12 text-center text-sm text-ink-muted">Loading…</div>;
  if (!project) return <div className="p-12 text-center text-sm text-ink-muted">Project not found · <Link to="/projects" className="text-brand-700">Back</Link></div>;

  const p = project as any;
  const client = clientById(p.clientId);
  const product = productById(p.productId);
  const owner = resourceById(p.ownerId);
  const projectTasks = (allTasks as any[]).filter(t => t.projectId === p.id);
  const projectRisks = (allRisks as any[]).filter(r => r.projectId === p.id);
  const projectDecisions = (allDecisions as any[]).filter(d => d.projectId === p.id);
  const projectWorkstreams = (allWorkstreams as any[]).filter(w => w.projectId === p.id);
  const team = (resources as any[]).filter(r => p.resourceIds?.includes(r.id));
  const pctSpent = p.budget && p.spent ? (p.spent / p.budget) * 100 : 0;

  return (
    <div>
      <PageHeader
        eyebrow={`Project · ${(client as any)?.name ?? ''}`}
        title={`${p.code} — ${p.name}`}
        subtitle={p.weeklyStatus ?? p.scope}
        actions={<RagBadge rag={p.rag} />}
      />
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({projectTasks.length})</TabsTrigger>
              <TabsTrigger value="risks">Risks ({projectRisks.length})</TabsTrigger>
              <TabsTrigger value="decisions">Decisions ({projectDecisions.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card><CardHeader><CardTitle>Charter</CardTitle></CardHeader><CardBody><p className="text-sm text-ink-muted">{p.charter}</p></CardBody></Card>
              {p.milestones?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Milestones</CardTitle></CardHeader>
                  <CardBody className="space-y-2">
                    {p.milestones.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><StatusBadge status={m.status} /><span className="text-xs text-ink">{m.name}</span></div>
                        <span className="text-xs text-ink-muted">{fmtDate(m.dueDate)}</span>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              )}
              {projectWorkstreams.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Workstreams</CardTitle></CardHeader>
                  <CardBody className="space-y-2">
                    {projectWorkstreams.map((w: any) => (
                      <div key={w.id} className="flex items-center justify-between">
                        <span className="text-xs font-medium text-ink">{w.name}</span>
                        <StatusBadge status={w.status} />
                      </div>
                    ))}
                  </CardBody>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="tasks" className="mt-4">
              <Card>
                <ul className="divide-y divide-line">
                  {projectTasks.map((t: any) => {
                    const assignee = resourceById(t.assigneeId);
                    return (
                      <li key={t.id} className="px-4 py-3 flex items-center gap-3">
                        <PriorityBadge priority={t.priority} />
                        <span className="text-xs text-ink flex-1">{t.title}</span>
                        <StatusBadge status={t.status} />
                        {assignee && <Avatar initials={(assignee as any).initials} size="xs" />}
                        {t.dueDate && <span className="text-2xs text-ink-muted">{fmtDate(t.dueDate)}</span>}
                      </li>
                    );
                  })}
                  {projectTasks.length === 0 && <li className="p-6 text-center text-xs text-ink-muted">No tasks</li>}
                </ul>
              </Card>
            </TabsContent>
            <TabsContent value="risks" className="mt-4">
              <Card>
                <ul className="divide-y divide-line">
                  {projectRisks.map((r: any) => (
                    <li key={r.id} className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={12} className="text-amber-600" />
                        <span className="text-xs font-medium text-ink">{r.title}</span>
                        <SeverityBadge severity={r.severity} />
                      </div>
                      {r.mitigation && <p className="text-xs text-ink-muted ml-5">{r.mitigation}</p>}
                    </li>
                  ))}
                  {projectRisks.length === 0 && <li className="p-6 text-center text-xs text-ink-muted">No risks</li>}
                </ul>
              </Card>
            </TabsContent>
            <TabsContent value="decisions" className="mt-4">
              <Card>
                <ul className="divide-y divide-line">
                  {projectDecisions.map((d: any) => (
                    <li key={d.id} className="px-4 py-3">
                      <p className="text-xs font-medium text-ink mb-1">{d.title}</p>
                      <p className="text-xs text-ink-muted">{d.decision}</p>
                    </li>
                  ))}
                  {projectDecisions.length === 0 && <li className="p-6 text-center text-xs text-ink-muted">No decisions</li>}
                </ul>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-3">
              {owner && <div><p className="text-2xs text-ink-muted mb-1">Owner</p><div className="flex items-center gap-2"><Avatar initials={(owner as any).initials} size="xs" /><span className="text-xs">{(owner as any).name}</span></div></div>}
              {client && <div><p className="text-2xs text-ink-muted mb-1">Client</p><span className="text-xs font-medium">{(client as any).name}</span></div>}
              {product && <div><p className="text-2xs text-ink-muted mb-1">Product</p><Badge className="bg-brand-100 text-brand-800">{(product as any).shortName}</Badge></div>}
              <div><p className="text-2xs text-ink-muted mb-1">Timeline</p><p className="text-xs">{fmtDate(p.startDate)} – {fmtDate(p.endDate)}</p></div>
              <div><p className="text-2xs text-ink-muted mb-1">Status</p><StatusBadge status={p.status} /></div>
            </CardBody>
          </Card>
          {p.budget && (
            <Card>
              <CardHeader><CardTitle>Budget</CardTitle></CardHeader>
              <CardBody>
                <div className="flex justify-between text-xs mb-2"><span className="text-ink-muted">Spent</span><span className="font-medium">{fmtCurrency(p.spent ?? 0)} / {fmtCurrency(p.budget)}</span></div>
                <Progress value={pctSpent} className={cn('h-2', pctSpent > 90 ? '[&>div]:bg-crit' : pctSpent > 75 ? '[&>div]:bg-amber-500' : '')} />
              </CardBody>
            </Card>
          )}
          {team.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Team ({team.length})</CardTitle></CardHeader>
              <CardBody className="space-y-2">
                {team.map((r: any) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <Avatar initials={r.initials} size="xs" />
                    <div><p className="text-xs font-medium text-ink">{r.name}</p><p className="text-2xs text-ink-muted">{r.role}</p></div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
