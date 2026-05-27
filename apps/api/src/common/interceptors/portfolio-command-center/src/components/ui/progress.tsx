import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number; // 0..100
  className?: string;
  trackClassName?: string;
  barClassName?: string;
  showLabel?: boolean;
}

export function Progress({ value, className, trackClassName, barClassName, showLabel }: ProgressProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('w-full flex items-center gap-2', className)}>
      <div className={cn('flex-1 h-1.5 bg-line rounded-full overflow-hidden', trackClassName)}>
        <div
          className={cn('h-full bg-brand rounded-full transition-all', barClassName)}
          style={{ width: `${v}%` }}
        />
      </div>
      {showLabel && <span className="text-2xs num text-ink-muted tabular-nums w-9 text-right">{v.toFixed(0)}%</span>}
    </div>
  );
}
