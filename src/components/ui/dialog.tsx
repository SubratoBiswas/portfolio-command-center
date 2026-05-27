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
      <div className={cn('relative bg-paper-raised border border-line rounded-md shadow-pop w-full flex flex-col max-h-[90vh]', maxWidth)}>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ title, description, onClose }: { title: string; description?: string; onClose: () => void }) {
  return (
    <div className="shrink-0 px-5 py-4 border-b border-line flex items-start justify-between gap-3 bg-paper-raised rounded-t-md">
      <div>
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {description && <p className="text-xs text-ink-muted mt-0.5">{description}</p>}
      </div>
      <button onClick={onClose} className="p-1 rounded-sm hover:bg-line-subtle text-ink-muted"><X size={16} /></button>
    </div>
  );
}

export function DialogBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex-1 overflow-y-auto p-5 space-y-4', className)}>{children}</div>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="shrink-0 px-5 py-3 border-t border-line flex items-center justify-end gap-2 bg-paper-raised rounded-b-md">{children}</div>;
}

export function Field({ label, children, className, required, hint }: {
  label: string; children: React.ReactNode; className?: string; required?: boolean; hint?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="text-xs font-medium text-ink-muted flex items-center gap-1">
        {label}
        {required && <span className="text-blue-500">*</span>}
        {hint && <span className="font-normal text-ink-subtle">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

export function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}