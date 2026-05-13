import { Plus, Settings as SettingsIcon, Zap, Database, Key, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';

const CUSTOM_FIELDS = [
  { object: 'Opportunity', name: 'Procurement notes', type: 'longText', required: false },
  { object: 'Opportunity', name: 'Contract type',     type: 'select', options: ['SOW', 'MSA', 'OF', 'Trial'], required: true },
  { object: 'Project',     name: 'Steerco cadence',   type: 'select', options: ['Weekly', 'Bi-weekly', 'Monthly'], required: false },
  { object: 'Project',     name: 'Compliance flags',  type: 'multiSelect', options: ['SOC2', 'HIPAA', 'GDPR', 'PCI'], required: false },
  { object: 'Resource',    name: 'Visa status',       type: 'select', options: ['Citizen', 'GC', 'H1B', 'L1', 'OPT'], required: false },
  { object: 'Risk',        name: 'Insurable',         type: 'boolean', required: false },
];

const INTEGRATIONS = [
  { name: 'Slack',            status: 'connected',    purpose: 'Notifications, daily briefing delivery' },
  { name: 'Google Calendar',  status: 'connected',    purpose: 'Meeting sync for transcript matching' },
  { name: 'Zoom',             status: 'connected',    purpose: 'Auto-pull meeting transcripts' },
  { name: 'OCI GenAI',        status: 'disconnected', purpose: 'LLM provider for extraction and chat' },
  { name: 'Jira',             status: 'disconnected', purpose: 'Two-way task sync' },
  { name: 'Salesforce',       status: 'disconnected', purpose: 'CRM opportunity sync' },
  { name: 'Microsoft Graph',  status: 'disconnected', purpose: 'Outlook calendar and email' },
];

export default function Settings() {
  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        subtitle="Configure custom fields, integrations, and AI providers."
      />

      <div className="p-6">
        <Tabs defaultValue="fields">
          <TabsList>
            <TabsTrigger value="fields">Custom fields</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="ai">AI provider</TabsTrigger>
            <TabsTrigger value="data">Data & retention</TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="pt-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Custom fields</CardTitle>
                  <p className="text-2xs text-ink-muted mt-0.5">Extend any object with additional metadata. Stored in a JSONB column per record.</p>
                </div>
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
                      <td className="px-4 py-2.5">
                        {f.options ? <div className="flex flex-wrap gap-1">{f.options.map(o => <Badge key={o} size="xs" tone="bg-line-subtle text-ink-muted">{o}</Badge>)}</div> : <span className="text-ink-subtle text-xs">—</span>}
                      </td>
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
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-ink">{int.name}</div>
                      <div className="text-xs text-ink-muted">{int.purpose}</div>
                    </div>
                    <Badge size="sm" tone={int.status === 'connected' ? 'bg-ok-bg text-ok' : 'bg-line-subtle text-ink-muted'}>{int.status}</Badge>
                    <Button variant="outline" size="sm">{int.status === 'connected' ? 'Configure' : 'Connect'}</Button>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>AI provider configuration</CardTitle>
                <Badge tone="bg-brand text-white" size="xs"><Sparkles size={9} /> AI</Badge>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <div className="text-2xs text-ink-muted uppercase tracking-wider font-medium mb-1.5">Active provider</div>
                  <div className="flex items-center gap-2">
                    <Badge tone="bg-brand-100 text-brand-800">Mock (development)</Badge>
                    <Button variant="outline" size="sm">Switch provider</Button>
                  </div>
                </div>
                <div className="border-t border-line pt-4">
                  <div className="text-2xs text-ink-muted uppercase tracking-wider font-medium mb-2">Available providers</div>
                  <div className="grid grid-cols-2 gap-2">
                    {['Anthropic Claude', 'OpenAI GPT', 'Google Gemini', 'OCI GenAI', 'Azure OpenAI', 'Local Ollama'].map(p => (
                      <div key={p} className="flex items-center justify-between border border-line rounded-sm px-3 py-2">
                        <span className="text-sm text-ink">{p}</span>
                        <Badge size="xs" tone="bg-line-subtle text-ink-muted">Not configured</Badge>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-ink-muted mt-3 leading-relaxed">
                    Swap providers in <code className="font-mono text-2xs bg-paper-sunken px-1 py-0.5 rounded-xs">src/lib/ai-extraction.ts</code>. The LLMProvider interface keeps your application code provider-agnostic.
                  </p>
                </div>
              </CardBody>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="pt-4">
            <Card>
              <CardHeader><CardTitle>Data & retention</CardTitle></CardHeader>
              <CardBody className="space-y-3">
                <Setting icon={<Database size={14} />} label="Primary store" value="PostgreSQL 16 (Prisma)" />
                <Setting icon={<Zap size={14} />} label="Cache" value="Redis 7" />
                <Setting icon={<Key size={14} />} label="Auth" value="Auth0 + RBAC" />
                <Setting icon={<SettingsIcon size={14} />} label="Transcript retention" value="365 days, then archived to S3" />
                <Setting icon={<SettingsIcon size={14} />} label="Audit log retention" value="7 years (compliance)" />
              </CardBody>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Setting({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-line last:border-0">
      <div className="h-8 w-8 rounded-sm bg-paper-sunken border border-line flex items-center justify-center text-ink-muted">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-ink-muted uppercase tracking-wider">{label}</div>
        <div className="text-sm text-ink">{value}</div>
      </div>
    </div>
  );
}
