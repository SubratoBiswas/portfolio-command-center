import { Plus, Gavel } from 'lucide-react';
import { useDecisions, useLookups } from '@/lib/hooks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { fmtDate, fmtRelative } from '@/lib/utils';

const statusTone: Record<string, string> = {
  decided: 'bg-ok-bg text-ok',
  pending: 'bg-amber-100 text-amber-800',
  overturned: 'bg-crit-bg text-crit',
};

export default function Decisions() {
  const { data: decisions = [], isLoading } = useDecisions();
  const { resourceById, productById, projectById } = useLookups();

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading decisions…</div>;

  const sorted = [...(decisions as any[])].sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime());

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Decision Log"
        subtitle={`${decisions.length} decisions captured. ${(decisions as any[]).filter((d: any) => d.status === 'pending').length} pending review.`}
        actions={<Button variant="primary"><Plus size={13} /> New decision</Button>}
      />
      <div className="p-6">
        <Card>
          <ul className="divide-y divide-line">
            {sorted.map((d: any) => {
              const by = resourceById(d.decidedBy);
              const product = d.productId ? productById(d.productId) : null;
              const project = d.projectId ? projectById(d.projectId) : null;
              return (
                <li key={d.id} className="px-5 py-4 hover:bg-paper-sunken/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                      <Gavel size={12} className="text-brand-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-ink">{d.title}</span>
                        <Badge className={statusTone[d.status] ?? 'bg-line-subtle text-ink-muted'}>{d.status}</Badge>
                        {product && <Badge className="bg-brand-100 text-brand-800">{(product as any).shortName}</Badge>}
                        {project && <Badge className="bg-info-bg text-info">{(project as any).code}</Badge>}
                      </div>
                      <p className="text-xs text-ink-muted mb-2">{d.decision}</p>
                      {d.rationale && <p className="text-xs text-ink-muted italic">{d.rationale}</p>}
                      <div className="flex items-center gap-3 mt-2 text-2xs text-ink-muted">
                        {by && <span className="flex items-center gap-1"><Avatar initials={(by as any).initials} size="xs" />{(by as any).name}</span>}
                        <span>Decided {fmtDate(d.decidedAt)}</span>
                        <span>{fmtRelative(d.decidedAt)}</span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
