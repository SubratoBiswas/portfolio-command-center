import { Link } from 'react-router-dom';
import { Boxes, Target, FolderKanban, Wrench, AlertTriangle, Gavel, GitBranch, FileText, type LucideIcon } from 'lucide-react';
import {
  useProducts, useOpportunities, useProjects, useCapabilities,
  useRisks, useDecisions, useDependencies, useTranscripts,
} from '@/lib/hooks';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { fmtCurrency, sumBy } from '@/lib/utils';

interface Section { label: string; count: number; to: string; icon: LucideIcon; detail: string; tone: string; }

export default function Portfolio() {
  const { data: products = [] } = useProducts();
  const { data: opportunities = [] } = useOpportunities();
  const { data: projects = [] } = useProjects();
  const { data: capabilities = [] } = useCapabilities();
  const { data: risks = [] } = useRisks();
  const { data: decisions = [] } = useDecisions();
  const { data: dependencies = [] } = useDependencies();
  const { data: transcripts = [] } = useTranscripts();

  const prods = products as any[], opps = opportunities as any[], projs = projects as any[],
        caps = capabilities as any[], rks = risks as any[], decs = decisions as any[],
        deps = dependencies as any[], txs = transcripts as any[];

  const sections: Section[] = [
    { label: 'Products',      count: prods.length,  to: '/products',                  icon: Boxes,         detail: `${prods.filter(p => ['ga','mature'].includes(p.maturity)).length} in market`,          tone: 'from-brand to-brand-900' },
    { label: 'Opportunities', count: opps.length,   to: '/opportunities',             icon: Target,        detail: `${fmtCurrency(sumBy(opps, o => o.value), { compact: true })} pipeline`,                tone: 'from-amber-500 to-amber-700' },
    { label: 'Projects',      count: projs.length,  to: '/projects',                  icon: FolderKanban,  detail: `${projs.filter(p => !['done','cancelled'].includes(p.status)).length} active`,          tone: 'from-info to-indigo-700' },
    { label: 'Capabilities',  count: caps.length,   to: '/library/capabilities',      icon: Wrench,        detail: 'Reusable building blocks',                                                              tone: 'from-violet-500 to-violet-700' },
    { label: 'Risks',         count: rks.length,    to: '/intelligence/risks',        icon: AlertTriangle, detail: `${rks.filter(r => r.severity === 'critical').length} critical`,                         tone: 'from-crit to-rose-700' },
    { label: 'Decisions',     count: decs.length,   to: '/intelligence/decisions',    icon: Gavel,         detail: `${decs.filter(d => d.status === 'pending').length} pending`,                            tone: 'from-slate-500 to-slate-700' },
    { label: 'Dependencies',  count: deps.length,   to: '/intelligence/dependencies', icon: GitBranch,     detail: 'Cross-portfolio links',                                                                 tone: 'from-emerald-500 to-emerald-700' },
    { label: 'Transcripts',   count: txs.length,    to: '/intelligence/transcripts',  icon: FileText,      detail: 'AI-extracted insights',                                                                 tone: 'from-purple-500 to-purple-700' },
  ];

  return (
    <div>
      <PageHeader eyebrow="Overview" title="Portfolio" subtitle="High-level counts across every domain. Click any card to drill in." />
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {sections.map(s => (
          <Link key={s.to} to={s.to}>
            <Card className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className={`bg-gradient-to-br ${s.tone} p-4 text-white`}>
                <s.icon size={20} className="mb-2 opacity-80" />
                <p className="text-3xl font-bold">{s.count}</p>
                <p className="text-sm font-medium">{s.label}</p>
              </div>
              <CardBody className="py-2 px-4">
                <p className="text-xs text-ink-muted">{s.detail}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
