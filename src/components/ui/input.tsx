import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-8 px-2.5 text-sm bg-paper-raised border border-line rounded-sm w-full',
        'placeholder:text-ink-subtle',
        'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-100',
        'disabled:bg-paper-sunken disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'px-2.5 py-2 text-sm bg-paper-raised border border-line rounded-sm w-full font-sans',
        'placeholder:text-ink-subtle',
        'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-100',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-8 px-2 pr-8 text-sm bg-paper-raised border border-line rounded-sm cursor-pointer',
        'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-100',
        'appearance-none bg-no-repeat bg-right',
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' stroke='%236B6864' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundPosition: 'right 6px center',
        backgroundSize: '12px',
      }}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-xs font-medium text-ink-soft', className)} {...props} />;
}
