import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Sparkles, Clock, AlertCircle, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { useOpportunity, useLookups } from '@/lib/hooks';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/shared/PageHeader';
import { SeverityBadge } from '@/components/shared/Badges';
import { fmtCurrency, fmtDate, fmtRelative, daysFromNow, cn } from '@/lib/utils';

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: opp, isLoading } = useOpportunity(id!);
  const { clientById, productById, resourceById, capabilityById } = useLookups();

  if (isLoading) return <div className="p-12 text-center text-sm text-ink-muted">Loading…</div>;
  if (!opp) return <div className="p-12 text-center text-sm text-ink-muted">Opportunity not found · <Link to="/opportunities" className="text-brand-700">Back</Link></div>;

  const o = opp as any;
  const client = clientById(o.clientId);
  const product = productById(o.productId);
  const owner = resourceById(o.ownerId);
  const days = daysFromNow(o.expectedCloseDate);
  const lastDays = daysFromNow(o.lastInteractionAt);
  const stale = lastDays <= -10;

  return (
    <div>
      <PageHeader
        eyebrow={`Opportunity · ${(client as any)?.name}`}
        title={o.name}
        subtitle={o.aiNextBestAction ?? `${o.stage} stage opportunity with ${(client as any)?.name}.`}
        actions={<Button variant="primary">Update stage</Button>}
      />
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Deal snapshot</CardTitle></CardHeader>
            <CardBody className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Value', value: fmtCurrency(o.value), icon: DollarSign },
                { label: 'Weighted', value: fmtCurrency(o.value * (o.probability / 100), { compact: true }), icon: TrendingUp },
                { label: 'Close', value: fmtDate(o.expectedCloseDate), icon: Calendar },
                { label: 'Days out', value: `${days}d`, icon: Clock },
              ].map(m => (
                <div key={m.label} className="space-y-1">
                  <p className="text-2xs text-ink-muted flex items-center gap-1"><m.icon size={10} />{m.label}</p>
                  <p className="text-base font-semibold text-ink">{m.value}</p>
                </div>
              ))}
            </CardBody>
          </Card>
          <Card>
            <CardHeader><CardTitle>Win probability</CardTitle></CardHeader>
            <CardBody>
              <div className="flex justify-between text-xs mb-2"><span className="text-ink-muted">Probability</span><span className="font-medium">{o.probability}%</span></div>
              <Progress value={o.probability} />
            </CardBody>
          </Card>
          {o.description && (
            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardBody><p className="text-sm text-ink-muted">{o.description}</p></CardBody>
            </Card>
          )}
          {o.nextSteps && (
            <Card>
              <CardHeader><CardTitle>Next steps</CardTitle></CardHeader>
              <CardBody><p className="text-sm text-ink">{o.nextSteps}</p></CardBody>
            </Card>
          )}
          {(o.blockers?.length > 0 || o.risks?.length > 0) && (
            <Card>
              <CardHeader><CardTitle>Blockers & Risks</CardTitle></CardHeader>
              <CardBody className="space-y-2">
                {o.blockers?.map((b: string, i: number) => <p key={i} className="text-xs text-crit flex items-center gap-1"><AlertCircle size={12} />{b}</p>)}
                {o.risks?.map((r: string, i: number) => <p key={i} className="text-xs text-amber-700 flex items-center gap-1"><AlertCircle size={12} />{r}</p>)}
              </CardBody>
            </Card>
          )}
        </div>
        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-3">
              {client && (
                <div>
                  <p className="text-2xs text-ink-muted mb-1">Client</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded text-white text-xs flex items-center justify-center font-bold" style={{ background: (client as any).logoColor }}>{(client as any).name[0]}</div>
                    <span className="text-sm font-medium">{(client as any).name}</span>
                  </div>
                </div>
              )}
              {owner && (
                <div>
                  <p className="text-2xs text-ink-muted mb-1">Owner</p>
                  <div className="flex items-center gap-2">
                    <Avatar initials={(owner as any).initials} size="xs" />
                    <span className="text-xs">{(owner as any).name}</span>
                  </div>
                </div>
              )}
              {product && <div><p className="text-2xs text-ink-muted mb-1">Product</p><Badge className="bg-brand-100 text-brand-800">{(product as any).shortName}</Badge></div>}
              <div><p className="text-2xs text-ink-muted mb-1">Stage</p><Badge>{o.stage}</Badge></div>
              <div><p className="text-2xs text-ink-muted mb-1">Strategic importance</p><SeverityBadge severity={o.strategicImportance} /></div>
              {stale && <p className="text-xs text-amber-700 flex items-center gap-1"><Clock size={12} />Last contact {fmtRelative(o.lastInteractionAt)} — stale!</p>}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
