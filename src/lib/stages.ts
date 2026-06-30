// Shared AI pipeline stage definitions (used by Opportunities + Spreadsheet)
export const AI_STAGES = [
  { key: 'intro_sent',            label: 'Intro Sent',        num: '0',  group: 'outreach',   color: 'bg-slate-100 text-slate-500',     dot: 'bg-slate-400' },
  { key: 'interest_received',     label: 'Interest Received', num: '1',  group: 'outreach',   color: 'bg-blue-50 text-blue-600',        dot: 'bg-blue-300' },
  { key: 'reply_sent',            label: 'Reply Sent',        num: '2',  group: 'outreach',   color: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500' },
  { key: 'preworkshop_scheduled', label: 'Pre-Workshop',      num: '3',  group: 'workshop',   color: 'bg-blue-200 text-blue-800',       dot: 'bg-blue-600' },
  { key: 'pending_workshop',      label: 'Pending Workshop',  num: '4',  group: 'workshop',   color: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-400' },
  { key: 'workshop_scheduled',    label: 'Scheduled',         num: '5',  group: 'workshop',   color: 'bg-blue-200 text-blue-800',       dot: 'bg-blue-600' },
  { key: 'add_oracle',            label: 'Add Oracle',        num: '6',  group: 'workshop',   color: 'bg-blue-300 text-blue-900',       dot: 'bg-blue-700' },
  { key: 'workshop_executed',     label: 'Workshop Done',     num: '7',  group: 'executed',   color: 'bg-green-100 text-green-700',     dot: 'bg-green-500' },
  { key: 'not_interested',        label: 'Not Interested',    num: '8',  group: 'lost',       color: 'bg-slate-100 text-slate-500',     dot: 'bg-slate-400' },
  { key: 'enabling_ai',           label: 'Enabling AI',       num: '9',  group: 'commercial', color: 'bg-green-100 text-green-700',     dot: 'bg-green-500' },
  { key: 'negotiation_sow',       label: 'Negotiation / SOW', num: '10', group: 'commercial', color: 'bg-green-200 text-green-800',     dot: 'bg-green-600' },
  { key: 'deal_closed',           label: 'Deal Closed',       num: '11', group: 'won',        color: 'bg-green-300 text-green-900',     dot: 'bg-green-700' },
  { key: 'not_legit',             label: 'Not Legit',         num: '12', group: 'lost',       color: 'bg-slate-50 text-slate-400',      dot: 'bg-slate-300' },
] as const;
