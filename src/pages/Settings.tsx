import { useState } from 'react';
import { Plus, Settings as SettingsIcon, Zap, Database, Key, Sparkles, Users, Shield, UserCheck, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Field } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface AppUser {
  id: string; email: string; name: string; role: string;
  active: boolean; lastLoginAt: string | null; createdAt: string;
}

const ROLES = [
  { value: 'admin',            label: 'Admin',            description: 'Full access to all features and user management' },
  { value: 'executive',        label: 'Executive',        description: 'Read access to all dashboards and reports' },
  { value: 'product_owner',    label: 'Product Owner',    description: 'Manage products, opportunities, capabilities' },
  { value: 'project_manager',  label: 'Project Manager',  description: 'Manage projects, tasks, risks, issues' },
  { value: 'delivery_lead',    label: 'Delivery Lead',    description: 'Manage allocations and delivery tracking' },
  { value: 'resource_manager', label: 'Resource Manager', description: 'Manage resources and capacity' },
  { value: 'contributor',      label: 'Contributor',      description: 'Create and edit assigned records' },
  { value: 'viewer',           label: 'Viewer',           description: 'Read-only access' },
];

const ROLE_TONES: Record<string, string> = {
  admin: 'bg-brand text-white',
  executive: 'bg-amber-100 text-amber-800',
  product_owner: 'bg-purple-100 text-purple-800',
  project_manager: 'bg-blue-100 text-blue-700',
  delivery_lead: 'bg-cyan-100 text-cyan-800',
  resource_manager: 'bg-teal-100 text-teal-800',
  contributor: 'bg-paper-sunken text-ink-soft',
  viewer: 'bg-line-subtle text-ink-muted',
};

function useUsers() {
  return useQuery<AppUser[]>({
    queryKey: ['users'],
    queryFn: () => api.users.list(),
    retry: false,
  });
}
function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role: string }) =>
      api.users.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); },
    onError: (e: any) => { alert(e?.message ?? 'Could not create user.'); },
  });
}
function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; role?: string; active?: boolean }) =>
      api.users.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); },
    onError: (e: any) => { alert(e?.message ?? 'Could not update user.'); },
  });
}
function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.users.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); },
  });
}

function CreateUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createUser = useCreateUser();

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    try {
      await createUser.mutateAsync(form);
      setForm({ name: '', email: '', password: '', role: 'viewer' });
      setErrors({});
      onClose();
    } catch (_) { /* error handled in onError */ }
  }

  function handleClose() {
    setForm({ name: '', email: '', password: '', role: 'viewer' });
    setErrors({});
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose} maxWidth="max-w-md">
      <DialogHeader title="Add new user" description="Create a login account for this user." onClose={handleClose} />
      <DialogBody className="space-y-4">
        <Field label="Full name" required hint={errors.name}>
          <input className="w-full text-sm border border-line rounded-sm px-3 py-2 bg-paper-raised focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-100"
            placeholder="Jane Smith" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </Field>
        <Field label="Email address" required hint={errors.email}>
          <input type="email" className="w-full text-sm border border-line rounded-sm px-3 py-2 bg-paper-raised focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-100"
            placeholder="jane@company.com" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </Field>
        <Field label="Initial password" required hint={errors.password || 'Min 8 characters. User can change after first login.'}>
          <input type="password" className="w-full text-sm border border-line rounded-sm px-3 py-2 bg-paper-raised focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-100"
            placeholder="••••••••" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </Field>
        <Field label="Role" required>
          <select className="w-full text-sm border border-line rounded-sm px-3 py-2 bg-paper-raised focus:outline-none focus:border-brand"
            value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          {ROLES.find(r => r.value === form.role) && (
            <p className="text-2xs text-ink-muted mt-1">{ROLES.find(r => r.value === form.role)!.description}</p>
          )}
        </Field>
        {form.role === 'admin' && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2">
            <Shield size={13} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">Admin users have full access including user management. Grant with care.</p>
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" size="sm" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={createUser.isPending}>
          {createUser.isPending ? 'Creating…' : 'Create user'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

function UsersTab() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: users = [], isLoading, error, refetch } = useUsers();
  const updateUser = useUpdateUser();
  const deactivateUser = useDeactivateUser();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>User accounts</CardTitle>
            <p className="text-2xs text-ink-muted mt-0.5">Manage who can access the platform and what they can do.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => refetch()}><RefreshCw size={13} /> Refresh</Button>
            <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}><Plus size={13} /> Add user</Button>
          </div>
        </CardHeader>
        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-ink-muted">Loading users…</div>
        ) : error ? (
          <div className="px-4 py-8 text-center text-sm text-crit">
            Could not load users. Make sure you are logged in as Admin.
          </div>
        ) : users.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-ink-muted">No users yet. Click Add user to get started.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-paper-sunken/40">
              <tr className="text-2xs uppercase tracking-wider text-ink-muted">
                <th className="text-left px-4 py-2 font-medium">Name</th>
                <th className="text-left px-4 py-2 font-medium">Email</th>
                <th className="text-left px-4 py-2 font-medium">Role</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Last login</th>
                <th className="text-right px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-paper-sunken/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center text-2xs font-bold text-brand-800 shrink-0">
                        {user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-ink">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      className="text-xs border border-line rounded-xs px-2 py-1 bg-paper-raised focus:outline-none focus:border-brand"
                      value={user.role}
                      onChange={e => updateUser.mutate({ id: user.id, role: e.target.value })}
                    >
                      {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Badge size="xs" tone={user.active ? 'bg-ok-bg text-ok' : 'bg-line-subtle text-ink-muted'}>
                      {user.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.active ? (
                      <Button variant="ghost" size="sm" className="text-ink-muted hover:text-crit"
                        onClick={() => { if (confirm(`Deactivate ${user.name}?`)) deactivateUser.mutate(user.id); }}>
                        <Trash2 size={13} />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-ink-muted hover:text-ok"
                        onClick={() => updateUser.mutate({ id: user.id, active: true })}>
                        <UserCheck size={13} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      <Card>
        <CardHeader><CardTitle>Role reference</CardTitle></CardHeader>
        <div className="divide-y divide-line">
          {ROLES.map(r => (
            <div key={r.value} className="px-4 py-2.5 flex items-center gap-3">
              <Badge size="xs" tone={ROLE_TONES[r.value] ?? 'bg-line-subtle text-ink-muted'}>{r.label}</Badge>
              <span className="text-xs text-ink-muted">{r.description}</span>
            </div>
          ))}
        </div>
      </Card>
      <CreateUserModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}

const CUSTOM_FIELDS = [
  { object: 'Opportunity', name: 'Procurement notes', type: 'longText', required: false },
  { object: 'Opportunity', name: 'Contract type', type: 'select', options: ['SOW', 'MSA', 'OF', 'Trial'], required: true },
  { object: 'Project', name: 'Steerco cadence', type: 'select', options: ['Weekly', 'Bi-weekly', 'Monthly'], required: false },
  { object: 'Project', name: 'Compliance flags', type: 'multiSelect', options: ['SOC2', 'HIPAA', 'GDPR', 'PCI'], required: false },
  { object: 'Resource', name: 'Visa status', type: 'select', options: ['Citizen', 'GC', 'H1B', 'L1', 'OPT'], required: false },
  { object: 'Risk', name: 'Insurable', type: 'boolean', required: false },
];
const INTEGRATIONS = [
  { name: 'Slack', status: 'connected', purpose: 'Notifications, daily briefing delivery' },
  { name: 'Google Calendar', status: 'connected', purpose: 'Meeting sync for transcript matching' },
  { name: 'Zoom', status: 'connected', purpose: 'Auto-pull meeting transcripts' },
  { name: 'OCI GenAI', status: 'disconnected', purpose: 'LLM provider for extraction and chat' },
  { name: 'Jira', status: 'disconnected', purpose: 'Two-way task sync' },
  { name: 'Salesforce', status: 'disconnected', purpose: 'CRM opportunity sync' },
  { name: 'Microsoft Graph', status: 'disconnected', purpose: 'Outlook calendar and email' },
];

export default function Settings() {
  return (
    <div>
      <PageHeader eyebrow="Workspace" title="Settings" subtitle="Configure users, custom fields, integrations, and AI providers." />
      <div className="p-6">
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users"><Users size={13} /> Users</TabsTrigger>
            <TabsTrigger value="fields">Custom fields</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="ai">AI provider</TabsTrigger>
            <TabsTrigger value="data">Data & retention</TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="pt-4"><UsersTab /></TabsContent>
          <TabsContent value="fields" className="pt-4">
            <Card>
              <CardHeader>
                <div><CardTitle>Custom fields</CardTitle><p className="text-2xs text-ink-muted mt-0.5">Extend any object with additional metadata.</p></div>
                <Button variant="primary" size="md"><Plus size={13} /> Add field</Button>
              </CardHeader>
              <table className="w-full text-sm">
                <thead className="bg-paper-sunken/40">
                  <tr className="text-2xs uppercase tracking-wider text-ink-muted">
                    <th className="text-left px-4 py-2 font-medium">Object</th>
                    <th className="text-left px-4 py-2 font-medium">Field name</th>
                    <th className="text-left px-4 py-2 font-medium">Type</th>
                    <th className="text-left px-4 py-2 font-medium">Options</th>
                    <th className="text-left px-4 py-2 font-medium">Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {CUSTOM_FIELDS.map((f, i) => (
                    <tr key={i} className="hover:bg-paper-sunken/40">
                      <td className="px-4 py-2.5"><Badge size="xs" tone="bg-paper-sunken text-ink-soft">{f.object}</Badge></td>
                      <td className="px-4 py-2.5 font-medium text-ink">{f.name}</td>
                      <td className="px-4 py-2.5 font-mono text-2xs text-ink-muted">{f.type}</td>
                      <td className="px-4 py-2.5">{(f as any).options ? <div className="flex flex-wrap gap-1">{(f as any).options.map((o: string) => <Badge key={o} size="xs" tone="bg-line-subtle text-ink-muted">{o}</Badge>)}</div> : <span className="text-ink-subtle text-xs">—</span>}</td>
                      <td className="px-4 py-2.5"><span className={f.required ? 'text-crit text-xs font-semibold' : 'text-ink-subtle text-xs'}>{f.required ? 'required' : 'optional'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>
          <TabsContent value="integrations" className="pt-4">
            <Card>
              <CardHeader><CardTitle>Integrations</CardTitle></CardHeader>
              <ul className="divide-y divide-line">
                {INTEGRATIONS.map(int => (
                  <li key={int.name} className="px-4 py-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-paper-sunken border border-line flex items-center justify-center"><Zap size={15} className="text-ink-muted" /></div>
                    <div className="flex-1"><div className="text-sm font-semibold text-ink">{int.name}</div><div className="text-xs text-ink-muted">{int.purpose}</div></div>
                    <Badge size="sm" tone={int.status === 'connected' ? 'bg-ok-bg text-ok' : 'bg-line-subtle text-ink-muted'}>{int.status}</Badge>
                    <Button variant="outline" size="sm">{int.status === 'connected' ? 'Configure' : 'Connect'}</Button>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>
          <TabsContent value="ai" className="pt-4">
            <Card>
              <CardHeader><CardTitle>AI provider configuration</CardTitle><Badge tone="bg-brand text-white" size="xs"><Sparkles size={9} /> AI</Badge></CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <div className="text-2xs text-ink-muted uppercase tracking-wider font-medium mb-1.5">Active provider</div>
                  <div className="flex items-center gap-2"><Badge tone="bg-brand-100 text-brand-800">Anthropic Claude</Badge><Button variant="outline" size="sm">Switch provider</Button></div>
                </div>
              </CardBody>
            </Card>
          </TabsContent>
          <TabsContent value="data" className="pt-4">
            <Card>
              <CardHeader><CardTitle>Data & retention</CardTitle></CardHeader>
              <CardBody className="space-y-3">
                {([
                  { icon: <Database size={14} />, label: 'Primary store', value: 'PostgreSQL 16 (Prisma)' },
                  { icon: <Zap size={14} />, label: 'Cache', value: 'Redis 7' },
                  { icon: <Key size={14} />, label: 'Auth', value: 'JWT + RBAC' },
                  { icon: <SettingsIcon size={14} />, label: 'Transcript retention', value: '365 days' },
                  { icon: <SettingsIcon size={14} />, label: 'Audit log retention', value: '7 years (compliance)' },
                ] as { icon: React.ReactNode; label: string; value: string }[]).map(s => (
                  <div key={s.label} className="flex items-center gap-3 py-2 border-b border-line last:border-0">
                    <div className="h-8 w-8 rounded-sm bg-paper-sunken border border-line flex items-center justify-center text-ink-muted">{s.icon}</div>
                    <div className="flex-1"><div className="text-xs text-ink-muted uppercase tracking-wider">{s.label}</div><div className="text-sm text-ink">{s.value}</div></div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
