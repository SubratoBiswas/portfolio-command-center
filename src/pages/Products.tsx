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

const EMPTY = { name: '', shortName: '', strategicBucket: '', maturity: 'concept', vision: '', ownerId: '' };

export default function Products() {
  const { data: products = [], isLoading } = useProducts();
  const { resourceById, capabilityById } = useLookups();
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
        vision: form.vision.trim() || null,
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

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading products…</div>;

  return (
    <div>
      <PageHeader
        eyebrow="Library"
        title="Products"
        subtitle={`${products.length} products across ${new Set((products as any[]).map((p: any) => p.strategicBucket)).size} strategic buckets.`}
        actions={<Button variant="primary" onClick={() => setOpen(true)}><Plus size={13} /> New product</Button>}
      />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(products as any[]).map((p: any) => {
          const owner = resourceById(p.ownerId);
          return (
            <CardBody key={p.id} className="hover:shadow-md transition-shadow space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Boxes size={14} className="text-brand-700 shrink-0 mt-0.5" />
                  <Link to={`/products/${p.id}`} className="text-sm font-semibold text-ink hover:text-brand-700"