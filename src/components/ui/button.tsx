import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'subtle';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClass: Record<Variant, string> = {
  primary:    'bg-brand text-white hover:bg-brand-800 active:bg-brand-900 disabled:bg-line-strong',
  secondary:  'bg-paper-sunken text-ink hover:bg-line border border-line',
  ghost:      'bg-transparent text-ink-soft hover:bg-line-subtle',
  outline:    'bg-paper-raised text-ink border border-line hover:border-ink-subtle hover:bg-paper-sunken',
  destructive:'bg-crit text-white hover:bg-rose-700',
  subtle:     'bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-100',
};

const sizeClass: Record<Size, string> = {
  sm:   'h-7 px-2.5 text-xs gap-1.5',
  md:   'h-8 px-3 text-sm gap-1.5',
  lg:   'h-10 px-4 text-sm gap-2',
  icon: 'h-8 w-8 p-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-sm whitespace-nowrap transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-1 focus-visible:ring-offset-paper',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClass[variant],
        sizeClass[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
