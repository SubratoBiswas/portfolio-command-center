import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: 'right' | 'left';
  width?: string;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, side = 'right', width = 'w-[480px]', children }: SheetProps) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onOpenChange(false); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-ink/20 backdrop-blur-[1px]"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          'absolute top-0 bottom-0 bg-paper-raised shadow-pop flex flex-col',
          side === 'right' ? 'right-0' : 'left-0',
          width
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ title, onClose, children }: { title: string; onClose: () => void; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-line">
      <div>
        <h3 className="text-sm font-semibold text-ink tracking-tight">{title}</h3>
        {children}
      </div>
      <button onClick={onClose} className="p-1 rounded-sm hover:bg-line-subtle text-ink-muted">
        <X size={16} />
      </button>
    </div>
  );
}

export function SheetBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex-1 overflow-y-auto scrollbar-thin', className)}>{children}</div>;
}

export function SheetFooter({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-3 border-t border-line bg-paper-sunken/40 flex items-center justify-end gap-2">{children}</div>;
}
