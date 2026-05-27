import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ragChip, statusLabel, statusTone, priorityLabel, priorityTone, severityTone } from '@/lib/utils';
import type { Status, Priority, Severity, RAG } from '@/lib/types';

export function StatusBadge({ status }: { status: Status }) {
  return <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge tone={priorityTone[priority]} size="xs">{priorityLabel[priority]}</Badge>;
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Badge tone={severityTone[severity]}>{severity}</Badge>;
}

export function RagBadge({ rag }: { rag: RAG }) {
  return <Badge tone={ragChip[rag]}>{rag.toUpperCase()}</Badge>;
}

export function RagDot({ rag, className }: { rag: RAG; className?: string }) {
  const map = { green: 'bg-ok', yellow: 'bg-amber-400', orange: 'bg-orange-500', red: 'bg-crit' };
  return <span className={cn('inline-block h-2 w-2 rounded-full', map[rag], className)} />;
}
