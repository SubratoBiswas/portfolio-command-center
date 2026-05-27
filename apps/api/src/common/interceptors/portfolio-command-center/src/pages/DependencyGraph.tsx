import { useDependencies, useLookups } from '@/lib/hooks';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';

interface Node { id: string; label: string; type: 'product' | 'project' | 'opportunity' | 'other'; x: number; y: number; }

const kindTone: Record<string, string> = {
  blocks: 'text-crit border-crit',
  depends_on: 'text-amber-700 border-amber-400',
  related_to: 'text-info border-info',
  enables: 'text-ok border-ok',
  requires: 'text-brand-700 border-brand-400',
};

export default function DependencyGraph() {
  const { data: dependencies = [], isLoading } = useDependencies();
  const { productById, projectById, opportunityById } = useLookups();

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading dependencies…</div>;

  function lookup(id: string): { label: string; type: Node['type'] } {
    if (id.startsWith('prd-')) { const p = productById(id); return { label: (p as any)?.shortName ?? id, type: 'product' }; }
    if (id.startsWith('prj-')) { const p = projectById(id); return { label: (p as any)?.code ?? id, type: 'project' }; }
    if (id.startsWith('opp-')) { const o = opportunityById(id); return { label: (o as any)?.name ?? id, type: 'opportunity' }; }
    return { label: id, type: 'other' };
  }

  const typeColor: Record<Node['type'], string> = {
    product: 'bg-brand-100 text-brand-800 border-brand-300',
    project: 'bg-info-bg text-info border-info',
    opportunity: 'bg-amber-100 text-amber-800 border-amber-300',
    other: 'bg-paper-sunken text-ink-muted border-line',
  };

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Dependency Graph"
        subtitle={`${dependencies.length} cross-portfolio dependencies. Edges show directional relationships between products, projects, and opportunities.`}
      />
      <div className="p-6 space-y-3">
        {(dependencies as any[]).map((dep: any) => {
          const from = lookup(dep.fromId);
          const to = lookup(dep.toId);
          return (
            <Card key={dep.id}>
              <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
                <span className={cn('text-xs px-2 py-1 rounded border font-medium', typeColor[from.type])}>{from.label}</span>
                <Badge className={cn('border', kindTone[dep.kind] ?? 'text-ink-muted border-line')}>{dep.kind.replace('_', ' ')}</Badge>
                <span className={cn('text-xs px-2 py-1 rounded border font-medium', typeColor[to.type])}>{to.label}</span>
                {dep.notes && <span className="text-xs text-ink-muted ml-auto">{dep.notes}</span>}
              </div>
            </Card>
          );
        })}
        {dependencies.length === 0 && <p className="text-sm text-ink-muted text-center py-12">No dependencies recorded yet.</p>}
      </div>
    </div>
  );
}
