// @ts-nocheck
import * as React from 'react';
import { Sparkles, Send, AlertTriangle, Lightbulb, TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import { Sheet, SheetHeader, SheetBody } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useOpportunities, useResources, useAllocations, useRisks } from '@/lib/hooks';
import { fmtCurrency, sumBy } from '@/lib/utils';

interface AIAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUGGESTED_PROMPTS = [
  'What changed in the portfolio this week?',
  'Which deals are at risk this month?',
  'Show me overallocated resources',
  'Summarize last week\'s leadership update',
  'What decisions are pending my approval?',
];

export function AIAssistant({ open, onOpenChange }: AIAssistantProps) {
  const [draft, setDraft] = React.useState('');
  const { data: opportunities = [] } = useOpportunities();
  const { data: resources = [] } = useResources();
  const { data: allocations = [] } = useAllocations();
  const { data: risks = [] } = useRisks();

  const opps = opportunities as any[];
  const resos = resources as any[];
  const allocs = allocations as any[];
  const rks = risks as any[];

  const stale = opps.filter(o => {
    const days = Math.floor((Date.now() - new Date(o.lastInteractionAt).getTime()) / 86400000);
    return days >= 10 && !['closed_won', 'closed_lost'].includes(o.stage);
  });

  const overallocated = resos.map(r => {
    const total = sumBy(allocs.filter(a => a.resourceId === r.id), a => a.hoursPerWeek);
    return { resource: r, pct: (total / r.weeklyCapacityHours) * 100, total };
  }).filter(x => x.pct > 100);

  const criticalRisks = rks.filter(r => r.severity === 'critical' && r.status !== 'closed');
  const pipelineValue = sumBy(opps, o => o.value * (o.probability / 100));

  const briefings = [
    {
      icon: AlertTriangle,
      tone: 'bg-crit-bg text-crit',
      title: `${overallocated.length} ${overallocated.length === 1 ? 'resource is' : 'resources are'} overallocated`,
      detail: overallocated.length
        ? `${overallocated[0].resource.name} is at ${overallocated[0].pct.toFixed(0)}% capacity. Consider reassigning before the week starts.`
        : 'All resources within capacity.',
      action: 'View capacity heatmap',
      link: '/resources/capacity',
    },
    {
      icon: TrendingUp,
      tone: 'bg-amber-100 text-amber-800',
      title: `${stale.length} ${stale.length === 1 ? 'opportunity is' : 'opportunities are'} stale`,
      detail: stale.length
        ? `${stale[0].name} — ${Math.floor((Date.now() - new Date(stale[0].lastInteractionAt).getTime()) / 86400000)} days since last contact.`
        : 'All pipeline activity recent.',
      action: 'Review pipeline',
      link: '/opportunities',
    },
    {
      icon: AlertTriangle,
      tone: 'bg-crit-bg text-crit',
      title: `${criticalRisks.length} critical ${criticalRisks.length === 1 ? 'risk' : 'risks'}`,
      detail: criticalRisks[0]?.title ?? 'None active.',
      action: 'Open risk register',
      link: '/intelligence/risks',
    },
    {
      icon: Lightbulb,
      tone: 'bg-brand-100 text-brand-800',
      title: 'Suggested action: consolidate document processing',
      detail: 'Documantra and Control Tower both extract from contracts. A shared accelerator could save ~6 engineer-weeks this quarter.',
      action: 'View dependency overlap',
      link: '/intelligence/dependencies',
    },
    {
      icon: Users,
      tone: 'bg-info-bg text-info',
      title: 'Hiring pulse',
      detail: '1 open senior AI engineer role, 2 active interviews. Workbench beta date is at risk if filled later than Q3.',
      action: 'Open hiring tracker',
      link: '#',
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange} width="w-[480px]">
      <SheetHeader title="Chief of Staff" onClose={() => onOpenChange(false)}>
        <p className="text-2xs text-ink-muted mt-0.5">Your AI portfolio operator</p>
      </SheetHeader>

      <SheetBody className="px-4 py-4">
        <div className="rounded-md bg-gradient-to-br from-brand-50 to-brand-100/40 border border-brand-100 p-4 mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={14} className="text-brand" />
            <span className="text-xs font-semibold text-brand-900">Daily Briefing</span>
            <Badge tone="bg-brand text-white" size="xs">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Badge>
          </div>
          <p className="text-sm text-ink leading-relaxed">
            Good morning, Viral. Your weighted pipeline is <span className="font-semibold num">{fmtCurrency(pipelineValue, { compact: true })}</span>.
            {' '}I&apos;ve flagged <span className="font-semibold">{briefings.filter(b => b.tone.includes('crit')).length} items</span> that need your attention today.
          </p>
        </div>

        <div className="mb-5">
          <div className="text-2xs uppercase tracking-widest text-ink-muted font-semibold mb-2">Attention</div>
          <ul className="space-y-2">
            {briefings.map((b, i) => {
              const Icon = b.icon;
              return (
                <li key={i} className="border border-line rounded-sm p-3 hover:border-ink-subtle transition-colors">
                  <div className="flex items-start gap-2.5">
                    <div className={`h-7 w-7 rounded-sm flex items-center justify-center shrink-0 ${b.tone}`}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink leading-tight">{b.title}</p>
                      <p className="text-xs text-ink-muted mt-1 leading-relaxed">{b.detail}</p>
                      <a href={b.link} className="inline-flex items-center gap-0.5 text-xs text-brand-700 hover:text-brand-900 mt-1.5 font-medium">
                        {b.action} <ArrowUpRight size={11} />
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <div className="text-2xs uppercase tracking-widest text-ink-muted font-semibold mb-2">Try asking</div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => setDraft(p)}
                className="text-xs px-2.5 py-1 rounded-full border border-line hover:border-brand hover:bg-brand-50 hover:text-brand-800 text-ink-soft transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </SheetBody>

      <div className="border-t border-line p-3 bg-paper-sunken/40">
        <div className="relative">
          <textarea
            value={draft}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value)}
            placeholder="Ask anything about the portfolio…"
            rows={2}
            className="w-full text-sm bg-paper-raised border border-line rounded-sm px-3 py-2 pr-10 resize-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-100 placeholder:text-ink-subtle"
          />
          <button
            className="absolute right-2 bottom-2 h-7 w-7 rounded-sm bg-brand text-white hover:bg-brand-800 disabled:bg-line-strong flex items-center justify-center"
            disabled={!draft.trim()}
          >
            <Send size={13} />
          </button>
        </div>
        <p className="text-2xs text-ink-muted mt-1.5">
          Powered by mock provider. Swap to OpenAI/Anthropic/OCI in <code className="font-mono text-2xs">src/lib/ai-extraction.ts</code>.
        </p>
      </div>
    </Sheet>
  );
}
