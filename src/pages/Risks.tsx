import { useState } from 'react';
import { Plus, AlertTriangle, AlertCircle } from 'lucide-react';
import { Fragment } from 'react';
import { useRisks, useIssues, useLookups, useResources, useProjects, useCreateRisk } from '@/lib/hooks';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
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

const EMPTY = { title: '', severity: 'medium', likelihood: 'medium', status: 'open', description: '', mitigation: '', projectId: '', ownerId: '' };

export default function Risks() {
  const { data: risks = [], isLoading } = useRisks();
  const { data: issues = [] } = useIssues();
  const { resourceById, productById, projectById, opportunityById } = useLookups();
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
    setSaving(true); setError('');
    try {
      await createRisk.mutateAsync({
        title: form.title.trim(),
        severity: form.severity,
        likelihood: form.likelihood,
        status: form.status,
        description: form.description.trim() || null,
        mitigation: form.mitigation.trim() || null,
        projectId: form.projectId || null,
        ownerId: form.ownerId || null,
      });
      setOpen(false);
      setForm({ ...EMPTY });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to log risk.');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading risks…</div>;

  const criticalRisks = (risks as any[]).filter(r => r.severity === 'critical' || r.severity === 'high');

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Risk & Issues"
        subtitle={`${risks.length} risks tracked. ${criticalRisks.length} critical or high. ${issues.length} active issues.`}
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
                      <th className="text-right pr-3 py-1 text-ink-muted font-normal w-20">Impact →<br/>Likelihood ↓</th>
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
                        {r.mitigation && <p className="text-xs text-ok">Mitigation: {r.mitigation}</p>}
                        <div className="flex items-center gap-3 mt-2 text-2xs text-ink-muted">
                          {owner && <span className="flex items-center gap-1"><Avatar initials={(own