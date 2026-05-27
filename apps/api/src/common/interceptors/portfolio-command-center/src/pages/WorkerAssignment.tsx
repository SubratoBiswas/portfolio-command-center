import { useResources, useAllocations, useProducts, useProjects } from '@/lib/hooks';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { PageHeader } from '@/components/shared/PageHeader';
import { sumBy, cn } from '@/lib/utils';

export default function WorkerAssignment() {
  const { data: resources = [], isLoading } = useResources();
  const { data: allocations = [] } = useAllocations();
  const { data: products = [] } = useProducts();
  const { data: projects = [] } = useProjects();

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading…</div>;

  type ColEntry = { id: string; name: string; type: 'product' | 'project' };
  const productCols: ColEntry[] = (products as any[]).map(p => ({ id: p.id, name: p.shortName, type: 'product' as const }));
  const projectCols: ColEntry[] = (projects as any[]).map(p => ({ id: p.id, name: p.code, type: 'project' as const }));
  const cols: ColEntry[] = [...productCols, ...projectCols];

  function hours(resourceId: string, col: ColEntry): number {
    return sumBy(
      (allocations as any[]).filter(a => a.resourceId === resourceId && (col.type === 'product' ? a.productId === col.id : a.projectId === col.id)),
      a => a.hoursPerWeek,
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Resources" title="Assignment Matrix" subtitle="Who works on what. Cells show committed hours per week. Columns: products → projects." />
      <div className="p-6">
        <Card>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-xs">
              <thead className="bg-paper-sunken/40">
                <tr>
                  <th className="text-left px-3 py-2 text-2xs uppercase tracking-wider text-ink-muted font-medium sticky left-0 bg-paper-sunken/40 min-w-[140px]">Resource</th>
                  {productCols.map(c => <th key={c.id} className="px-2 py-2 text-2xs font-medium text-brand-700 text-center whitespace-nowrap">{c.name}</th>)}
                  <th className="px-2 py-2 text-2xs font-medium text-line-subtle text-center">|</th>
                  {projectCols.map(c => <th key={c.id} className="px-2 py-2 text-2xs font-medium text-info text-center whitespace-nowrap">{c.name}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {(resources as any[]).map(r => {
                  const total = sumBy(cols, c => hours(r.id, c));
                  return (
                    <tr key={r.id} className="hover:bg-paper-sunken/30">
                      <td className="px-3 py-2 sticky left-0 bg-paper">
                        <div className="flex items-center gap-2">
                          <Avatar initials={r.initials} size="xs" />
                          <div>
                            <p className="font-medium text-ink">{r.name}</p>
                            <p className="text-2xs text-ink-muted">{r.role}</p>
                          </div>
                        </div>
                      </td>
                      {productCols.map(c => { const h = hours(r.id, c); return <td key={c.id} className={cn('px-2 py-2 text-center', h ? 'text-brand-800 font-medium' : 'text-ink-muted/30')}>{h || '—'}</td>; })}
                      <td className="px-2 py-2 text-center text-line">|</td>
                      {projectCols.map(c => { const h = hours(r.id, c); return <td key={c.id} className={cn('px-2 py-2 text-center', h ? 'text-info font-medium' : 'text-ink-muted/30')}>{h || '—'}</td>; })}
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
