import { useState } from 'react';
import { ShieldCheck, Search, Filter } from 'lucide-react';
import { useAuditLogs } from '@/lib/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { Input, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const actionTone: Record<string, string> = {
  created: 'bg-ok-bg text-ok',
  updated: 'bg-info-bg text-info',
  deleted: 'bg-crit-bg text-crit',
  extracted: 'bg-amber-100 text-amber-800',
  committed: 'bg-brand-100 text-brand-800',
};

const ENTITY_TYPES = [
  '', 'projects', 'products', 'opportunities', 'tasks', 'risks',
  'resources', 'clients', 'issues', 'decisions', 'capabilities',
  'allocations', 'meetings', 'transcripts', 'audit-logs',
];

const ACTIONS = ['', 'created', 'updated', 'deleted', 'extracted', 'committed'];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function AuditLog() {
  const [objectType, setObjectType] = useState('');
  const [action, setAction]         = useState('');
  const [skip, setSkip]             = useState(0);
  const take = 50;

  const { data, isLoading } = useAuditLogs({
    objectType: objectType || undefined,
    action: action || undefined,
    skip,
    take,
  });

  const logs: any[]  = data?.data  ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / take));
  const currentPage = Math.floor(skip / take) + 1;

  function prev() { if (skip > 0) setSkip(Math.max(0, skip - take)); }
  function next() { if (skip + take < total) setSkip(skip + take); }

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Audit Log"
        subtitle={isLoading ? 'Loading…' : total + ' events recorded'}
      />

      {/* Filters */}
      <div className="px-6 pt-2 pb-4 flex flex-wrap gap-3 items-center border-b border-line">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <Select
            value={objectType}
            onChange={e => { setObjectType(e.target.value); setSkip(0); }}
            className="pl-7 w-full text-sm"
          >
            {ENTITY_TYPES.map(t => (
              <option key={t} value={t}>{t === '' ? 'All entity types' : t}</option>
            ))}
          </Select>
        </div>
        <div className="relative flex items-center gap-1">
          <Filter size={12} className="text-ink-muted" />
          <Select
            value={action}
            onChange={e => { setAction(e.target.value); setSkip(0); }}
            className="w-36 text-sm"
          >
            {ACTIONS.map(a => (
              <option key={a} value={a}>{a === '' ? 'All actions' : a}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-line bg-paper-sunken">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Timestamp</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">User</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">IP Address</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Action</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Entity Type</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Object ID</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide w-1/4">User Agent</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-muted">Loading audit log…</td>
              </tr>
            )}
            {!isLoading && logs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-muted">
                  <div className="flex flex-col items-center gap-2">
                    <ShieldCheck size={28} className="text-ink-subtle" />
                    <span>No audit events recorded yet.</span>
                    <span className="text-xs text-ink-subtle">Events will appear here as users create, update, or delete records.</span>
                  </div>
                </td>
              </tr>
            )}
            {logs.map((log: any) => (
              <tr key={log.id} className="border-b border-line hover:bg-paper-sunken transition-colors">
                <td className="px-4 py-2.5 text-xs text-ink-muted font-mono whitespace-nowrap">
                  {formatDate(log.occurredAt)}
                </td>
                <td className="px-4 py-2.5">
                  <div className="text-xs font-medium text-ink">{log.userName ?? log.actorId ?? '—'}</div>
                  {log.userEmail && <div className="text-2xs text-ink-muted">{log.userEmail}</div>}
                </td>
                <td className="px-4 py-2.5 text-xs font-mono text-ink-muted">{log.ipAddress ?? '—'}</td>
                <td className="px-4 py-2.5">
                  <Badge className={cn('text-2xs', actionTone[log.action] ?? 'bg-line-subtle text-ink-muted')}>
                    {log.action}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 text-xs text-ink-soft">{log.objectType}</td>
                <td className="px-4 py-2.5 text-xs font-mono text-ink-muted max-w-[120px] truncate" title={log.objectId}>
                  {log.objectId}
                </td>
                <td className="px-4 py-2.5 text-2xs text-ink-subtle truncate max-w-[220px]" title={log.userAgent ?? ''}>
                  {log.userAgent ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > take && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-line text-xs text-ink-muted">
          <span>Page {currentPage} of {totalPages} · {total} total events</span>
          <div className="flex gap-2">
            <button
              onClick={prev}
              disabled={skip === 0}
              className="px-3 py-1 rounded border border-line hover:bg-paper-sunken disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <button
              onClick={next}
              disabled={skip + take >= total}
              className="px-3 py-1 rounded border border-line hover:bg-paper-sunken disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
