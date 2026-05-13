import { Link } from 'react-router-dom';
import { Plus, Boxes, ArrowUpRight } from 'lucide-react';
import { useProducts, useLookups } from '@/lib/hooks';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';

const maturityTone: Record<string, string> = {
  concept: 'bg-line-subtle text-ink-muted', mvp: 'bg-info-bg text-info',
  beta: 'bg-amber-100 text-amber-800', ga: 'bg-ok-bg text-ok', mature: 'bg-brand-100 text-brand-800',
};

export default function Products() {
  const { data: products = [], isLoading } = useProducts();
  const { resourceById, capabilityById } = useLookups();

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading products…</div>;

  return (
    <div>
      <PageHeader
        eyebrow="Library"
        title="Products"
        subtitle={`${products.length} products across ${new Set((products as any[]).map((p: any) => p.strategicBucket)).size} strategic buckets.`}
        actions={<Button variant="primary"><Plus size={13} /> New product</Button>}
      />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(products as any[]).map((p: any) => {
          const owner = resourceById(p.ownerId);
          return (
            <CardBody key={p.id} className="hover:shadow-md transition-shadow space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Boxes size={14} className="text-brand-700 shrink-0 mt-0.5" />
                  <Link to={`/products/${p.id}`} className="text-sm font-semibold text-ink hover:text-brand-700">{p.name}</Link>
                </div>
                <Badge className={maturityTone[p.maturity] ?? 'bg-line-subtle text-ink-muted'}>{p.maturity}</Badge>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">{p.vision}</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-2xs text-ink-muted">
                  <span>AI Readiness</span><span>{p.aiReadiness}%</span>
                </div>
                <Progress value={p.aiReadiness} className="h-1" />
                <div className="flex justify-between text-2xs text-ink-muted">
                  <span>Delivery Readiness</span><span>{p.deliveryReadiness}%</span>
                </div>
                <Progress value={p.deliveryReadiness} className="h-1" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  {owner && <Avatar initials={(owner as any).initials} size="xs" title={(owner as any).name} />}
                  <span className="text-2xs text-ink-muted">{p.strategicBucket}</span>
                </div>
                <Link to={`/products/${p.id}`} className="text-brand-700 hover:text-brand-900">
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </CardBody>
          );
        })}
      </div>
    </div>
  );
}
