import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
}
const TabsContext = React.createContext<TabsContextValue | null>(null);

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [internal, setInternal] = React.useState(defaultValue);
  const v = value ?? internal;
  const set = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  return (
    <TabsContext.Provider value={{ value: v, setValue: set }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('inline-flex items-center gap-0 border-b border-line', className)} role="tablist">
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext)!;
  const active = ctx.value === value;
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => ctx.setValue(value)}
      className={cn(
        'px-3 h-9 text-sm font-medium tracking-tight border-b-2 -mb-px transition-colors',
        active ? 'text-ink border-brand' : 'text-ink-muted border-transparent hover:text-ink hover:border-line-strong',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext)!;
  if (ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}
