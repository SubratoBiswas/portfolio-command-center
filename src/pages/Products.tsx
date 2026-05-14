import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Boxes, ArrowUpRight } from 'lucide-react';
import { useProducts, useLookups, useResources, useCreateProduct } from '@/lib/hooks';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Field, FormRow } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';

const maturityTone: Record<string, string> = {
  concept: 'bg-line-subtle text-ink-muted', mvp: 'bg-info-bg text-info',
  beta: 'bg-amber-100 text-amber-800', ga: 'bg-ok-bg text-ok', mature: 'bg-brand-100 text-brand-800',
};

const EMPTY = {
  name: '', shortName: '', strategicBucket: '', maturity: 'concept',
  vision: '', problem: '', targetUsers: '', architectureStatus: 'draft', ownerId: '',
};

export default function Products() {
  const { data: products = [], isLoading } = useProducts();
  const { resourceById } = useLookups();
  const { data: resources = [] } = useResources();
  const createProduct = useCreateProduct();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Product name is required.'); return; }
    setSaving(true); setError('');
    try {
      await createProduct.mutateAsync({
        name: form.name.trim(),
        shortName: form.shortName.trim() || form.name.trim().slice(0, 10),
        strategicBucket: form.strategicBucket.trim() || 'General',
        maturity: form.maturity,
        vision: form.vision.trim() || '',
        problem: form.problem.trim() || '',
        targetUsers: form.targetUsers.trim() || '',
        architectureStatus: form.architectureStatus,
        ownerId: form.ownerId || null,
      });
      setOpen(false);
      setForm({ ...EMPTY });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create product.');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading products...</div>;

  return (
    <div>
      <PageHeader
        eyebrow="Library"
        title="Products"
        subtitle={products.length + ' products across ' + new Set((products as any[]).map((p: any) => p.strategicBucket)).size + ' strategic buckets.'}
        actions={<Button variant="primary" onClick={() => setOpen(true)}><Plus size={13} /> New product</Button>}
      />

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(products as any[]).map((p: any) => {
          const owner = resourceById(p.ownerId);
          const productPath = '/products/' + p.id;
          return (
            <CardBody key={p.id} className="hover:shadow-md transition-shadow space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Boxes size={14} className="text-brand-700 shrink-0 mt-0.5" />
                  <Link to={productPath} className="text-sm font-semibold text-ink hover:text-brand-700">{p.name}</Link>
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
                <Link to={productPath} className="text-brand-700 hover:text-brand-900">
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </CardBody>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit}>
          <DialogHeader title="New product" onClose={() => setOpen(false)} />
          <DialogBody className="space-y-3">
            <FormRow>
              <Field label="Product name" required>
                <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. AI Data Platform" required />
              </Field>
              <Field label="Short name" hint="Max ~10 chars">
                <Input value={form.shortName} onChange={e => set('shortName', e.target.value)} placeholder="e.g. ADP" maxLength={15} />
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Strategic bucket">
                <Input value={form.strategicBucket} onChange={e => set('strategicBucket', e.target.value)} placeholder="e.g. Data and AI" />
              </Field>
              <Field label="Maturity">
                <Select value={form.maturity} onChange={e => set('maturity', e.target.value)} className="w-full">
                  <option value="concept">Concept</option>
                  <option value="mvp">MVP</option>
                  <option value="beta">Beta</option>
                  <option value="ga">GA</option>
                  <option value="mature">Mature</option>
                </Select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Architecture status">
                <Select value={form.architectureStatus} onChange={e => set('architectureStatus', e.target.value)} className="w-full">
                  <option value="draft">Draft</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="approved">Approved</option>
                  <option value="implemented">Implemented</option>
                </Select>
              </Field>
              <Field label="Owner">
                <Select value={form.ownerId} onChange={e => set('ownerId', e.target.value)} className="w-full">
                  <option value="">-- none --</option>
                  {(resources as any[]).map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </Field>
            </FormRow>
            <Field label="Problem statement">
              <Textarea value={form.problem} onChange={e => set('problem', e.target.value)} rows={2} placeholder="What problem does this product solve?" />
            </Field>
            <Field label="Target users">
              <Input value={form.targetUsers} onChange={e => set('targetUsers', e.target.value)} placeholder="e.g. Data engineers, business analysts" />
            </Field>
            <Field label="Vision / description">
              <Textarea value={form.vision} onChange={e => set('vision', e.target.value)} rows={2} placeholder="Describe the product vision and target outcomes..." />
            </Field>
            {error && <p className="text-xs text-crit bg-crit-bg border border-crit/20 rounded px-3 py-2">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Creating...' : 'Create product'}</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
