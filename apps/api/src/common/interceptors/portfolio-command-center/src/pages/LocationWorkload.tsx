import { MapPin } from 'lucide-react';
import { useLocations, useResources, useAllocations } from '@/lib/hooks';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/shared/PageHeader';
import { sumBy, fmtPct, cn } from '@/lib/utils';

export default function LocationWorkload() {
  const { data: locations = [], isLoading: locLoad } = useLocations();
  const { data: resources = [] } = useResources();
  const { data: allocations = [] } = useAllocations();

  if (locLoad) return <div className="p-8 text-sm text-ink-muted">Loading…</div>;

  const data = (locations as any[]).map(loc => {
    const locResources = (resources as any[]).filter(r => r.locationId === loc.id);
    const totalCap = sumBy(locResources, r => r.weeklyCapacityHours);
    const totalAlloc = sumBy(
      (allocations as any[]).filter(a => locResources.some(r => r.id === a.resourceId)),
      a => a.hoursPerWeek,
    );
    const pct = totalCap ? (totalAlloc / totalCap) * 100 : 0;
    return { loc, resources: locResources, totalCap, totalAlloc, pct };
  });

  return (
    <div>
      <PageHeader eyebrow="Resources" title="Location & Workload" subtitle="Capacity, demand, and utilization rolled up by site. Spot regional imbalances." />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.map(({ loc, resources: locRes, totalCap, totalAlloc, pct }) => (
          <Card key={loc.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <MapPin size={13} className="text-brand-700" />
                {loc.name}
                <Badge className="ml-auto bg-line-subtle text-ink-muted">{loc.region}</Badge>
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">{totalAlloc}h / {totalCap}h</span>
                <span className={cn('font-medium', pct > 90 ? 'text-crit' : pct > 75 ? 'text-amber-700' : 'text-ok')}>{fmtPct(pct)}</span>
              </div>
              <Progress value={pct} className="h-1.5" />
              <div className="flex flex-wrap gap-1 pt-1">
                {locRes.map((r: any) => <Avatar key={r.id} initials={r.initials} size="xs" title={r.name} />)}
                {locRes.length === 0 && <span className="text-2xs text-ink-muted">No resources</span>}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
