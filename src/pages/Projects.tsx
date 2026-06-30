import { useMemo } from 'react';
import { FolderKanban } from 'lucide-react';
import { api } from '@/lib/api';
import { useClients, useResources } from '@/lib/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { SheetGrid, type SheetDef } from '@/pages/Spreadsheet';

const STATUS_OPTS = [
  { value: 'not_started', label: 'Not started', color: 'bg-slate-100 text-slate-600' },
  { value: 'planning', label: 'Planning', color: 'bg-blue-50 text-blue-600' },
  { value: 'in_progress', label: 'In progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'on_track', label: 'On track', color: 'bg-green-100 text-green-700' },
  { value: 'on_hold', label: 'On hold', color: 'bg-amber-100 text-amber-800' },
  { value: 'blocked', label: 'Blocked', color: 'bg-red-100 text-red-700' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
  { value: 'done', label: 'Done', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-slate-100 text-slate-500' },
];
const RAG_OPTS = [
  { value: 'green', label: 'GREEN', color: 'bg-green-100 text-green-700' },
  { value: 'yellow', label: 'YELLOW', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'orange', label: 'ORANGE', color: 'bg-orange-100 text-orange-700' },
  { value: 'red', label: 'RED', color: 'bg-red-100 text-red-700' },
];

export default function Projects() {
  const { data: clients = [] } = useClients();
  const { data: resources = [] } = useResources();

  const sheet: SheetDef = useMemo(() => ({
    key: 'projects',
    label: 'Projects',
    icon: <FolderKanban size={13} />,
    queryKey: ['projects'],
    list: () => api.projects.list() as Promise<any[]>,
    create: api.projects.create,
    update: api.projects.update,
    remove: api.projects.delete,
    newRow: () => ({
      name: 'New project', code: 'TX-NEW-' + Date.now(), type: 'delivery',
      charter: '', scope: '', status: 'not_started', rag: 'green',
      startDate: new Date().toISOString(), endDate: new Date(Date.now() + 60 * 86400000).toISOString(),
      budget: 0, resourceIds: [],
      clientId: (clients as any[])[0]?.id ?? 'c-roku',
      ownerId: (resources as any[])[0]?.id ?? 'r-viral',
    }),
    columns: [
      { key: 'code', label: 'Code', type: 'text', width: 140 },
      { key: 'name', label: 'Project', type: 'text', width: 210 },
      { key: 'clientId', label: 'Client', type: 'select', width: 150, options: (clients as any[]).map((c) => ({ value: c.id, label: c.name })) },
      { key: 'ownerId', label: 'Owner', type: 'select', width: 160, options: (resources as any[]).map((r) => ({ value: r.id, label: r.name })) },
      { key: 'status', label: 'Status', type: 'select', width: 140, options: STATUS_OPTS },
      { key: 'rag', label: 'RAG', type: 'select', width: 110, options: RAG_OPTS },
      { key: 'startDate', label: 'Start', type: 'date', width: 120 },
      { key: 'endDate', label: 'End', type: 'date', width: 120 },
      { key: 'budget', label: 'Budget', type: 'currency', width: 120 },
    ],
  }), [clients, resources]);

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        subtitle="Editable grid — click any cell to edit, add or delete rows. Saves to the live database."
      />
      <div className="p-6">
        <SheetGrid def={sheet} enabled />
      </div>
    </div>
  );
}
