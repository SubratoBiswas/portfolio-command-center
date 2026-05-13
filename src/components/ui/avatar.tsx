import * as React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  initials: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  tone?: string;
  title?: string;
}

const sizeMap = {
  xs: 'h-5 w-5 text-2xs',
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

// stable color from initials
function hashTone(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const tones = [
    'bg-brand-100 text-brand-800',
    'bg-info-bg text-info',
    'bg-amber-100 text-amber-800',
    'bg-emerald-100 text-emerald-800',
    'bg-rose-100 text-rose-800',
    'bg-violet-100 text-violet-800',
  ];
  return tones[h % tones.length];
}

export function Avatar({ initials, size = 'md', className, tone, title }: AvatarProps) {
  return (
    <span
      title={title ?? initials}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold tracking-tight',
        sizeMap[size],
        tone || hashTone(initials),
        className
      )}
    >
      {initials}
    </span>
  );
}

export function AvatarStack({ items, size = 'sm', max = 4 }: { items: string[]; size?: 'xs' | 'sm' | 'md'; max?: number }) {
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;
  return (
    <div className="flex -space-x-1.5">
      {visible.map((init, i) => (
        <span key={i} className="ring-2 ring-paper-raised rounded-full">
          <Avatar initials={init} size={size} />
        </span>
      ))}
      {overflow > 0 && (
        <span className="ring-2 ring-paper-raised rounded-full">
          <Avatar initials={`+${overflow}`} size={size} tone="bg-line text-ink-muted" />
        </span>
      )}
    </div>
  );
}
