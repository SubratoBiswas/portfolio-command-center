import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban } from 'lucide-react';
import { useProjects, useLookups, useClients, useResources, useCreateProject } from '@/lib/hooks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input, Select } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Field, FormRow } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, RagBadge } from '@/components/shared/Badges';
import { fmtDate, fmtCurrency, daysFromNow, cn } from '@/lib/utils';

const EMPTY = { name: '', code: '', clientId: '', ownerId: '', status: 'not_started', rag: 'green', startDate: '', endDate: '', budget: '' };

export default function Projects() {
  const { data: projects = [], isLoading } = useProjects();
  const { clientById, productById, resourceById } = useLookups();
  const { data: clients = [] } = useClients();
  const { data: resources = [] } = useResources();
  const createProject = useCreateProject();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) { setError('Name and code are required.'); return; }
    setSaving(true); setError('');
    try {
      await createProject.mutateAsync({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        clientId: form.clientId || null,
        ownerId: form.ownerId || null,
        status: form.status,
        rag: form.rag,
        startDate: form.startDate || new Date().toISOString(),
        endDate: form.endDate || null,
        budget: form.budget ? Number(form.budget) : null,
      });
      setOpen(false);
      setForm({ ...EMPTY });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create project.');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <div className="p-8 text-sm text-ink-muted">Loading projects…</div>;

  return (
    <div>
      <PageHeader
        eyebrow="Delivery"
        title="Projects"
        subtitle={`${projects.length} projects · ${(projects as any[]).filter((p:any)=>p.rag==='red').length} red, ${(projects as any[]).filter((p:any)=>p.rag==='orange').length} orange, ${(projects as any[]).filter((p:any)=>p.rag==='yellow').length} yellow, ${(projects as any[]).filter((p:any)=>p.rag==='green').length} green.`}
        actions={<Button variant="primary" onClick={() => setOpen(true)}><Plus size={13} /> New project</Button>}
      />

      <div className="p-6">
        <Card>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="bg-paper-sunken/40">
                <tr className="text-2xs uppercase tracking-wider text-ink-muted">
                  <th className="text-left px-4 py-2 font-medium">Project</th>
                  <th className="text-left px-4 py-2 font-medium">Client</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">RAG</th>
                  <th className="text-left px-4 py-2 font-medium">Timeline</th>
                  <th className="text-left px-4 py-2 font-medium">Budget</th>
                  <th className="text-left px-4 py-2 font-medium">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {(projects as any[]).map((p: any) => {
                  const client = clientById(p.clientId);
                  const owner = resourceById(p.ownerId);
                  const pctSpent = p.budget && p.spent ? (p.spent / p.budget) * 100 : 0;
                  const daysLeft = daysFromNow(p.endDate);
                  return (
                    <tr key={p.id} className="hover:bg-paper-sunken/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/projects/${p.id}`} className="font-medium text-ink hover:text-brand-700">{p.code}</Link>
                        <p className="text-xs text-ink-muted truncate max-w-[200px]">{p.name}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-muted">{(client as any)?.name ?? '—'}</td>
                      <td className="px-4 py-3"><Statu