import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Boxes, Users, Target, Map, AlertTriangle } from 'lucide-react';
import { useProduct, useOpportunities, useProjects, useRisks, useRoadmapItems, useCapabilities, useResources, useAllocations, useLookups } from '@/lib/hooks';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarStack } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, RagBadge, SeverityBadge } from '@/components/shared/Badges';
import { fmtCurrency, fmtDate, sumBy } from '@/lib/utils';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id!);
  const { data: allOpps = [] } = useOpportunities();
  const { data: allProjects = [] } = useProjects();
  const { data: allRisks = [] } = useRisks();
  const { data: allRoadmap = [] } = useRoadmapItems();
  const { data: allCapabilities = [] } = useCapabilities();
  const { data: resources = [] } = useResources();
  const { data: allocations = [] } = useAllocations();
  const { resourceById } = useLookups();

  if (isLoading) return <div className="p-12 text-center text-sm text-ink-muted">Loading…</div>;
  if (!product) return <div className="p-12 text-center"><p className="text-sm text-ink-muted">Product not found</p><Link to="/products" className="text-xs text-brand-700 hover:text-brand-900 mt-2 inline-block">← Back to products</Link></div>;

  const p = product as any;
  const owner = resourceById(p.ownerId);
  const relatedOpps = (allOpps as any[]).filter(o => o.productId === p.id);
  const relatedProjects = (allProjects as any[]).filter(pr => pr.productId === p.id);
  const relatedRisks = (allRisks as any[]).filter(r => r.productId === p.id);
  const relatedRoadmap = (allRoadmap as any[]).filter(r => r.productId === p.id);
  const productCaps = (allCapabilities as any[]).filter(c => p.capabilityIds?.includes(c.id));
  const teamResources = (resources as any[]).filter(r => (allocations as any[]).some(a => a.resourceId === r.id && a.productId === p.id));

  const maturityTone: Record<string, string> = {
    concept: 'bg-line-subtle text-ink-muted', mvp: 'bg-info-bg text-info',
    beta: 'bg-amber-100 text-amber-800', ga: 'bg-ok-bg text-ok', mature: 'bg-brand-100 text-brand-800',
  };

  return (
    <div>
      <PageHeader
        eyebrow={`Product · ${p.strategicBucket}`}
        title={p.name}
        subtitle={p.vision}
        actions={<Badge className={maturityTone[p.maturity] ?? ''}>{p.maturity}</Badge>}
      />
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap ({relatedRoadmap.length})</TabsTrigger>
              <TabsTrigger value="opportunities">Pipeline ({relatedOpps.length})</TabsTrigger>
              <TabsTrigger value="risks">Risks ({relatedRisks.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card><CardHeader><CardTitle>Problem statement</CardTitle></CardHeader><CardBody><p className="text-sm text-ink-muted">{p.problem}</p></CardBody></Card>
              <Card>
                <CardHeader><CardTitle>Readiness</CardTitle></CardHeader>
                <CardBody className="space-y-3">
                  {[{ label: 'AI Readiness', value: p.aiReadiness }, { label: 'Delivery Readiness', value: p.deliveryReadiness }].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs mb-1"><span className="text-ink-muted">{m.label}</span><span className="font-medium">{m.value}%</span></div>
                      <Progress value={m.value} className="h-1.5" />
                    </div>
                  ))}
                </CardBody>
              </Card>
              {productCaps.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Capabilities</CardTitle></CardHeader>
                  <CardBody className="flex flex-wrap gap-2">
                    {productCaps.map((c: any) => <Badge key={c.id} className="bg-brand-100 text-brand-800">{c.name}</Badge>)}
                  </CardBody>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="roadmap" className="mt-4">
              <Card>
                <ul className="divide-y divide-line">
                  {relatedRoadmap.sort((a: any, b: any) => a.quarter.localeCompare(b.quarter)).map((r: any) => (
                    <li key={r.id} className="px-4 py-3 flex items-center gap-3">
                      <Badge className="bg-line-subtle text-ink-muted text-2xs">{r.quarter}</Badge>
                      <span className="text-xs text-ink flex-1">{r.name}</span>
                      <StatusBadge status={r.status} />
                    </li>
                  ))}
                  {relatedRoadmap.length === 0 && <li className="p-6 text-center text-xs text-ink-muted">No roadmap items</li>}
                </ul>
              </Card>
            </TabsContent>
            <TabsContent value="opportunities" className="mt-4">
              <Card>
                <ul className="divide-y divide-line">
                  {relatedOpps.map((o: any) => (
                    <li key={o.id} className="px-4 py-3 flex items-center gap-3">
                      <Link to={`/opportunities/${o.id}`} className="text-xs font-medium text-ink hover:text-brand-700 flex-1">{o.name}</Link>
                      <Badge>{o.stage}</Badge>
                      <span className="text-xs font-semibold">{fmtCurrency(o.value, { compact: true })}</span>
                    </li>
                  ))}
                  {relatedOpps.length === 0 && <li className="p-6 text-center text-xs text-ink-muted">No pipeline</li>}
                </ul>
              </Card>
            </TabsContent>
            <TabsContent value="risks" className="mt-4">
              <Card>
                <ul className="divide-y divide-line">
                  {relatedRisks.map((r: any) => (
                    <li key={r.id} className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1"><AlertTriangle size={12} className="text-amber-600" /><span className="text-xs font-medium">{r.title}</span><SeverityBadge severity={r.severity} /></div>
                      {r.mitigation && <p className="text-xs text-ink-muted ml-5">{r.mitigation}</p>}
                    </li>
                  ))}
                  {relatedRisks.length === 0 && <li className="p-6 text-center text-xs text-ink-muted">No risks</li>}
                </ul>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-3">
              {owner && <div><p className="text-2xs text-ink-muted mb-1">Owner</p><div className="flex items-center gap-2"><Avatar initials={(owner as any).initials} size="xs" /><span className="text-xs">{(owner as any).name}</span></div></div>}
              <div><p className="text-2xs text-ink-muted mb-1">Pricing model</p><span className="text-xs">{p.pricingModel ?? '—'}</span></div>
              <div><p className="text-2xs text-ink-muted mb-1">Architecture</p><Badge>{p.architectureStatus}</Badge></div>
              <div><p className="text-2xs text-ink-muted mb-1">GTM status</p><Badge>{p.gtmStatus}</Badge></div>
            </CardBody>
          </Card>
          {teamResources.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Team</CardTitle></CardHeader>
              <CardBody>
                <AvatarStack items={teamResources.map((r: any) => r.initials ?? r.name ?? '')} max={8} />
              </CardBody>
            </Card>
          )}
          {relatedProjects.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
              <CardBody className="space-y-2">
                {relatedProjects.map((pr: any) => (
                  <div key={pr.id} className="flex items-center justify-between">
                    <Link to={`/projects/${pr.id}`} className="text-xs text-brand-700 hover:text-brand-900">{pr.code}</Link>
                    <RagBadge rag={pr.rag} />
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
