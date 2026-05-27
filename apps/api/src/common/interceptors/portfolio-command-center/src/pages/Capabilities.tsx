import { Wrench, Layers } from 'lucide-react';
import { useCapabilities, useProducts } from '@/lib/hooks';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';

const maturityTone: Record<string, string> = {
  experimental: 'bg-line-subtle text-ink-muted',
  beta: 'bg-info-bg text-info',
  mature: 'bg-ok-bg text-ok',
  flagship: 'bg-brand-100 text-brand-800',
};
const reuseTone: Record<string, string> = {
  low: 'bg-line-subtle text-ink-muted',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-brand-100 text-brand-800',
  flagship: 'bg-brand text-white',
};

export default function Capabilities() {
  const { data: capabilities = [], isLoading } = useCapabilities();
  const { data: products = [] } = useProducts();

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading capabilities…</div>;

  return (
    <div>
      <PageHeader
        eyebrow="Library"
        title="Capabilities"
        subtitle="Reusable building blocks that power multiple products. Track maturity and reuse to find consolidation opportunities."
      />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(capabilities as any[]).map((cap: any) => {
          const usedIn = products.filter((p: any) => cap.productIds?.includes(p.id));
          return (
            <CardBody key={cap.id} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Wrench size={14} className="text-brand-700 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-ink">{cap.name}</span>
                </div>
                <Badge className={maturityTone[cap.maturity] ?? 'bg-line-subtle text-ink-muted'}>{cap.maturity}</Badge>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">{cap.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={reuseTone[cap.reusePotential] ?? 'bg-line-subtle text-ink-muted'}>
                  Reuse: {cap.reusePotential}
                </Badge>
                <span className="text-2xs text-ink-muted">{cap.category}</span>
              </div>
              {usedIn.length > 0 && (
                <div className="pt-1 border-t border-line">
                  <p className="text-2xs text-ink-muted mb-1 flex items-center gap-1"><Layers size={10} /> Used in</p>
                  <div className="flex flex-wrap gap-1">
                    {usedIn.map((p: any) => (
                      <span key={p.id} className="text-2xs bg-paper-sunken px-1.5 py-0.5 rounded text-ink-muted">{p.shortName}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          );
        })}
      </div>
    </div>
  );
}
