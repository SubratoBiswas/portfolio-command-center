import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { useMeetings, useTasks, useLookups } from '@/lib/hooks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date());
  const { data: meetings = [] } = useMeetings();
  const { data: tasks = [] } = useTasks();
  const { clientById, projectById } = useLookups();

  const { weeks, monthLabel } = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const startDayOfWeek = first.getDay();
    const totalDays = last.getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return { weeks, monthLabel: month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  }, [month]);

  function eventsOn(date: Date) {
    const dateStr = date.toISOString().slice(0, 10);
    const mtgs = (meetings as any[]).filter(m => m.scheduledAt?.slice(0, 10) === dateStr);
    const dues = (tasks as any[]).filter(t => t.dueDate?.slice(0, 10) === dateStr);
    return { mtgs, dues };
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader
        eyebrow="Planning"
        title="Calendar"
        subtitle="Meetings and task due dates across the portfolio."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setMonth(m => { const n = new Date(m); n.setMonth(n.getMonth() - 1); return n; })}>
              <ChevronLeft size={14} />
            </Button>
            <span className="text-sm font-medium text-ink min-w-[140px] text-center">{monthLabel}</span>
            <Button variant="ghost" size="sm" onClick={() => setMonth(m => { const n = new Date(m); n.setMonth(n.getMonth() + 1); return n; })}>
              <ChevronRight size={14} />
            </Button>
          </div>
        }
      />
      <div className="p-6">
        <Card>
          <div className="grid grid-cols-7 border-b border-line">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="py-2 text-center text-2xs font-medium text-ink-muted uppercase tracking-wider">{d}</div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-line last:border-0">
              {week.map((date, di) => {
                if (!date) return <div key={di} className="min-h-[100px] bg-paper-sunken/20 border-r border-line last:border-0" />;
                const dateStr = date.toISOString().slice(0, 10);
                const isToday = dateStr === today;
                const { mtgs, dues } = eventsOn(date);
                return (
                  <div key={di} className={cn('min-h-[100px] p-1.5 border-r border-line last:border-0 hover:bg-paper-sunken/30', isToday && 'bg-brand-100/20')}>
                    <div className={cn('text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full', isToday ? 'bg-brand text-white' : 'text-ink-muted')}>{date.getDate()}</div>
                    <div className="space-y-0.5">
                      {mtgs.map((m: any) => (
                        <div key={m.id} className="text-2xs bg-brand-100 text-brand-800 rounded px-1 py-0.5 truncate flex items-center gap-0.5">
                          <Video size={8} />{m.title}
                        </div>
                      ))}
                      {dues.map((t: any) => (
                        <div key={t.id} className="text-2xs bg-amber-100 text-amber-800 rounded px-1 py-0.5 truncate">
                          Due: {t.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
