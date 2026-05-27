import { FileText, BarChart3, TrendingUp, Users, DollarSign, Calendar, Download, Sparkles } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';

const REPORTS = [
  {
    title: 'Leadership Weekly Update',
    description: 'Auto-generated executive summary of portfolio status, KPI deltas, and attention items.',
    icon: TrendingUp,
    tone: 'from-brand to-brand-900',
    cadence: 'Weekly',
    aiAssisted: true,
  },
  {
    title: 'Pipeline Health',
    description: 'Stage breakdown, conversion rates, velocity, stale deals, win/loss analysis.',
    icon: BarChart3,
    tone: 'from-amber-500 to-amber-700',
    cadence: 'Weekly',
  },
  {
    title: 'Capacity Forecast',
    description: '12-week resource utilization projection. Overallocation flags. Hiring recommendations.',
    icon: Users,
    tone: 'from-info to-indigo-700',
  },
  {
    title: 'Project Status Bundle',
    description: 'Combined RAID + milestone view across all active client engagements.',
    icon: FileText,
    tone: 'from-violet-500 to-violet-700',
    cadence: 'Bi-weekly',
  },
  {
    title: 'Revenue & Burn',
    description: 'Project budget consumption vs plan. Variance analysis by client and product.',
    icon: DollarSign,
    tone: 'from-emerald-500 to-emerald-700',
    cadence: 'Monthly',
  },
  {
    title: 'QBR Pack',
    description: 'Quarterly business review deck: wins, lessons, roadmap progression, asks.',
    icon: Calendar,
    tone: 'from-slate-500 to-slate-700',
    cadence: 'Quarterly',
  },
];

export default function Reports() {
  return (
    <div>
      <PageHeader
        eyebrow="Reporting"
        title="Reports"
        subtitle="Generate executive-ready reports. AI drafts the narrative, you review and ship."
      />

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {REPORTS.map(r => (
          <Card key={r.title} className="hover:border-brand-300 hover:shadow-raised transition-all">
            <CardBody>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className={`h-10 w-10 rounded-md bg-gradient-to-br ${r.tone} flex items-center justify-center text-white shadow-card`}>
                  <r.icon size={17} />
                </div>
                {r.aiAssisted && (
                  <Badge tone="bg-brand text-white" size="xs"><Sparkles size={9} /> AI</Badge>
                )}
              </div>
              <h3 className="text-sm font-semibold text-ink tracking-tight mb-1">{r.title}</h3>
              {r.cadence && <Badge size="xs" tone="bg-paper-sunken text-ink-muted" className="mb-2">{r.cadence}</Badge>}
              <p className="text-xs text-ink-muted leading-relaxed mb-4">{r.description}</p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="primary"><Sparkles size={11} /> Generate</Button>
                <Button size="sm" variant="outline"><Download size={11} /> Export</Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
