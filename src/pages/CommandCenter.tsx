import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, AlertTriangle, Target, Users, Clock, ArrowUpRight,
  CircleDot, FileText, Activity, Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  AreaChart, Area, PieChart, Pie,
} from 'recharts';
import {
  useOpportunities, useProjects, useResources, useAllocations, useRisks,
  useProducts, useClients, useTasks, useDecisions, usePipelineSummary,
  useUtilization, usePortfolioHealth, useLookups,
} from '@/lib/hooks';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { PageHeader, SectionHeader } from '@/components/shared/PageHeader';
import { RagDot, RagBadge, SeverityBadge, StatusBadge } from '@/components/shared/Badges';
import { fmtCurrency, fmtPct, fmtRelative, sumBy, daysFromNow, utilizationRag, ragColor, cn } from '@/lib/utils';

const STAGE_ORDER = ['qualify', 'discover', 'propose', 'negotiate', 'closed_won'];
const STAGE_LABEL: Record<string, string> = { qualify: 'Qualify', discover: 'Discover', propose: 'Propose', negotiate: 'Negotiate', closed_won: 'Won' };
const RAG_COLOR: Record<string, string> = { green: '#10B981', yellow: '#F59E0B', orange: '#F97316', red: '#EF4444' };

export default function CommandCenter() {
  const { data: opportunities = [] } = useOpportunities();
  const { data: projects = [] } = useProjects();
  const { data: resources = [] } = useResources();
  const { data: allocations = [] } = useAllocations();
  const { data: risks = [] } = useRisks();
  const { data: products = [] } = useProducts();
  const { data: tasks = [] } = useTasks();
  const { data: decisions = [] } = useDecisions();
  const { data: pipelineSummary = [] } = usePipelineSummary();
  const { data: utilization = [] } = useUtilization();
  const { data: health } = usePortfolioHealth();
  const { resourceById, clientById, productById } = useLookups();

  const opps = opportunities as any[];
  const projs = projects as any[];
  const resos = resources as any[];
  const allocs = allocations as any[];
  const rks = risks as any[];
  const prods = products as any[];
  const tsks = tasks as any[];
  const decs = decisions as any[];
  const util = utilization as any[];
  const pipeline = pipelineSummary as any[];

  // Computed metrics
  const activeOpps = opps.filter(o => !['closed_won','closed_lost'].includes(o.stage));
  const pipelineValue = sumBy(activeOpps, o => Number(o.value));
  const weightedPipeline = sumBy(activeOpps, o => Number(o.value) * (o.probability / 100));
  const closingSoon = activeOpps.filter(o => daysFromNow(o.expectedCloseDate) <= 30);
  const activeProjects = projs.filter(p => !['done','cancelled'].includes(p.status));
  const atRiskProjects = activeProjects.filter(p => ['red','orange'].includes(p.rag));
  const criticalRisks = rks.filter(r => r.severity === 'critical');
  const overloaded = resos.filter(r => {
    const alloc = sumBy(allocs.filter(a => a.resourceId === r.id), a => a.hoursPerWeek);
    const cap = r.weeklyCapacityHours - (r.timeOffHours ?? 0);
    return cap > 0 && alloc / cap > 1;
  });
  const staleOpps = activeOpps.filter(o => daysFromNow(o.lastInteractionAt) <= -10);

  // RAG breakdown for donut
  const ragBreakdown = Object.entries(
    projs.reduce<Record<string,number>>((acc, p) => { acc[p.rag] = (acc[p.rag] ?? 0) + 1; return acc; }, {})
  ).map(([rag, count]) => ({ rag, count, color: RAG_COLOR[rag] }));

  // KPI strip
  const kpis = [
    { label: 'Pipeline', value: fmtCurrency(pipelineValue, { compact: true }), sub: `${fmtCurrency(weightedPipeline, { compact: true })} weighted`, icon: Target, trend: 'up' as const },
    { label: 'Active projects', value: activeProjects.length, sub: `${atRiskProjects.length} at risk`, icon: CircleDot, trend: atRiskProjects.length > 0 ? 'down' as const : 'up' as const },
    { label: 'Resources', value: resos.length, sub: `${overloaded.length} over-allocated`, icon: Users, trend: overloaded.length > 2 ? 'down' as const : 'up' as const },
    { label: 'Critical risks', value: criticalRisks.length, sub: `${rks.length} total`, icon: AlertTriangle, trend: criticalRisks.length > 0 ? 'down' as const : 'up' as const },
    { label: 'Stale deals', value: staleOpps.length, sub: `>10d no contact`, icon: Clock, trend: staleOpps.length > 0 ? 'down' as const : 'up' as const },
    { label: 'Products', value: prods.length, sub: `${prods.filter(p => ['ga','mature'].includes(p.maturity)).length} in market`, icon: Activity, trend: 'up' as const },
  ];

  // Pipeline chart data
  const pipelineChartData = STAGE_ORDER
    .map(stage => {
      const item = pipeline.find((p: any) => p.stage === stage);
      return { stage: STAGE_LABEL[stage] ?? stage, count: item?.count ?? 0, value: item?.value ?? 0 };
    })
    .filter(d => d.count > 0);

  return (
    <div>
      <PageHeader
        eyebrow="Good morning"
        title="Command Center"
        subtitle="Portfolio health at a glance. All metrics are live."
        actions={
          <button className="flex items-center gap-1.5 text-xs text-brand-700 hover:text-brand-900 font-medium">
            <Sparkles size={13} /> Generate briefing
          </button>
        }
      />

      {/* KPI strip */}
      <div className="px-6 pt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(k => (
          <Card key={k.label} className="hover:shadow-sm transition-shadow">
            <CardBody className="py-3 px-3">
              <div className="flex items-center justify-between mb-1">
                <k.icon size={13} className="text-ink-muted" />
                {k.trend === 'up' ? <TrendingUp size={11} className="text-ok" /> : <TrendingDown size={11} className="text-crit" />}
              </div>
              <p className="text-xl font-bold text-ink leading-none">{k.value}</p>
              <p className="text-2xs text-ink-muted mt-0.5">{k.label}</p>
              <p className="text-2xs text-ink-muted/70">{k.sub}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline by stage */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Pipeline by stage</CardTitle></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={pipelineChartData} barCategoryGap="30%">
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmtCurrency(v, { compact: true })} />
                <Tooltip formatter={(v: number) => fmtCurrency(v, { compact: true })} />
                <Bar dataKey="value" radius={[3,3,0,0]} fill="#0F766E" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Project RAG donut */}
        <Card>
          <CardHeader><CardTitle>Project health</CardTitle></CardHeader>
          <CardBody className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={ragBreakdown} dataKey="count" nameKey="rag" cx="50%" cy="50%" innerRadius={40} outerRadius={60}>
                  {ragBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [`${v} projects`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-full mt-1">
              {ragBreakdown.map(r => (
                <div key={r.rag} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                  <span className="text-2xs text-ink-muted capitalize">{r.rag}: {r.count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Utilization top list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Utilization</CardTitle>
            <Link to="/resources/capacity" className="text-xs text-brand-700 hover:text-brand-900 flex items-center gap-0.5">View all <ArrowUpRight size={12} /></Link>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {util.slice(0, 8).map((u: any) => (
                <div key={u.resourceId} className="flex items-center gap-2">
                  <Avatar initials={u.initials} size="xs" />
                  <span className="text-xs text-ink w-28 truncate">{u.name}</span>
                  <div className="flex-1 bg-line-subtle rounded-full h-1.5 overflow-hidden">
                    <div className={cn('h-full rounded-full', u.rag === 'red' ? 'bg-crit' : u.rag === 'orange' ? 'bg-amber-500' : u.rag === 'yellow' ? 'bg-amber-400' : 'bg-ok')} style={{ width: `${Math.min(100, u.utilizationPct)}%` }} />
                  </div>
                  <span className={cn('text-2xs w-10 text-right font-medium', u.rag === 'red' ? 'text-crit' : u.rag === 'orange' ? 'text-amber-600' : 'text-ok')}>{u.utilizationPct}%</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Attention items */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-1"><AlertTriangle size={13} className="text-amber-600" /> Attention needed</CardTitle></CardHeader>
          <CardBody className="space-y-2">
            {atRiskProjects.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <RagDot rag={p.rag} />
                <Link to={`/projects/${p.id}`} className="text-xs text-ink hover:text-brand-700 flex-1 truncate">{p.code}</Link>
                <RagBadge rag={p.rag} />
              </div>
            ))}
            {criticalRisks.slice(0, 2).map(r => (
              <div key={r.id} className="flex items-center gap-2">
                <AlertTriangle size={12} className="text-crit" />
                <span className="text-xs text-ink flex-1 truncate">{r.title}</span>
                <SeverityBadge severity={r.severity} />
              </div>
            ))}
            {staleOpps.slice(0, 2).map(o => (
              <div key={o.id} className="flex items-center gap-2">
                <Clock size={12} className="text-amber-600" />
                <Link to={`/opportunities/${o.id}`} className="text-xs text-ink hover:text-brand-700 flex-1 truncate">{o.name}</Link>
                <span className="text-2xs text-amber-700">stale</span>
              </div>
            ))}
            {atRiskProjects.length + criticalRisks.length + staleOpps.length === 0 && (
              <p className="text-xs text-ok">All green — nothing needs attention right now.</p>
            )}
          </CardBody>
        </Card>

        {/* Recent decisions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent decisions</CardTitle>
            <Link to="/intelligence/decisions" className="text-xs text-brand-700 hover:text-brand-900 flex items-center gap-0.5">View all <ArrowUpRight size={12} /></Link>
          </CardHeader>
          <CardBody>
            <div className="divide-y divide-line">
              {decs.slice(0, 4).map((d: any) => {
                const by = resourceById(d.decidedBy);
                return (
                  <div key={d.id} className="py-2 flex items-start gap-2 first:pt-0 last:pb-0">
                    {by && <Avatar initials={(by as any).initials} size="xs" className="mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink truncate">{d.title}</p>
                      <p className="text-2xs text-ink-muted">{fmtRelative(d.decidedAt)}</p>
                    </div>
                    <Badge className={d.status === 'decided' ? 'bg-ok-bg text-ok' : 'bg-amber-100 text-amber-800'}>{d.status}</Badge>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
