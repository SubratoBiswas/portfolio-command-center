import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: string;
  size?: 'xs' | 'sm';
}

export function Badge({ className, tone, size = 'sm', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-xs font-medium tracking-tight whitespace-nowrap',
        size === 'xs' ? 'text-2xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5',
        tone || 'bg-line-subtle text-ink-muted',
        className
      )}
      {...props}
    />
  );
}
