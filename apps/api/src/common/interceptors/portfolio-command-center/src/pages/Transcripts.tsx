import { useState, useEffect } from 'react';
import { Upload, Sparkles, CheckCircle2, XCircle, Edit3, AlertTriangle, FileText, Loader2, ChevronRight } from 'lucide-react';
import { useTranscripts, useLookups, useExtractTranscript, useCommitTranscript, useExtractionJobStatus } from '@/lib/hooks';
import { extractFromTranscript, SAMPLE_TRANSCRIPT, type ExtractionResult } from '@/lib/ai-extraction';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea, Select, Label } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { Avatar } from '@/components/ui/avatar';
import { cn, fmtRelative, fmtPct } from '@/lib/utils';
import { api } from '@/lib/api';

export default function Transcripts() {
  const [text, setText] = useState(SAMPLE_TRANSCRIPT);
  const [provider, setProvider] = useState('mock');
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [reviewStatus, setReviewStatus] = useState<Record<string, 'pending' | 'accepted' | 'rejected'>>({});
  // For async job polling
  const [pendingTranscriptId, setPendingTranscriptId] = useState<string | null>(null);
  const [pollingEnabled, setPollingEnabled] = useState(false);

  const { data: transcripts = [], isLoading } = useTranscripts();
  const { resourceById } = useLookups();
  const { data: jobStatus } = useExtractionJobStatus(pendingTranscriptId ?? '', pollingEnabled) as any;

  // When async job completes, pull result into state
  useEffect(() => {
    if (jobStatus?.status === 'succeeded' && jobStatus?.result) {
      setResult(jobStatus.result as ExtractionResult);
      const init: Record<string, 'pending' | 'accepted' | 'rejected'> = {};
      const r = jobStatus.result as any;
      [...(r.actionItems ?? []), ...(r.risks ?? []), ...(r.decisions ?? []), ...(r.opportunities ?? [])].forEach((it: any, i: number) => {
        init[`${i}`] = 'pending';
      });
      setReviewStatus(init);
      setPollingEnabled(false);
      setExtracting(false);
    } else if (jobStatus?.status === 'failed') {
      setPollingEnabled(false);
      setExtracting(false);
    }
  }, [jobStatus]);

  async function handleExtract() {
    setExtracting(true);
    setResult(null);
    try {
      // Always use frontend mock extraction for the demo text editor
      const r = await extractFromTranscript(text, provider);
      setResult(r);
      const init: Record<string, 'pending' | 'accepted' | 'rejected'> = {};
      [...r.actionItems, ...r.risks, ...r.decisions, ...r.opportunities, ...r.dependencies, ...r.questions, ...r.productIdeas].forEach(it => {
        init[it.id] = 'pending';
      });
      setReviewStatus(init);
    } finally {
      setExtracting(false);
    }
  }

  async function handleExtractTranscript(transcriptId: string) {
    setPendingTranscriptId(transcriptId);
    setExtracting(true);
    if (api.isLive) {
      // Async path: enqueue and poll
      await api.transcripts.extract(transcriptId, provider);
      setPollingEnabled(true);
    } else {
      // Mock path: local extraction
      const tx = (transcripts as any[]).find(t => t.id === transcriptId);
      if (tx) {
        const r = await extractFromTranscript(tx.rawText, provider);
        setResult(r);
        const init: Record<string, 'pending' | 'accepted' | 'rejected'> = {};
        [...r.actionItems, ...r.risks, ...r.decisions, ...r.opportunities, ...r.dependencies, ...r.questions, ...r.productIdeas].forEach(it => { init[it.id] = 'pending'; });
        setReviewStatus(init);
      }
      setExtracting(false);
    }
  }

  function toggle(id: string) {
    setReviewStatus(prev => ({
      ...prev,
      [id]: prev[id] === 'accepted' ? 'rejected' : prev[id] === 'rejected' ? 'pending' : 'accepted',
    }));
  }

  const confidenceTone = (c: number) => c >= 0.8 ? 'text-ok' : c >= 0.6 ? 'text-amber-700' : 'text-crit';
  const statusIcon = (s: string) => s === 'accepted' ? <CheckCircle2 size={14} className="text-ok" /> : s === 'rejected' ? <XCircle size={14} className="text-crit" /> : <ChevronRight size={14} className="text-ink-muted" />;

  function ExtractionSection({ title, items, icon }: { title: string; items: any[]; icon: React.ReactNode }) {
    if (!items?.length) return null;
    return (
      <div>
        <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2 flex items-center gap-1">{icon} {title} ({items.length})</h4>
        <div className="space-y-1.5">
          {items.map((item: any) => (
            <div key={item.id} className={cn('flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer hover:bg-paper-sunken/60 transition-colors',
              reviewStatus[item.id] === 'accepted' ? 'border-ok bg-ok-bg/30' : reviewStatus[item.id] === 'rejected' ? 'border-line bg-paper-sunken/30 opacity-50' : 'border-line bg-paper'
            )} onClick={() => toggle(item.id)}>
              <div className="mt-0.5 shrink-0">{statusIcon(reviewStatus[item.id])}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ink leading-snug">{item.title ?? item.question ?? item.name ?? item.from}</p>
                {item.description && <p className="text-2xs text-ink-muted mt-0.5">{item.description}</p>}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {item.priority && <Badge className="text-2xs bg-line-subtle text-ink-muted">{item.priority}</Badge>}
                  {item.severity && <Badge className="text-2xs bg-amber-100 text-amber-800">{item.severity}</Badge>}
                  {item.dueDate && <span className="text-2xs text-ink-muted">Due: {item.dueDate}</span>}
                  {item.assignee && <span className="text-2xs text-ink-muted">→ {item.assignee}</span>}
                  <span className={cn('text-2xs font-medium ml-auto', confidenceTone(item.confidence))}>{fmtPct(item.confidence * 100)}</span>
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
        {/* Left: editor + existing transcripts */}
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
              <Textarea value={text} onChange={e => setText(e.target.value)} rows={12} className="font-mono text-xs resize-none" placeholder="Paste meeting transcript here…" />
              <Button variant="primary" className="w-full" onClick={handleExtract} disabled={extracting || !text.trim()}>
                {extracting ? <><Loader2 size={13} className="animate-spin" /> Extracting…</> : <><Sparkles size={13} /> Extract intelligence</>}
              </Button>
            </CardBody>
          </Card>

          {/* Existing transcripts */}
          {!isLoading && (transcripts as any[]).length > 0 && (
            <Card>
              <CardHeader><CardTitle>Saved transcripts</CardTitle></CardHeader>
              <ul className="divide-y divide-line">
                {(transcripts as any[]).map((tx: any) => {
                  const uploader = resourceById(tx.uploadedBy);
                  const statusTone: Record<string, string> = {
                    uploaded: 'bg-line-subtle text-ink-muted', processing: 'bg-info-bg text-info',
                    extracted: 'bg-amber-100 text-amber-800', reviewed: 'bg-brand-100 text-brand-800', committed: 'bg-ok-bg text-ok',
                  };
                  return (
                    <li key={tx.id} className="px-4 py-3 hover:bg-paper-sunken/40">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText size={12} className="text-ink-muted" />
                        <span className="text-xs font-medium text-ink flex-1">{tx.title}</span>
                        <Badge className={statusTone[tx.status] ?? ''}>{tx.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        {uploader && <span className="text-2xs text-ink-muted flex items-center gap-1"><Avatar initials={(uploader as any).initials} size="xs" />{(uploader as any).name}</span>}
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

        {/* Right: extraction results */}
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
                <CardTitle className="flex items-center gap-2"><Sparkles size={14} className="text-brand-700" /> Extraction results</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={result.sentiment === 'positive' ? 'bg-ok-bg text-ok' : result.sentiment === 'negative' ? 'bg-crit-bg text-crit' : 'bg-amber-100 text-amber-800'}>{result.sentiment}</Badge>
                  <span className="text-2xs text-ink-muted">Urgency: {fmtPct(result.urgencyScore * 100)}</span>
                </div>
              </CardHeader>
              <CardBody className="space-y-5">
                {result.executiveSummary && <p className="text-xs text-ink-muted italic border-l-2 border-brand-300 pl-3">{result.executiveSummary}</p>}
                <ExtractionSection title="Action Items" items={result.actionItems} icon={<CheckCircle2 size={12} />} />
                <ExtractionSection title="Risks" items={result.risks} icon={<AlertTriangle size={12} />} />
                <ExtractionSection title="Decisions" items={result.decisions} icon={<Edit3 size={12} />} />
                <ExtractionSection title="Opportunities" items={result.opportunities} icon={<ChevronRight size={12} />} />
                <ExtractionSection title="Open Questions" items={result.questions} icon={<ChevronRight size={12} />} />
                <div className="pt-3 border-t border-line flex items-center justify-between">
                  <span className="text-xs text-ink-muted">{Object.values(reviewStatus).filter(s => s === 'accepted').length} accepted</span>
                  <Button variant="primary" size="sm">
                    <CheckCircle2 size={13} /> Commit accepted
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
