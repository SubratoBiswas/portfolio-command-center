import { useState } from 'react';
import { Plus, AlertTriangle, AlertCircle } from 'lucide-react';
import { useRisks, useIssues, useLookups, useResources, useProjects, useCreateRisk } from '@/lib/hooks';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Field, FormRow } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { SeverityBadge } from '@/components/shared/Badges';
import { fmtRelative, cn } from '@/lib/utils';
import type { Severity } from '@/lib/types';

const likelihoodToNum = (l: 'low' | 'medium' | 'high' | number): number =>
  typeof l === 'number' ? l : l === 'high' ? 0.8 : l === 'medium' ? 0.5 : 0.2;
const severityToImpact = (s: Severity): number =>
  s === 'critical' ? 5 : s === 'high' ? 4 : s === 'medium' ? 3 : 2;

const issueStatusTone: Record<string, string> = {
  open: 'bg-crit-bg text-crit', in_progress: 'bg-amber-100 text-amber-800',
  resolved: 'bg-ok-bg text-ok', closed: 'bg-line-subtle text-ink-muted',
};

const MATRIX_ROWS = [5, 4, 3, 2, 1];
const MATRIX_COLS = [1, 2, 3, 4, 5];

function matrixCell(impact: number, likelihood: number) {
  const score = impact * likelihood;
  if (score >= 16) return 'bg-crit/20 border-crit/40';
  if (score >= 9) return 'bg-amber-100 border-amber-300';
  if (score >= 4) return 'bg-amber-50 border-amber-200';
  return 'bg-ok-bg/40 border-ok/30';
}

const EMPTY = {
  title: '', severity: 'medium', likelihood: 'medium', impact: '3',
  status: 'open', description: '', mitigation: '', projectId: '', ownerId: '',
};

export default function Risks() {
  const { data: risks = [], isLoading } = useRisks();
  const { data: issues = [] } = useIssues();
  const { resourceById, productById, projectById } = useLookups();
  const { data: resources = [] } = useResources();
  const { data: projects = [] } = useProjects();
  const createRisk = useCreateRisk();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Risk title is required.'); return; }
    if (!form.ownerId) { setError('Owner is required.'); return; }
    setSaving(true); setError('');
    try {
      await createRisk.mutateAsync({
        title: form.title.trim(),
        severity: form.severity,
        likelihood: likelihoodToNum(form.likelihood as any),
        impact: Number(form.impact),
        status: form.status,
        description: form.description.trim() || '',
        mitigation: form.mitigation.trim() || null,
        projectId: form.projectId || null,
        ownerId: form.ownerId,
      });
      setOpen(false);
      setForm({ ...EMPTY });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to log risk.');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading risks...</div>;

  const criticalRisks = (risks as any[]).filter(r => r.severity === 'critical' || r.severity === 'high');

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Risk and Issues"
        subtitle={risks.length + ' risks tracked. ' + criticalRisks.length + ' critical or high. ' + issues.length + ' active issues.'}
        actions={<Button variant="primary" onClick={() => setOpen(true)}><Plus size={13} /> Log risk</Button>}
      />
      <Tabs defaultValue="heatmap" className="p-6 space-y-4">
        <TabsList>
          <TabsTrigger value="heatmap">Risk Matrix</TabsTrigger>
          <TabsTrigger value="list">Risk List</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>
        <TabsContent value="heatmap">
          <Card>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="text-right pr-3 py-1 text-ink-muted font-normal w-20">Impact<br/>Likelihood</th>
                      {MATRIX_COLS.map(c => <th key={c} className="text-center py-1 text-2xs font-medium text-ink-muted w-20">{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {MATRIX_ROWS.map(row => (
                      <tr key={row}>
                        <td className="text-right pr-3 py-1 text-2xs font-medium text-ink-muted">{row}</td>
                        {MATRIX_COLS.map(col => {
                          const cellRisks = (risks as any[]).filter(r => {
                            const li = Math.round(likelihoodToNum(r.likelihood) * 5);
                            const im = r.impact ?? severityToImpact(r.severity);
                            return li === row && im === col;
                          });
                          return (
                            <td key={col} className={cn('border p-1 align-top min-h-[60px] w-20', matrixCell(col, row))}>
                              {cellRisks.map((r: any) => (
                                <div key={r.id} title={r.title} className="text-2xs bg-white/80 rounded px-1 py-0.5 mb-0.5 truncate">{r.title}</div>
                              ))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </TabsContent>
        <TabsContent value="list">
          <Card>
            <ul className="divide-y divide-line">
              {(risks as any[]).map(r => {
                const owner = resourceById(r.ownerId);
                const product = r.productId ? productById(r.productId) : null;
                const project = r.projectId ? projectById(r.projectId) : null;
                return (
                  <li key={r.id} className="px-5 py-4 hover:bg-paper-sunken/40">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={14} className={cn('mt-0.5 shrink-0', r.severity === 'critical' ? 'text-crit' : r.severity === 'high' ? 'text-amber-600' : 'text-ink-muted')} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-medium text-ink">{r.title}</span>
                          <SeverityBadge severity={r.severity} />
                          {product && <Badge className="bg-brand-100 text-brand-800">{(product as any).shortName}</Badge>}
                          {project && <Badge className="bg-info-bg text-info">{(project as any).code}</Badge>}
                          <Badge className="bg-line-subtle text-ink-muted">{r.status}</Badge>
                        </div>
                        <p className="text-xs text-ink-muted mb-2">{r.description}</p>
                        {r.mitigation && <p className="text-xs text-ok">{'Mitigation: ' + r.mitigation}</p>}
                        <div className="flex items-center gap-3 mt-2 text-2xs text-ink-muted">
                          {owner && <span className="flex items-center gap-1"><Avatar initials={(owner as any).initials} size="xs" />{(owner as any).name}</span>}
                          {r.identifiedAt && <span>{fmtRelative(r.identifiedAt)}</span>}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </TabsContent>
        <TabsContent value="issues">
          <Card>
            <ul className="divide-y divide-line">
              {(issues as any[]).map((issue: any) => (
                <li key={issue.id} className="px-5 py-4 hover:bg-paper-sunken/40">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={14} className="mt-0.5 shrink-0 text-crit" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-ink">{issue.title}</span>
                        <Badge className={issueStatusTone[issue.status] ?? 'bg-line-subtle text-ink-muted'}>{issue.status}</Badge>
                        <SeverityBadge severity={issue.severity} />
                      </div>
                      <p className="text-xs text-ink-muted">{issue.description}</p>
                      {issue.resolution && <p className="text-xs text-ok mt-1">{'Resolution: ' + issue.resolution}</p>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader title="Log risk" onClose={() => setOpen(false)} />
          <DialogBody className="space-y-3">
            <Field label="Risk title" required>
              <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Key person dependency on AI lead" required />
            </Field>
            <FormRow>
              <Field label="Severity">
                <Select value={form.severity} onChange={e => set('severity', e.target.value)} className="w-full">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </Field>
              <Field label="Likelihood">
                <Select value={form.likelihood} onChange={e => set('likelihood', e.target.value)} className="w-full">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Impact" hint="1 (minor) to 5 (catastrophic)">
                <Select value={form.impact} onChange={e => set('impact', e.target.value)} className="w-full">
                  <option value="1">1 — Minor</option>
                  <option value="2">2 — Moderate</option>
                  <option value="3">3 — Significant</option>
                  <option value="4">4 — Major</option>
                  <option value="5">5 — Catastrophic</option>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={e => set('status', e.target.value)} className="w-full">
                  <option value="open">Open</option>
                  <option value="mitigating">Mitigating</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="closed">Closed</option>
                </Select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Project (optional)">
                <Select value={form.projectId} onChange={e => set('projectId', e.target.value)} className="w-full">
                  <option value="">-- none --</option>
                  {(projects as any[]).map((p: any) => <option key={p.id} value={p.id}>{p.code}</option>)}
                </Select>
              </Field>
              <Field label="Owner" required>
                <Select value={form.ownerId} onChange={e => set('ownerId', e.target.value)} className="w-full" required>
                  <option value="">-- select owner --</option>
                  {(resources as any[]).map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </Field>
            </FormRow>
            <Field label="Description" hint="What is the risk and potential impact?">
              <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Describe the risk and its potential impact..." />
            </Field>
            <Field label="Mitigation plan">
              <Textarea value={form.mitigation} onChange={e => set('mitigation', e.target.value)} rows={2} placeholder="How will this risk be mitigated or managed?" />
            </Field>
            {error && <p className="text-xs text-crit bg-crit-bg border border-crit/20 rounded px-3 py-2">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Logging...' : 'Log risk'}</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
