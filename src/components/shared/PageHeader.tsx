import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, eyebrow, actions, meta, className }: PageHeaderProps) {
  return (
    <div className={cn('px-6 py-5 border-b border-line bg-paper-raised/60', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="text-2xs uppercase tracking-widest text-ink-muted font-medium mb-1.5">{eyebrow}</p>
          )}
          <h1 className="text-xl font-semibold text-ink tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-ink-muted mt-1 max-w-2xl">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {meta && <div className="mt-3">{meta}</div>}
    </div>
  );
}

export function SectionHeader({ title, action, className }: { title: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-3', className)}>
      <h2 className="text-xs uppercase tracking-widest text-ink-muted font-semibold">{title}</h2>
      {action}
    </div>
  );
}
