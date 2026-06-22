// @ts-nocheck
import { useState, useEffect } from 'react';
import { Upload, Sparkles, CheckCircle2, XCircle, Edit3, AlertTriangle, FileText, Loader2, ChevronRight, Lightbulb } from 'lucide-react';
import { useTranscripts, useLookups, useExtractionJobStatus } from '@/lib/hooks';
import { extractFromTranscript, SAMPLE_TRANSCRIPT } from '@/lib/ai-extraction';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea, Select, Label } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/PageHeader';
import { Avatar } from '@/components/ui/avatar';
import { cn, fmtRelative, fmtPct } from '@/lib/utils';
import { api, call, getUser } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BackendExtractionResult {
  actionItems: Array<{ title: string; assignee?: string; dueDate?: string; priority?: string; confidence: number }>;
  risks: Array<{ title: string; description: string; severity: string; confidence: number }>;
  decisions: Array<{ title: string; decision: string; rationale?: string; confidence: number }>;
  opportunities: Array<{ name: string; client?: string; value?: number; confidence: number }>;
  productIdeas: Array<{ name: string; description: string; confidence: number }>;
  dependencies: Array<{ from: string; to: string; kind: string; confidence: number }>;
  questions: Array<{ question: string; context?: string; confidence: number }>;
  executiveSummary: string;
  sentiment: string;
  urgencyScore: number;
}

// Add generated IDs to backend result items so review state tracking works
function addIds(result: BackendExtractionResult) {
  let i = 0;
  const id = () => `item-${i++}`;
  return {
    ...result,
    actionItems:  result.actionItems.map(x => ({ ...x, id: id() })),
    risks:        result.risks.map(x => ({ ...x, id: id() })),
    decisions:    result.decisions.map(x => ({ ...x, id: id() })),
    opportunities: result.opportunities.map(x => ({ ...x, id: id(), title: x.name })),
    productIdeas: result.productIdeas.map(x => ({ ...x, id: id(), title: x.name })),
    dependencies: result.dependencies.map(x => ({ ...x, id: id(), title: `${x.from} → ${x.to}` })),
    questions:    result.questions.map(x => ({ ...x, id: id(), title: x.question })),
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Transcripts() {
  const [text, setText] = useState(SAMPLE_TRANSCRIPT);
  const [provider, setProvider] = useState('mock');
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [savedTranscriptId, setSavedTranscriptId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<Record<string, 'pending' | 'accepted' | 'rejected'>>({});
  const [committing, setCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState<Record<string, number> | null>(null);
  const [pendingTranscriptId, setPendingTranscriptId] = useState<string | null>(null);
  const [pollingEnabled, setPollingEnabled] = useState(false);

  const { data: transcripts = [], isLoading } = useTranscripts();
  const { resourceById } = useLookups();
  const { data: jobStatus } = useExtractionJobStatus(pendingTranscriptId ?? '', pollingEnabled) as any;

  useEffect(() => {
    if (jobStatus?.status === 'succeeded' && jobStatus?.result) {
      const withIds = addIds(jobStatus.result as BackendExtractionResult);
      setResult(withIds);
      initReviewStatus(withIds);
      setPollingEnabled(false);
      setExtracting(false);
    } else if (jobStatus?.status === 'failed') {
      setPollingEnabled(false);
      setExtracting(false);
    }
  }, [jobStatus]);

  function initReviewStatus(r: any) {
    const init: Record<string, 'pending' | 'accepted' | 'rejected'> = {};
    const all = [
      ...(r.actionItems ?? []), ...(r.risks ?? []), ...(r.decisions ?? []),
      ...(r.opportunities ?? []), ...(r.productIdeas ?? []),
      ...(r.dependencies ?? []), ...(r.questions ?? []),
    ];
    all.forEach((it: any) => { init[it.id] = 'pending'; });
    setReviewStatus(init);
  }

  // ── Extract from inline editor ─────────────────────────────────────────────
  async function handleExtract() {
    setExtracting(true);
    setResult(null);
    setCommitResult(null);
    setSavedTranscriptId(null);
    try {
      if ((api as any).isLive) {
        // API mode: save transcript, then extract sync via backend
        const saved = await call<any>('POST', '/transcripts', {
          title: text.slice(0, 80).trim() + (text.length > 80 ? '…' : ''),
          rawText: text,
          status: 'uploaded',
          uploadedAt: new Date().toISOString(),
          uploadedBy: getUser()?.id ?? null,
        });
        setSavedTranscriptId(saved.id);
        const res = await call<{ job: any; result: BackendExtractionResult }>(
          'POST', `/transcripts/${saved.id}/extract`, { provider, sync: true },
        );
        const withIds = addIds(res.result);
        setResult(withIds);
        initReviewStatus(withIds);
      } else {
        // Mock mode: use frontend extractor
        const r = await extractFromTranscript(text, provider);
        setResult(r);
        const init: Record<string, 'pending' | 'accepted' | 'rejected'> = {};
        [...r.actionItems, ...r.risks, ...r.decisions, ...r.opportunities,
          ...r.dependencies, ...r.questions, ...r.productIdeas].forEach(it => { init[it.id] = 'pending'; });
        setReviewStatus(init);
      }
    } finally {
      setExtracting(false);
    }
  }

  // ── Re-extract a saved transcript ─────────────────────────────────────────
  async function handleExtractTranscript(transcriptId: string) {
    setPendingTranscriptId(transcriptId);
    setSavedTranscriptId(transcriptId);
    setExtracting(true);
    setCommitResult(null);
    if ((api as any).isLive) {
      await (api as any).transcripts.extract(transcriptId, provider);
      setPollingEnabled(true);
    } else {
      const tx = (transcripts as any[]).find(t => t.id === transcriptId);
      if (tx) {
        const r = await extractFromTranscript(tx.rawText, provider);
        setResult(r);
        initReviewStatus(r);
      }
      setExtracting(false);
    }
  }

  // ── Commit accepted items ──────────────────────────────────────────────────
  async function handleCommit() {
    if (!(api as any).isLive) {
      alert('Connect to the live API to commit extracted data to the database.');
      return;
    }
    if (!savedTranscriptId) {
      alert('Please extract the transcript first to get a saved ID.');
      return;
    }

    const user = getUser();
    if (!user?.id) { alert('Cannot determine logged-in user.'); return; }

    setCommitting(true);
    try {
      // Filter accepted items back to backend shape
      const accepted = (items: any[], nameField = 'title') =>
        (items ?? []).filter(it => reviewStatus[it.id] === 'accepted');

      const payload: Record<string, any> = {
        defaultOwnerId: user.id,
        actionItems:   accepted(result?.actionItems).map(({ title, dueDate, priority, confidence }) => ({ title, dueDate, priority, confidence })),
        risks:         accepted(result?.risks).map(({ title, description, severity, confidence }) => ({ title, description: description ?? title, severity: severity ?? 'medium', confidence })),
        decisions:     accepted(result?.decisions).map(({ title, decision, rationale, confidence }) => ({ title, decision: decision ?? title, rationale, confidence })),
        opportunities: accepted(result?.opportunities).map(({ name, title, client, value, confidence }) => ({ name: name ?? title, client, value, confidence })),
        productIdeas:  accepted(result?.productIdeas).map(({ name, title, description, confidence }) => ({ name: name ?? title, description: description ?? '', confidence })),
      };

      const res = await (api as any).transcripts.commit(savedTranscriptId, payload);
      setCommitResult(res.created ?? res);
    } catch (e: any) {
      alert(`Commit failed: ${e.message}`);
    } finally {
      setCommitting(false);
    }
  }

  function toggle(id: string) {
    setReviewStatus(prev => ({
      ...prev,
      [id]: prev[id] === 'accepted' ? 'rejected' : prev[id] === 'rejected' ? 'pending' : 'accepted',
    }));
  }

  const acceptedCount = Object.values(reviewStatus).filter(s => s === 'accepted').length;
  const confidenceTone = (c: number) => c >= 0.8 ? 'text-ok' : c >= 0.6 ? 'text-amber-700' : 'text-crit';
  const statusIcon = (s: string) =>
    s === 'accepted' ? <CheckCircle2 size={14} className="text-ok" /> :
    s === 'rejected' ? <XCircle size={14} className="text-crit" /> :
    <ChevronRight size={14} className="text-ink-muted" />;

  function ExtractionSection({ title, items, icon }: { title: string; items: any[]; icon: React.ReactNode }) {
    if (!items?.length) return null;
    return (
      <div>
        <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2 flex items-center gap-1">
          {icon} {title} ({items.length})
        </h4>
        <div className="space-y-1.5">
          {items.map((item: any) => (
            <div
              key={item.id}
              className={cn(
                'flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer hover:bg-paper-sunken/60 transition-colors',
                reviewStatus[item.id] === 'accepted' ? 'border-ok bg-ok-bg/30' :
                reviewStatus[item.id] === 'rejected' ? 'border-line bg-paper-sunken/30 opacity-50' :
                'border-line bg-paper',
              )}
              onClick={() => toggle(item.id)}
            >
              <div className="mt-0.5 shrink-0">{statusIcon(reviewStatus[item.id])}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ink leading-snug">
                  {item.title ?? item.question ?? item.name ?? item.from}
                </p>
                {item.description && <p className="text-2xs text-ink-muted mt-0.5">{item.description}</p>}
                {item.client && <p className="text-2xs text-ink-muted mt-0.5">Client: {item.client}</p>}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {item.priority && <Badge className="text-2xs bg-line-subtle text-ink-muted">{item.priority}</Badge>}
                  {item.severity && <Badge className="text-2xs bg-amber-100 text-amber-800">{item.severity}</Badge>}
                  {item.value && <span className="text-2xs text-ink-muted">${(item.value / 1000).toFixed(0)}k</span>}
                  {item.dueDate && <span className="text-2xs text-ink-muted">Due: {item.dueDate}</span>}
                  {item.assignee && <span className="text-2xs text-ink-muted">→ {item.assignee}</span>}
                  <span className={cn('text-2xs font-medium ml-auto', confidenceTone(item.confidence))}>
                    {fmtPct(item.confidence * 100)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Meeting Transcripts"
        subtitle="Upload a transcript and let the AI extract action items, risks, decisions, and opportunities for human review before committing."
      />
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left: editor + saved transcripts ── */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Upload size={14} /> Paste or upload transcript</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="space-y-1">
                <Label>Provider</Label>
                <Select value={provider} onChange={e => setProvider(e.target.value)} className="text-xs w-40">
                  <option value="mock">Mock (no API key)</option>
                  <option value="anthropic">Anthropic Claude</option>
                </Select>
              </div>
              <Textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={12}
                className="font-mono text-xs resize-none"
                placeholder="Paste meeting transcript here…"
              />
              <Button variant="primary" className="w-full" onClick={handleExtract} disabled={extracting || !text.trim()}>
                {extracting
                  ? <><Loader2 size={13} className="animate-spin" /> Extracting…</>
                  : <><Sparkles size={13} /> Extract intelligence</>}
              </Button>
            </CardBody>
          </Card>

          {/* Saved transcripts */}
          {!isLoading && (transcripts as any[]).length > 0 && (
            <Card>
              <CardHeader><CardTitle>Saved transcripts</CardTitle></CardHeader>
              <ul className="divide-y divide-line">
                {(transcripts as any[]).map((tx: any) => {
                  const uploader = resourceById(tx.uploadedBy);
                  const statusTone: Record<string, string> = {
                    uploaded: 'bg-line-subtle text-ink-muted',
                    processing: 'bg-info-bg text-info',
                    extracted: 'bg-amber-100 text-amber-800',
                    reviewed: 'bg-brand-100 text-brand-800',
                    committed: 'bg-ok-bg text-ok',
                  };
                  return (
                    <li key={tx.id} className="px-4 py-3 hover:bg-paper-sunken/40">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText size={12} className="text-ink-muted" />
                        <span className="text-xs font-medium text-ink flex-1">{tx.title}</span>
                        <Badge className={statusTone[tx.status] ?? ''}>{tx.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        {uploader && (
                          <span className="text-2xs text-ink-muted flex items-center gap-1">
                            <Avatar initials={(uploader as any).initials} size="xs" />{(uploader as any).name}
                          </span>
                        )}
                        <span className="text-2xs text-ink-muted">{fmtRelative(tx.uploadedAt)}</span>
                        {['uploaded', 'extracted'].includes(tx.status) && (
                          <Button variant="ghost" size="sm" className="ml-auto text-2xs" onClick={() => handleExtractTranscript(tx.id)}>
                            <Sparkles size={10} /> Re-extract
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>

        {/* ── Right: extraction results ── */}
        <div>
          {!result && !extracting && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-line rounded-xl">
              <Sparkles size={32} className="text-brand-300 mb-3" />
              <p className="text-sm font-medium text-ink-muted">AI extraction results appear here</p>
              <p className="text-xs text-ink-muted/70 mt-1">Paste a transcript and click Extract</p>
            </div>
          )}

          {extracting && !result && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <Loader2 size={32} className="text-brand-700 animate-spin mb-3" />
              <p className="text-sm font-medium text-ink-muted">
                {pollingEnabled ? 'Processing async job…' : 'Extracting intelligence…'}
              </p>
              {pollingEnabled && <p className="text-xs text-ink-muted/70 mt-1">Polling every 2 seconds</p>}
            </div>
          )}

          {result && (
            <Card className="overflow-y-auto max-h-[calc(100vh-200px)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles size={14} className="text-brand-700" /> Extraction results
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={
                    result.sentiment === 'positive' ? 'bg-ok-bg text-ok' :
                    result.sentiment === 'negative' ? 'bg-crit-bg text-crit' :
                    'bg-amber-100 text-amber-800'
                  }>{result.sentiment}</Badge>
                  <span className="text-2xs text-ink-muted">Urgency: {fmtPct(result.urgencyScore * 100)}</span>
                </div>
              </CardHeader>
              <CardBody className="space-y-5">
                {result.executiveSummary && (
                  <p className="text-xs text-ink-muted italic border-l-2 border-brand-300 pl-3">
                    {result.executiveSummary}
                  </p>
                )}

                <p className="text-2xs text-ink-muted">Click items to accept ✓ or reject ✗ before committing.</p>

                <ExtractionSection title="Action Items"  items={result.actionItems}  icon={<CheckCircle2 size={12} />} />
                <ExtractionSection title="Risks"         items={result.risks}         icon={<AlertTriangle size={12} />} />
                <ExtractionSection title="Decisions"     items={result.decisions}     icon={<Edit3 size={12} />} />
                <ExtractionSection title="Opportunities" items={result.opportunities} icon={<ChevronRight size={12} />} />
                <ExtractionSection title="Product Ideas" items={result.productIdeas}  icon={<Lightbulb size={12} />} />
                <ExtractionSection title="Open Questions" items={result.questions}    icon={<ChevronRight size={12} />} />

                {/* Commit result summary */}
                {commitResult && (
                  <div className="rounded-lg bg-ok-bg border border-ok p-3 space-y-1">
                    <p className="text-xs font-semibold text-ok flex items-center gap-1"><CheckCircle2 size={12} /> Committed successfully!</p>
                    {Object.entries(commitResult).filter(([, v]) => (v as number) > 0).map(([k, v]) => (
                      <p key={k} className="text-2xs text-ink-muted">• {k}: {v as number}</p>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-line flex items-center justify-between">
                  <span className="text-xs text-ink-muted">{acceptedCount} accepted</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCommit}
                    disabled={acceptedCount === 0 || committing}
                  >
                    {committing
                      ? <><Loader2 size={13} className="animate-spin" /> Committing…</>
                      : <><CheckCircle2 size={13} /> Commit {acceptedCount} accepted</>}
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
