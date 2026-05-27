import { useMemo, useState } from 'react';
import { AlertTriangle, Users, TrendingUp, Filter } from 'lucide-react';
import { useResources, useAllocations, useLocations } from '@/lib/hooks';
import { makeLookup } from '@/lib/hooks';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Select } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/shared/PageHeader';
import { fmtPct, sumBy, utilizationRag, ragColor, weeksFromNow, cn } from '@/lib/utils';

export default function ResourceCapacity() {
  const [region, setRegion] = useState<string>('all');
  const { data: resources = [], isLoading } = useResources();
  const { data: allocations = [] } = useAllocations();
  const { data: locations = [] } = useLocations();
  const locationById = makeLookup(locations as any[]);

  const weeks = useMemo(() => weeksFromNow(12), []);

  const filteredResources = (resources as any[]).filter(r => {
    if (region === 'all') return true;
    const loc = locationById(r.locationId);
    return (loc as any)?.region === region;
  });

  function utilForResourceWeek(resourceId: string, weekISO: string): number {
    const weekStart = new Date(weekISO);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const allocated = (allocations as any[])
      .filter(a => a.resourceId === resourceId)
      .filter(a => {
        const s = new Date(a.startDate); const e = new Date(a.endDate);
        return s <= weekEnd && e >= weekStart;
      })
      .reduce((sum: number, a: any) => sum + a.hoursPerWeek, 0);
    return allocated;
  }

  const RAG_BG: Record<string, string> = {
    green: 'bg-ok/20 text-ok', yellow: 'bg-amber-100 text-amber-800',
    orange: 'bg-amber-200 text-amber-900', red: 'bg-crit/20 text-crit',
  };

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading capacity…</div>;

  const regions = [...new Set((locations as any[]).map((l: any) => l.region))];

  const overloaded = filteredResources.filter(r => {
    const cap = r.weeklyCapacityHours - (r.timeOffHours ?? 0);
    const alloc = sumBy((allocations as any[]).filter(a => a.resourceId === r.id), a => a.hoursPerWeek);
    return cap > 0 && alloc / cap > 1;
  });
  const bench = filteredResources.filter(r => {
    const alloc = sumBy((allocations as any[]).filter(a => a.resourceId === r.id), a => a.hoursPerWeek);
    return alloc === 0;
  });

  return (
    <div>
      <PageHeader
        eyebrow="Resources"
        title="Capacity & Utilization"
        subtitle={`${filteredResources.length} resources · ${overloaded.length} over-allocated · ${bench.length} on bench`}
        actions={
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-ink-muted" />
            <Select value={region} onChange={e => setRegion(e.target.value)} className="text-xs w-28">
              <option value="all">All regions</option>
              {regions.map(r => <option key={r as string} value={r as string}>{r as string}</option>)}
            </Select>
          </div>
        }
      />

      {/* Summary cards */}
      <div className="px-6 pt-4 grid grid-cols-3 gap-4">
        {[
          { label: 'Over-allocated', count: overloaded.length, icon: AlertTriangle, tone: 'text-crit' },
          { label: 'Healthy', count: filteredResources.length - overloaded.length - bench.length, icon: TrendingUp, tone: 'text-ok' },
          { label: 'On bench', count: bench.length, icon: Users, tone: 'text-ink-muted' },
        ].map(s => (
          <Card key={s.label}>
            <CardBody className="flex items-center gap-3 py-3">
              <s.icon size={18} className={s.tone} />
              <div><p className="text-lg font-bold text-ink">{s.count}</p><p className="text-xs text-ink-muted">{s.label}</p></div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* 12-week heatmap */}
      <div className="p-6">
        <Card>
          <CardHeader><CardTitle>12-Week Utilization Heatmap</CardTitle></CardHeader>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left px-3 py-2 text-2xs font-medium text-ink-muted sticky left-0 bg-paper min-w-[140px]">Resource</th>
                  {weeks.map(w => (
                    <th key={w} className="px-1 py-2 text-2xs font-medium text-ink-muted text-center whitespace-nowrap min-w-[52px]">
                      {new Date(w).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredResources.map(r => {
                  const cap = r.weeklyCapacityHours - (r.timeOffHours ?? 0);
                  return (
                    <tr key={r.id} className="hover:bg-paper-sunken/20">
                      <td className="px-3 py-1.5 sticky left-0 bg-paper">
                        <div className="flex items-center gap-2">
                          <Avatar initials={r.initials} size="xs" />
                          <div><p className="font-medium text-ink">{r.name}</p><p className="text-2xs text-ink-muted">{r.role}</p></div>
                        </div>
                      </td>
                      {weeks.map(w => {
                        const alloc = utilForResourceWeek(r.id, w);
                        const pct = cap > 0 ? (alloc / cap) * 100 : 0;
                        const rag = utilizationRag(pct);
                        return (
                          <td key={w} className="px-1 py-1.5 text-center">
                            <div className={cn('rounded text-2xs py-1 px-1', RAG_BG[rag] ?? 'bg-line-subtle text-ink-muted')}>
                              {pct > 0 ? `${Math.round(pct)}%` : '—'}
                            </div>
                          </td>
                        );
                      })}
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
