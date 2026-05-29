import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Dialog({ open, onOpenChange, children, maxWidth = 'max-w-lg' }: DialogProps) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onOpenChange(false); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={() => onOpenChange(false)} />
      <div className={cn('relative bg-paper-raised border border-line rounded-md shadow-pop w-full', maxWidth)}>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ title, description, onClose }: { title: string; description?: string; onClose: () => void }) {
  return (
    <div className="px-5 py-4 border-b border-line flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {description && <p className="text-xs text-ink-muted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded-sm hover:bg-line-subtle text-ink-muted hover:text-ink transition-colors shrink-0"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function DialogBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-5 overflow-y-auto max-h-[70vh]', className)}>{children}</div>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-3 border-t border-line flex items-center justify-end gap-2 shrink-0">{children}</div>;
}

export function Field({
  label, required, children, hint,
}: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-ink-soft block">
        {label}{required && <span className="text-crit ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-2xs text-ink-muted mt-0.5">{hint}</p>}
    </div>
  );
}

export function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}
