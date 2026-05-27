import { useMemo } from 'react';
import { useProjects, useLookups } from '@/lib/hooks';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { PageHeader } from '@/components/shared/PageHeader';
import { RagDot } from '@/components/shared/Badges';
import { cn } from '@/lib/utils';

export default function Timeline() {
  const { data: projects = [], isLoading } = useProjects();
  const { resourceById } = useLookups();

  const { axisStart, axisEnd, totalDays, monthMarkers } = useMemo(() => {
    if (!projects.length) return { axisStart: new Date(), axisEnd: new Date(), totalDays: 1, monthMarkers: [] };
    const starts = (projects as any[]).map((p: any) => new Date(p.startDate).getTime());
    const ends = (projects as any[]).map((p: any) => new Date(p.endDate).getTime());
    const axisStart = new Date(Math.min(...starts));
    const axisEnd = new Date(Math.max(...ends));
    const totalDays = Math.max(1, (axisEnd.getTime() - axisStart.getTime()) / 86400000);
    const markers: { date: Date; pct: number }[] = [];
    const cursor = new Date(axisStart.getFullYear(), axisStart.getMonth(), 1);
    while (cursor <= axisEnd) {
      markers.push({ date: new Date(cursor), pct: ((cursor.getTime() - axisStart.getTime()) / 86400000 / totalDays) * 100 });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return { axisStart, axisEnd, totalDays, monthMarkers: markers };
  }, [projects]);

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading timeline…</div>;

  function barPos(p: any) {
    const s = new Date(p.startDate).getTime();
    const e = new Date(p.endDate).getTime();
    const left = ((s - axisStart.getTime()) / 86400000 / totalDays) * 100;
    const width = Math.max(0.5, ((e - s) / 86400000 / totalDays) * 100);
    return { left: `${left}%`, width: `${width}%` };
  }

  const RAG_BAR: Record<string, string> = { green: 'bg-ok', yellow: 'bg-amber-400', orange: 'bg-amber-600', red: 'bg-crit' };

  return (
    <div>
      <PageHeader eyebrow="Delivery" title="Project Timeline" subtitle="Gantt view across all active projects. Bars are proportional to project duration." />
      <div className="p-6">
        <Card>
          <CardHeader><CardTitle>Portfolio Gantt</CardTitle></CardHeader>
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Month axis */}
              <div className="relative h-8 border-b border-line mx-4">
                {monthMarkers.map((m, i) => (
                  <span key={i} className="absolute top-2 text-2xs text-ink-muted" style={{ left: `${m.pct}%` }}>
                    {m.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  </span>
                ))}
              </div>
              {/* Rows */}
              <div className="divide-y divide-line">
                {(projects as any[]).map((p: any) => {
                  const owner = resourceById(p.ownerId);
                  const { left, width } = barPos(p);
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-2 hover:bg-paper-sunken/30">
                      <div className="w-40 shrink-0 flex items-center gap-2 min-w-0">
                        <RagDot rag={p.rag} />
                        <span className="text-xs font-medium text-ink truncate">{p.code}</span>
                      </div>
                      <div className="flex-1 relative h-6">
                        <div className={cn('absolute h-5 rounded top-0.5 opacity-80', RAG_BAR[p.rag] ?? 'bg-brand')} style={{ left, width }} />
                      </div>
                      {owner && <Avatar initials={(owner as any).initials} size="xs" className="shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
