import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Briefcase, Boxes, Target, FolderKanban, Users, MapPin, GitBranch,
  ListTodo, Calendar, GanttChart, FileText, AlertTriangle, Gavel, Network, Wrench,
  BarChart3, Settings as SettingsIcon, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    items: [
      { to: '/command-center', label: 'Command Center', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Portfolio',
    items: [
      { to: '/portfolio',     label: 'Portfolio',     icon: Briefcase },
      { to: '/products',      label: 'Products',      icon: Boxes },
      { to: '/opportunities', label: 'Opportunities', icon: Target },
      { to: '/projects',      label: 'Projects',      icon: FolderKanban },
    ],
  },
  {
    title: 'Resources',
    items: [
      { to: '/resources/capacity',   label: 'Capacity',    icon: Users },
      { to: '/resources/assignment', label: 'Assignment',  icon: GitBranch },
      { to: '/resources/locations',  label: 'Locations',   icon: MapPin },
    ],
  },
  {
    title: 'Execution',
    items: [
      { to: '/tasks',    label: 'Tasks',    icon: ListTodo },
      { to: '/calendar', label: 'Calendar', icon: Calendar },
      { to: '/timeline', label: 'Timeline', icon: GanttChart },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { to: '/intelligence/transcripts',  label: 'Transcripts',   icon: FileText },
      { to: '/intelligence/risks',        label: 'Risks & Issues', icon: AlertTriangle },
      { to: '/intelligence/decisions',    label: 'Decisions',     icon: Gavel },
      { to: '/intelligence/dependencies', label: 'Dependencies',  icon: Network },
    ],
  },
  {
    title: 'Library',
    items: [
      { to: '/library/capabilities', label: 'Capabilities', icon: Wrench },
    ],
  },
  {
    items: [
      { to: '/reports',  label: 'Reports',  icon: BarChart3 },
      { to: '/settings', label: 'Settings', icon: SettingsIcon },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-line bg-paper-raised/60 flex flex-col">
      {/* Brand */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-line">
        <div className="h-7 w-7 rounded-sm bg-brand flex items-center justify-center shadow-card">
          <Sparkles className="text-white" size={14} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-ink tracking-tight">Command Center</div>
          <div className="text-2xs text-ink-muted">Trinamix Portfolio</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {sections.map((sec, idx) => (
          <div key={idx} className="mb-4">
            {sec.title && (
              <div className="px-2.5 mb-1 text-2xs uppercase tracking-widest text-ink-subtle font-semibold">
                {sec.title}
              </div>
            )}
            <ul className="space-y-0.5">
              {sec.items.map(item => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 px-2.5 py-1.5 rounded-sm text-sm',
                        'transition-colors',
                        isActive
                          ? 'bg-brand-50 text-brand-900 font-medium'
                          : 'text-ink-soft hover:bg-paper-sunken hover:text-ink'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={15} className={isActive ? 'text-brand' : 'text-ink-muted'} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-line text-2xs text-ink-muted">
        <div className="flex items-center justify-between">
          <span>v0.1.0 · alpha</span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-ok pulse-dot" />
            Connected
          </span>
        </div>
      </div>
    </aside>
  );
}
