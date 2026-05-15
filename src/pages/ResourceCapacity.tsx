import { useMemo, useState } from 'react';
import { AlertTriangle, Users, TrendingUp, Filter, Plus, Pencil, Trash2 } from 'lucide-react';
import { useResources, useAllocations, useLocations, makeLookup,
         useCreateResource, useUpdateResource, useDeleteResource } from '@/lib/hooks';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Field, FormRow } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/components/ui/toast';
import { fmtPct, sumBy, utilizationRag, weeksFromNow, cn } from '@/lib/utils';

const LEVELS = ['junior','mid','senior','principal','director'];
const EMPTY_RES = { name:'', initials:'', email:'', role:'', level:'mid', locationId:'',
  weeklyCapacityHours:'40', timeOffHours:'0', costRate:'', skills:'', active: true };

export default function ResourceCapacity() {
  const [region, setRegion] = useState<string>('all');
  const { data: resources = [], isLoading } = useResources();
  const { data: allocations = [] } = useAllocations();
  const { data: locations = [] } = useLocations();
  const locationById = makeLookup(locations as any[]);
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState({ ...EMPTY_RES });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })); }
  function openCreate() { setEditTarget(null); setForm({ ...EMPTY_RES }); setError(''); setOpen(true); }
  function openEdit(r: any) {
    setEditTarget(r);
    setForm({ name: r.name??'', initials: r.initials??'', email: r.email??'', role: r.role??'',
      level: r.level??'mid', locationId: r.locationId??'',
      weeklyCapacityHours: String(r.weeklyCapacityHours??40),
      timeOffHours: String(r.timeOffHours??0),
      costRate: r.costRate ? String(r.costRate) : '',
      skills: Array.isArray(r.skills) ? r.skills.join(', ') : (r.skills??''),
      active: r.active !== false });
    setError(''); setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.email.trim()) { setError('Email is required.'); return; }
    setSaving(true); setError('');
    const payload: any = {
      name: form.name.trim(), initials: form.initials.trim() || form.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2),
      email: form.email.trim(), role: form.role.trim(), level: form.level,
      locationId: form.locationId || null,
      weeklyCapacityHours: parseInt(form.weeklyCapacityHours)||40,
      timeOffHours: parseInt(form.timeOffHours)||0,
      costRate: form.costRate ? Number(form.costRate) : null,
      skills: form.skills ? form.skills.split(',').map((s:string)=>s.trim()).filter(Boolean) : [],
      active: form.active,
    };
    try {
      if (editTarget) { await updateResource.mutateAsync({ id: editTarget.id, ...payload }); toast('Resource updated'); }
      else            { await createResource.mutateAsync(payload); toast('Resource added'); }
      setOpen(false); setForm({ ...EMPTY_RES });
    } catch (err: any) { setError(err?.message ?? 'Failed to save resource.'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try { await deleteResource.mutateAsync(id); toast('Resource removed', 'info'); }
    finally { setConfirmDelete(null); }
  }

  const weeks = useMemo(() => weeksFromNow(12), []);
  const filteredResources = (resources as any[]).filter(r => {
    if (region === 'all') return true;
    const loc = locationById(r.locationId);
    return (loc as any)?.region === region;
  });

  function utilForResourceWeek(resourceId: string, weekISO: string) {
    const weekStart = new Date(weekISO); const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate()+6);
    return (allocations as any[]).filter(a => a.resourceId === resourceId)
      .filter(a => { const s=new Date(a.startDate),e=new Date(a.endDate); return s<=weekEnd && e>=weekStart; })
      .reduce((sum:number,a:any)=>sum+a.hoursPerWeek,0);
  }

  const RAG_BG: Record<string,string> = {
    green:'bg-ok/20 text-ok', yellow:'bg-amber-100 text-amber-800',
    orange:'bg-amber-200 text-amber-900', red:'bg-crit/20 text-crit',
  };

  const overloaded = filteredResources.filter(r => {
    const cap = r.weeklyCapacityHours-(r.timeOffHours??0);
    return cap>0 && sumBy((allocations as any[]).filter(a=>a.resourceId===r.id),a=>a.hoursPerWeek)/cap>1;
  });
  const bench = filteredResources.filter(r => sumBy((allocations as any[]).filter(a=>a.resourceId===r.id),a=>a.hoursPerWeek)===0);
  const regions = [...new Set((locations as any[]).map((l:any)=>l.region))];

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading capacity…</div>;

  return (
    <div>
      <PageHeader
        eyebrow="Resources" title="Capacity & Utilization"
        subtitle={`${filteredResources.length} resources · ${overloaded.length} over-allocated · ${bench.length} on bench`}
        actions={
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-ink-muted" />
            <Select value={region} onChange={e=>setRegion(e.target.value)} className="text-xs w-28">
              <option value="all">All regions</option>
              {regions.map(r=><option key={r as string} value={r as string}>{r as string}</option>)}
            </Select>
            <Button variant="primary" onClick={openCreate}><Plus size={13}/> New resource</Button>
          </div>
        }
      />

      <div className="px-6 pt-4 grid grid-cols-3 gap-4">
        {[{ label:'Over-allocated',count:overloaded.length,icon:AlertTriangle,tone:'text-crit'},
          { label:'Healthy',count:filteredResources.length-overloaded.length-bench.length,icon:TrendingUp,tone:'text-ok'},
          { label:'On bench',count:bench.length,icon:Users,tone:'text-ink-muted'}].map(s=>(
          <Card key={s.label}><CardBody className="flex items-center gap-3 py-3">
            <s.icon size={18} className={s.tone}/>
            <div><p className="text-lg font-bold text-ink">{s.count}</p><p className="text-xs text-ink-muted">{s.label}</p></div>
          </CardBody></Card>
        ))}
      </div>

      <div className="p-6">
        <Card>
          <CardHeader><CardTitle>12-Week Utilization Heatmap</CardTitle></CardHeader>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left px-3 py-2 text-2xs font-medium text-ink-muted sticky left-0 bg-paper min-w-[180px]">Resource</th>
                  {weeks.map(w=>(
                    <th key={w} className="px-1 py-2 text-2xs font-medium text-ink-muted text-center whitespace-nowrap min-w-[52px]">
                      {new Date(w).toLocaleDateString('en-US',{month:'numeric',day:'numeric'})}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-2xs text-ink-muted text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredResources.map(r => {
                  const cap = r.weeklyCapacityHours-(r.timeOffHours??0);
                  const loc = locationById(r.locationId);
                  const isConfirming = confirmDelete === r.id;
                  return (
                    <tr key={r.id} className="hover:bg-paper-sunken/20">
                      <td className="px-3 py-1.5 sticky left-0 bg-paper">
                        <div className="flex items-center gap-2">
                          <Avatar initials={r.initials} size="xs"/>
                          <div>
                            <p className="font-medium text-ink">{r.name}</p>
                            <p className="text-2xs text-ink-muted">{r.role} · {(loc as any)?.name ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      {weeks.map(w => {
                        const alloc = utilForResourceWeek(r.id,w);
                        const pct = cap>0?(alloc/cap)*100:0;
                        const rag = utilizationRag(pct);
                        return (
                          <td key={w} className="px-1 py-1.5 text-center">
                            <div className={cn('rounded text-2xs py-1 px-1',RAG_BG[rag]??'bg-line-subtle text-ink-muted')}>
                              {pct>0?`${Math.round(pct)}%`:'—'}
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-2 py-1.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={()=>openEdit(r)} className="text-ink-muted hover:text-brand-700 p-1 rounded hover:bg-brand-50"><Pencil size={11}/></button>
                          {isConfirming ? (
                            <>
                              <button onClick={()=>handleDelete(r.id)} className="text-2xs text-white bg-crit px-1.5 py-0.5 rounded">Del</button>
                              <button onClick={()=>setConfirmDelete(null)} className="text-2xs text-ink-muted px-1 py-0.5 rounded border border-line">✕</button>
                            </>
                          ) : (
                            <button onClick={()=>setConfirmDelete(r.id)} className="text-ink-muted hover:text-crit p-1 rounded hover:bg-crit-bg"><Trash2 size={11}/></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit}>
          <DialogHeader title={editTarget?'Edit resource':'New resource'} onClose={()=>setOpen(false)}/>
          <DialogBody className="space-y-3">
            <FormRow>
              <Field label="Full name" required><Input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Priya Singh" required/></Field>
              <Field label="Initials" hint="2–3 chars"><Input value={form.initials} onChange={e=>set('initials',e.target.value)} maxLength={3} placeholder="PS"/></Field>
            </FormRow>
            <FormRow>
              <Field label="Email" required><Input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="priya@company.com" required/></Field>
              <Field label="Role"><Input value={form.role} onChange={e=>set('role',e.target.value)} placeholder="e.g. AI Engineer"/></Field>
            </FormRow>
            <FormRow>
              <Field label="Level">
                <Select value={form.level} onChange={e=>set('level',e.target.value)} className="w-full">
                  {LEVELS.map(l=><option key={l} value={l}>{l}</option>)}
                </Select>
              </Field>
              <Field label="Location">
                <Select value={form.locationId} onChange={e=>set('locationId',e.target.value)} className="w-full">
                  <option value="">-- none --</option>
                  {(locations as any[]).map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
                </Select>
              </Field>
            </FormRow>
            <FormRow>
              <Field label="Weekly capacity (hrs)"><Input type="number" value={form.weeklyCapacityHours} onChange={e=>set('weeklyCapacityHours',e.target.value)}/></Field>
              <Field label="Time off (hrs/week)"><Input type="number" value={form.timeOffHours} onChange={e=>set('timeOffHours',e.target.value)}/></Field>
            </FormRow>
            <FormRow>
              <Field label="Cost rate (£/hr)"><Input type="number" value={form.costRate} onChange={e=>set('costRate',e.target.value)} placeholder="e.g. 120"/></Field>
              <Field label="Active">
                <Select value={form.active?'true':'false'} onChange={e=>set('active',e.target.value==='true')} className="w-full">
                  <option value="true">Active</option><option value="false">Inactive</option>
                </Select>
              </Field>
            </FormRow>
            <Field label="Skills" hint="Comma-separated"><Input value={form.skills} onChange={e=>set('skills',e.target.value)} placeholder="e.g. React, TypeScript, Node"/></Field>
            {error && <p className="text-xs text-crit bg-crit-bg border border-crit/20 rounded px-3 py-2">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving?'Saving…':editTarget?'Save changes':'Add resource'}</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
