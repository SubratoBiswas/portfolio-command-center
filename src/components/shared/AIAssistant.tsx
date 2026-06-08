// @ts-nocheck
import * as React from 'react';
import { Sparkles, Send, Loader2, User, Bot, X } from 'lucide-react';
import { Sheet, SheetHeader, SheetBody } from '@/components/ui/sheet';
import { call } from '@/lib/api';

interface AIAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_PROMPTS = [
  'What projects are at risk right now?',
  'Which deals are stale or need follow-up?',
  'Show me overallocated resources',
  'What decisions are pending review?',
  'Summarize the portfolio health',
  'Which opportunities have the highest value?',
];

export function AIAssistant({ open, onOpenChange }: AIAssistantProps) {
  const [draft, setDraft] = React.useState('');
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your Chat Assistant AI. I have access to your live portfolio data — projects, opportunities, risks, resources, and more. Ask me anything!",
    },
  ]);
  const [loading, setLoading] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text?: string) {
    const msg = (text ?? draft).trim();
    if (!msg || loading) return;
    setDraft('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const res = await call<{ reply: string }>('POST', '/chat', { message: msg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} side="right" width="w-[420px]">
      <SheetHeader
        title={
          <span className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </span>
            Chat Assistant AI
          </span>
        }
        onClose={() => onOpenChange(false)}
      />
      <SheetBody className="flex flex-col h-full p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.role === 'assistant' ? 'bg-brand-100' : 'bg-ink-muted'}`}>
                {m.role === 'assistant'
                  ? <Bot size={13} className="text-brand-700" />
                  : <User size={13} className="text-white" />}
              </div>
              <div className={`max-w-[300px] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                m.role === 'assistant'
                  ? 'bg-paper-sunken text-ink'
                  : 'bg-brand-600 text-white'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                <Bot size={13} className="text-brand-700" />
              </div>
              <div className="bg-paper-sunken rounded-xl px-3 py-2">
                <Loader2 size={14} className="animate-spin text-ink-muted" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <p className="text-2xs text-ink-muted mb-2">Suggested questions</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="text-2xs px-2 py-1 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-line">
          <div className="flex gap-2">
            <input
              className="flex-1 text-sm border border-line rounded-lg px-3 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Ask about your portfolio…"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              disabled={loading}
            />
            <button
              onClick={() => send()}
              disabled={!draft.trim() || loading}
              className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </SheetBody>
    </Sheet>
  );
}
