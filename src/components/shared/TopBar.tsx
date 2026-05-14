import * as React from 'react';
import { Search, Bell, Command, Sparkles, ChevronRight } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getUser } from '@/lib/api';

interface TopBarProps {
  onOpenAssistant: () => void;
}

const routeLabels: Record<string, string> = {
  'command-center': 'Command Center',
  portfolio: 'Portfolio',
  products: 'Products',
  opportunities: 'Opportunities',
  projects: 'Projects',
  resources: 'Resources',
  capacity: 'Capacity',
  assignment: 'Assignment',
  locations: 'Locations',
  tasks: 'Tasks',
  calendar: 'Calendar',
  timeline: 'Timeline',
  intelligence: 'Intelligence',
  transcripts: 'Transcripts',
  risks: 'Risks & Issues',
  decisions: 'Decisions',
  dependencies: 'Dependencies',
  library: 'Library',
  capabilities: 'Capabilities',
  reports: 'Reports',
  settings: 'Settings',
};

function Breadcrumbs() {
  const loc = useLocation();
  const parts = loc.pathname.split('/').filter(Boolean);
  if (!parts.length) return null;
  return (
    <nav className="flex items-center gap-1 text-xs text-ink-muted">
      {parts.map((p, i) => {
        const path = '/' + parts.slice(0, i + 1).join('/');
        const isLast = i === parts.length - 1;
        const label = routeLabels[p] || p;
        return (
          <React.Fragment key={path}>
            {i > 0 && <ChevronRight size={12} className="text-ink-subtle" />}
            {isLast ? (
              <span className="text-ink font-medium">{label}</span>
            ) : (
              <Link to={path} className="hover:text-ink">{label}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export function TopBar({ onOpenAssistant }: TopBarProps) {
  return (
    <header className="h-14 shrink-0 border-b border-line bg-paper-raised/80 backdrop-blur flex items-center gap-3 px-5">
      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <div className="relative w-72">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            placeholder="Search portfolio, people, decisions…"
            className="h-8 w-full pl-8 pr-12 text-sm bg-paper-sunken border border-transparent hover:border-line rounded-sm focus:outline-none focus:bg-paper-raised focus:border-brand focus:ring-2 focus:ring-brand-100"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 text-2xs text-ink-muted bg-paper-raised border border-line rounded-xs px-1 py-0.5 font-mono">
            <Command size={9} /> K
          </kbd>
        </div>

        {/* AI assistant trigger */}
        <Button
          variant="subtle"
          size="md"
          onClick={onOpenAssistant}
          className="gap-1.5"
        >
          <Sparkles size={13} />
          <span>Chief of Staff</span>
          <Badge tone="bg-brand text-white" size="xs">AI</Badge>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <span className="relative inline-flex">
            <Bell size={15} />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-crit" />
          </span>
        </Button>

        {/* User */}
          {(() => {
          const user = getUser();
          const name = user?.name ?? 'Portfolio Lead';
          const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
          const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';
          return (
          <div className="pl-2 ml-1 border-l border-line flex items-center gap-2">
            <Avatar initials={initials} size="md" />
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-xs font-semibold text-ink">{name}</span>
              <span className="text-2xs text-ink-muted">{role}</span>
            </div>
          </div>
          );
        })()}
      </div>
    </header>
  );
}
