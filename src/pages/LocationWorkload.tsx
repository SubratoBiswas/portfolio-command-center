import { useState } from 'react';
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import { useLocations, useResources, useAllocations,
         useCreateLocation, useUpdateLocation, useDeleteLocation } from '@/lib/hooks';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Field, FormRow } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/components/ui/toast';
import { sumBy, fmtPct, cn } from '@/lib/utils';

const TYPES = ['office','remote','client_site','offshore'];
const EMPTY_LOC = { name:'', region:'', type:'office', timezone:'' };

export default function LocationWorkload() {
  const { data: locations = [], isLoading } = useLocations();
  const { data: resources = [] } = useResources();
  const { data: allocations = [] } = useAllocations();
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any|null>(null);
  const [form, setForm] = useState({ ...EMPTY_LOC });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string|null>(null);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }
  function openCreate() { setEditTarget(null); setForm({ ...EMPTY_LOC }); setError(''); setOpen(true); }
  function openEdit(l: any) {
    setEditTarget(l);
    setForm({ name: l.name??'', region: l.region??'', type: l.type??l.classification??'office', timezone: l.timezone??'' });
    setError(''); setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.region.trim()) { setError('Region is required.'); return; }
    setSaving(true); setError('');
    const payload = { name: form.name.trim(), region: form.region.trim(), type: form.type, timezone: form.timezone.trim() || null };
    try {
      if (editTarget) { await updateLocation.mutateAsync({ id: editTarget.id, ...payload }); toast('Location updated'); }
      else            { await createLocation.mutateAsync(payload); toast('Location added'); }
      setOpen(false); setForm({ ...EMPTY_LOC });
    } catch (err: any) { setError(err?.message ?? 'Failed to save location.'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try { await deleteLocation.mutateAsync(id); toast('Location removed', 'info'); }
    finally { setConfirmDelete(null); }
  }

  const data = (locations as any[]).map(loc => {
    const locResources = (resources as any[]).filter(r => r.locationId === loc.id);
    const totalCap = sumBy(locResources, r => r.weeklyCapacityHours);
    const totalAlloc = sumBy((allocations as any[]).filter(a=>locResources.some(r=>r.id===a.resourceId)),a=>a.hoursPerWeek);
    const pct = totalCap ? (totalAlloc/totalCap)*100 : 0;
    return { loc, resources: locResources, totalCap, totalAlloc, pct };
  });

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading…</div>;

  return (
    <div>
      <PageHeader
        eyebrow="Resources" title="Locations & Workload"
        subtitle="Capacity and utilization rolled up by site."
        actions={<Button variant="primary" onClick={openCreate}><Plus size={13}/> New location</Button>}
      />

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.map(({ loc, resources: locRes, totalCap, totalAlloc, pct }) => {
          const isConfirming = confirmDelete === loc.id;
          return (
            <Card key={loc.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MapPin size={13} className="text-brand-700"/>
                  {loc.name}
                  <Badge className="ml-auto bg-line-subtle text-ink-muted">{loc.region}</Badge>
                  <div className="flex items-center gap-1 ml-1">
                    <button onClick={()=>openEdit(loc)} className="text-ink-muted hover:text-brand-700 p-0.5 rounded"><Pencil size={11}/></button>
                    {isConfirming ? (
                      <>
                        <button onClick={()=>handleDelete(loc.id)} className="text-2xs text-white bg-crit px-1.5 py-0.5 rounded">Del</button>
                        <button onClick={()=>setConfirmDelete(null)} className="text-2xs text-ink-muted px-1 py-0.5 rounded border border-line">✕</button>
                      </>
                    ) : (
                      <button onClick={()=>setConfirmDelete(loc.id)} className="text-ink-muted hover:text-crit p-0.5 rounded"><Trash2 size={11}/></button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-muted">{locRes.length} people · {totalAlloc}h / {totalCap}h</span>
                  <span className={cn('font-medium', pct>90?'text-crit':pct>75?'text-amber-700':'text-ok')}>{fmtPct(pct)}</span>
                </div>
                <Progress value={pct} className="h-1.5"/>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {locRes.map((r:any)=><Avatar key={r.id} initials={r.initials} size="xs" title={r.name}/>)}
                    {locRes.length===0 && <span className="text-2xs text-ink-muted">No resources assigned</span>}
                  </div>
                  {loc.timezone && <span className="text-2xs text-ink-subtle">{loc.timezone}</span>}
                </div>
              </CardBody>
            </Card>
          );
        })}
        {data.length === 0 && (
          <div className="col-span-3 py-16 text-center text-sm text-ink-muted">
            No locations yet. Add one to get started.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit}>
          <DialogHeader title={editTarget?'Edit location':'New location'} onClose={()=>setOpen(false)}/>
          <DialogBody className="space-y-3">
            <FormRow>
              <Field label="Location name" required><Input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. London Office" required/></Field>
              <Field label="Region" required><Input value={form.region} onChange={e=>set('region',e.target.value)} placeholder="e.g. UK, IN, US"/></Field>
            </FormRow>
            <FormRow>
              <Field label="Type">
                <Select value={form.type} onChange={e=>set('type',e.target.value)} className="w-full">
                  {TYPES.map(t=><option key={t} value={t}>{t.replace('_',' ')}</option>)}
                </Select>
              </Field>
              <Field label="Timezone" hint="e.g. Europe/London"><Input value={form.timezone} onChange={e=>set('timezone',e.target.value)} placeholder="Europe/London"/></Field>
            </FormRow>
            {error && <p className="text-xs text-crit bg-crit-bg border border-crit/20 rounded px-3 py-2">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving?'Saving…':editTarget?'Save changes':'Add location'}</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
