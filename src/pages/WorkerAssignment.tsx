import { useState } from 'react';
import { Plus, Pencil, Trash2, Link2 } from 'lucide-react';
import { useResources, useAllocations, useProducts, useProjects,
         useCreateAllocation, useUpdateAllocation, useDeleteAllocation } from '@/lib/hooks';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Field, FormRow } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/components/ui/toast';
import { fmtDate, sumBy, cn } from '@/lib/utils';

const CONFIDENCE = ['proposed','committed','locked'];
const EMPTY_ALLOC = { resourceId:'', projectId:'', productId:'', role:'', hoursPerWeek:'8',
  startDate:'', endDate:'', confidence:'committed' };

export default function WorkerAssignment() {
  const { data: resources = [], isLoading } = useResources();
  const { data: allocations = [] } = useAllocations();
  const { data: products = [] } = useProducts();
  const { data: projects = [] } = useProjects();
  const createAllocation = useCreateAllocation();
  const updateAllocation = useUpdateAllocation();
  const deleteAllocation = useDeleteAllocation();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any|null>(null);
  const [form, setForm] = useState({ ...EMPTY_ALLOC });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string|null>(null);
  const [selectedResource, setSelectedResource] = useState<string|null>(null);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function openCreate(resourceId?: string) {
    setEditTarget(null);
    setForm({ ...EMPTY_ALLOC, resourceId: resourceId ?? '' });
    setError(''); setOpen(true);
  }

  function openEdit(a: any) {
    setEditTarget(a);
    setForm({
      resourceId: a.resourceId ?? '', projectId: a.projectId ?? '', productId: a.productId ?? '',
      role: a.role ?? '', hoursPerWeek: String(a.hoursPerWeek ?? 8),
      startDate: a.startDate ? a.startDate.slice(0,10) : '',
      endDate: a.endDate ? a.endDate.slice(0,10) : '',
      confidence: a.confidence ?? 'committed',
    });
    setError(''); setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.resourceId) { setError('Resource is required.'); return; }
    if (!form.startDate || !form.endDate) { setError('Start and end dates are required.'); return; }
    if (!form.projectId && !form.productId) { setError('At least one of Project or Product is required.'); return; }
    setSaving(true); setError('');
    const payload = {
      resourceId: form.resourceId, role: form.role.trim() || 'Contributor',
      projectId: form.projectId || null, productId: form.productId || null,
      hoursPerWeek: parseFloat(form.hoursPerWeek) || 8,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      confidence: form.confidence,
    };
    try {
      if (editTarget) { await updateAllocation.mutateAsync({ id: editTarget.id, ...payload }); toast('Allocation updated'); }
      else            { await createAllocation.mutateAsync(payload); toast('Allocation added'); }
      setOpen(false); setForm({ ...EMPTY_ALLOC });
    } catch (err: any) { setError(err?.message ?? 'Failed to save allocation.'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try { await deleteAllocation.mutateAsync(id); toast('Allocation removed', 'info'); }
    finally { setConfirmDelete(null); }
  }

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading…</div>;

  type ColEntry = { id: string; name: string; type: 'product'|'project' };
  const productCols: ColEntry[] = (products as any[]).map(p=>({ id:p.id, name:p.shortName, type:'product' as const }));
  const projectCols: ColEntry[] = (projects as any[]).map(p=>({ id:p.id, name:p.code, type:'project' as const }));
  const cols: ColEntry[] = [...productCols, ...projectCols];

  function hours(resourceId: string, col: ColEntry) {
    return sumBy((allocations as any[]).filter(a=>a.resourceId===resourceId&&(col.type==='product'?a.productId===col.id:a.projectId===col.id)),a=>a.hoursPerWeek);
  }

  const resourceAllocations = selectedResource
    ? (allocations as any[]).filter(a => a.resourceId === selectedResource)
    : [];

  const confidenceBadge: Record<string,string> = {
    proposed: 'bg-line-subtle text-ink-muted',
    committed: 'bg-info-bg text-info',
    locked: 'bg-ok-bg text-ok',
  };

  return (
    <div>
      <PageHeader
        eyebrow="Resources" title="Assignment Matrix"
        subtitle="Who works on what. Click a resource row to manage their allocations."
        actions={<Button variant="primary" onClick={()=>openCreate()}><Plus size={13}/> New allocation</Button>}
      />

      <div className="p-6 space-y-6">
        <Tabs defaultValue="matrix">
          <TabsList>
            <TabsTrigger value="matrix">Matrix View</TabsTrigger>
            <TabsTrigger value="list">Allocation List</TabsTrigger>
          </TabsList>

          {/* Matrix View */}
          <TabsContent value="matrix" className="mt-4">
            <Card>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-xs">
                  <thead className="bg-paper-sunken/40">
                    <tr>
                      <th className="text-left px-3 py-2 text-2xs uppercase tracking-wider text-ink-muted sticky left-0 bg-paper-sunken/40 min-w-[160px]">Resource</th>
                      {productCols.map(c=><th key={c.id} className="px-2 py-2 text-2xs font-medium text-brand-700 text-center whitespace-nowrap">{c.name}</th>)}
                      <th className="px-2 py-2 text-2xs font-medium text-line-subtle text-center">|</th>
                      {projectCols.map(c=><th key={c.id} className="px-2 py-2 text-2xs font-medium text-info text-center whitespace-nowrap">{c.name}</th>)}
                      <th className="px-2 py-2 text-2xs text-ink-muted text-center">Total</th>
                      <th className="px-2 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {(resources as any[]).map(r => {
                      const total = sumBy(cols, c => hours(r.id, c));
                      const overloaded = total > r.weeklyCapacityHours;
                      return (
                        <tr key={r.id} className="hover:bg-paper-sunken/30 cursor-pointer" onClick={()=>setSelectedResource(selectedResource===r.id?null:r.id)}>
                          <td className="px-3 py-2 sticky left-0 bg-paper">
                            <div className="flex items-center gap-2">
                              <Avatar initials={r.initials} size="xs"/>
                              <div>
                                <p className="font-medium text-ink">{r.name}</p>
                                <p className="text-2xs text-ink-muted">{r.role}</p>
                              </div>
                            </div>
                          </td>
                          {productCols.map(c=>{ const h=hours(r.id,c); return <td key={c.id} className={cn('px-2 py-2 text-center',h?'text-brand-800 font-medium':'text-ink-muted/30')}>{h||'—'}</td>; })}
                          <td className="px-2 py-2 text-center text-line">|</td>
                          {projectCols.map(c=>{ const h=hours(r.id,c); return <td key={c.id} className={cn('px-2 py-2 text-center',h?'text-info font-medium':'text-ink-muted/30')}>{h||'—'}</td>; })}
                          <td className={cn('px-2 py-2 text-center font-semibold text-xs', overloaded?'text-crit':'text-ink')}>{total||'—'}</td>
                          <td className="px-2 py-2 text-center" onClick={e=>e.stopPropagation()}>
                            <button onClick={()=>openCreate(r.id)} className="text-ink-muted hover:text-brand-700 p-1 rounded hover:bg-brand-50" title="Add allocation"><Plus size={11}/></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Expanded allocation detail for selected resource */}
              {selectedResource && (
                <div className="border-t border-line bg-paper-sunken/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-ink">Allocations for {(resources as any[]).find(r=>r.id===selectedResource)?.name}</p>
                    <button onClick={()=>openCreate(selectedResource)} className="flex items-center gap-1 text-xs text-brand-700 hover:text-brand-900">
                      <Plus size={11}/> Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {resourceAllocations.length===0 && <p className="text-xs text-ink-muted">No allocations. Click + Add to create one.</p>}
                    {resourceAllocations.map((a:any) => {
                      const proj = (projects as any[]).find(p=>p.id===a.projectId);
                      const prod = (products as any[]).find(p=>p.id===a.productId);
                      const isConfirming = confirmDelete === a.id;
                      return (
                        <div key={a.id} className="flex items-center gap-3 bg-paper-raised border border-line rounded px-3 py-2">
                          <Link2 size={11} className="text-ink-muted shrink-0"/>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {proj && <Badge className="bg-info-bg text-info text-2xs">{proj.code}</Badge>}
                              {prod && <Badge className="bg-brand-100 text-brand-800 text-2xs">{prod.shortName}</Badge>}
                              <span className="text-xs text-ink-soft">{a.role}</span>
                              <Badge className={cn('text-2xs', confidenceBadge[a.confidence]??'bg-line-subtle text-ink-muted')}>{a.confidence}</Badge>
                            </div>
                            <p className="text-2xs text-ink-muted mt-0.5">{a.hoursPerWeek}h/wk · {fmtDate(a.startDate)} → {fmtDate(a.endDate)}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={()=>openEdit(a)} className="text-ink-muted hover:text-brand-700 p-1 rounded hover:bg-brand-50"><Pencil size={11}/></button>
                            {isConfirming ? (
                              <>
                                <button onClick={()=>handleDelete(a.id)} className="text-2xs text-white bg-crit px-1.5 py-0.5 rounded">Del</button>
                                <button onClick={()=>setConfirmDelete(null)} className="text-2xs text-ink-muted px-1 py-0.5 rounded border border-line">✕</button>
                              </>
                            ) : (
                              <button onClick={()=>setConfirmDelete(a.id)} className="text-ink-muted hover:text-crit p-1 rounded hover:bg-crit-bg"><Trash2 size={11}/></button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* List View — all allocations */}
          <TabsContent value="list" className="mt-4">
            <div className="flex justify-end mb-3">
              <Button variant="primary" onClick={()=>openCreate()}><Plus size={13}/> New allocation</Button>
            </div>
            <div className="border border-line rounded-md divide-y divide-line bg-paper-raised">
              {(allocations as any[]).length===0 && <p className="p-6 text-center text-xs text-ink-muted">No allocations yet.</p>}
              {(allocations as any[]).map((a:any) => {
                const res = (resources as any[]).find(r=>r.id===a.resourceId);
                const proj = (projects as any[]).find(p=>p.id===a.projectId);
                const prod = (products as any[]).find(p=>p.id===a.productId);
                const isConfirming = confirmDelete === a.id;
                return (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-paper-sunken/40">
                    {res && <Avatar initials={res.initials} size="xs" title={res.name}/>}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-ink">{res?.name ?? '—'}</span>
                        <span className="text-ink-muted text-2xs">→</span>
                        {proj && <Badge className="bg-info-bg text-info text-2xs">{proj.code}</Badge>}
                        {prod && <Badge className="bg-brand-100 text-brand-800 text-2xs">{prod.shortName}</Badge>}
                        <span className="text-xs text-ink-soft">{a.role}</span>
                        <Badge className={cn('text-2xs',confidenceBadge[a.confidence]??'bg-line-subtle text-ink-muted')}>{a.confidence}</Badge>
                      </div>
                      <p className="text-2xs text-ink-muted mt-0.5">{a.hoursPerWeek}h/wk · {fmtDate(a.startDate)} → {fmtDate(a.endDate)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={()=>openEdit(a)} className="text-ink-muted hover:text-brand-700 p-1 rounded hover:bg-brand-50"><Pencil size={12}/></button>
                      {isConfirming ? (
                        <>
                          <button onClick={()=>handleDelete(a.id)} className="text-2xs text-white bg-crit px-2 py-0.5 rounded">Delete</button>
                          <button onClick={()=>setConfirmDelete(null)} className="text-2xs text-ink-muted px-1.5 py-0.5 rounded border border-line">✕</button>
                        </>
                      ) : (
                        <button onClick={()=>setConfirmDelete(a.id)} className="text-ink-muted hover:text-crit p-1 rounded hover:bg-crit-bg"><Trash2 size={12}/></button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Allocation modal */}
      <Dialog open={open} onOpenChange={setOpen} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader title={editTarget?'Edit allocation':'New allocation'} onClose={()=>setOpen(false)}/>
          <DialogBody className="space-y-3">
            <Field label="Resource" required>
              <Select value={form.resourceId} onChange={e=>set('resourceId',e.target.value)} className="w-full">
                <option value="">-- select resource --</option>
                {(resources as any[]).map(r=><option key={r.id} value={r.id}>{r.name} ({r.role})</option>)}
              </Select>
            </Field>
            <FormRow>
              <Field label="Project">
                <Select value={form.projectId} onChange={e=>set('projectId',e.target.value)} className="w-full">
                  <option value="">-- none --</option>
                  {(projects as any[]).map(p=><option key={p.id} value={p.id}>{(p as any).code} – {(p as any).name}</option>)}
                </Select>
              </Field>
              <Field label="Product">
                <Select value={form.productId} onChange={e=>set('productId',e.target.value)} className="w-full">
                  <option value="">-- none --</option>
                  {(products as any[]).map(p=><option key={p.id} value={p.id}>{(p as any).shortName}</option>)}
                </Select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Role on effort"><Input value={form.role} onChange={e=>set('role',e.target.value)} placeholder="e.g. Tech Lead"/></Field>
              <Field label="Hours / week"><Input type="number" min="1" max="80" value={form.hoursPerWeek} onChange={e=>set('hoursPerWeek',e.target.value)}/></Field>
            </FormRow>
            <FormRow>
              <Field label="Start date" required><Input type="date" value={form.startDate} onChange={e=>set('startDate',e.target.value)} required/></Field>
              <Field label="End date" required><Input type="date" value={form.endDate} onChange={e=>set('endDate',e.target.value)} required/></Field>
            </FormRow>
            <Field label="Confidence">
              <Select value={form.confidence} onChange={e=>set('confidence',e.target.value)} className="w-full">
                {CONFIDENCE.map(c=><option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            {error && <p className="text-xs text-crit bg-crit-bg border border-crit/20 rounded px-3 py-2">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving?'Saving…':editTarget?'Save changes':'Add allocation'}</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
