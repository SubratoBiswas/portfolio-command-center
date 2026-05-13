// =============================================================================
// AI extraction engine.
//
// Production note: This file presents an LLMProvider interface and a mock
// implementation. To swap in a real LLM, implement OpenAIProvider /
// AnthropicProvider / OCIGenAIProvider / GeminiProvider against the same
// LLMProvider contract and pass it to extractFromTranscript. No call site
// changes are required.
// =============================================================================

import type { ID } from '@/lib/types';

export interface ExtractedActionItem {
  id: string;
  title: string;
  assigneeHint?: string;
  dueDateHint?: string;
  confidence: number;
}
export interface ExtractedRisk {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}
export interface ExtractedDecision {
  id: string;
  title: string;
  decision: string;
  confidence: number;
}
export interface ExtractedOpportunity {
  id: string;
  title: string;
  clientHint?: string;
  valueHint?: number;
  confidence: number;
}
export interface ExtractedDependency {
  id: string;
  title: string;
  kind: 'blocks' | 'depends_on' | 'related_to';
  confidence: number;
}
export interface ExtractedQuestion {
  id: string;
  question: string;
  confidence: number;
}
export interface ExtractedProductIdea {
  id: string;
  idea: string;
  confidence: number;
}

export interface ExtractionResult {
  actionItems: ExtractedActionItem[];
  risks: ExtractedRisk[];
  decisions: ExtractedDecision[];
  opportunities: ExtractedOpportunity[];
  dependencies: ExtractedDependency[];
  questions: ExtractedQuestion[];
  productIdeas: ExtractedProductIdea[];
  executiveSummary: string;
  sentiment: 'positive' | 'neutral' | 'tense' | 'negative';
  urgencyScore: number; // 0–1
}

export interface LLMProvider {
  name: string;
  extract(text: string): Promise<ExtractionResult>;
}

// -----------------------------------------------------------------------------
// MockLLMProvider — deterministic, pattern-based extraction
// -----------------------------------------------------------------------------
let counter = 0;
const nextId = (prefix: string) => `${prefix}-${++counter}-${Date.now().toString(36)}`;

const ACTION_PATTERNS = [
  /(?:I'll|I will|We'll|We will|going to|let's|need to|action:|todo:|follow up|follow-up)\s+([^.\n]+)/gi,
  /(\w+)\s+will\s+(send|share|own|deliver|set up|schedule|prepare|review|confirm|finalize|build|run|tune)\s+([^.\n]+)/gi,
  /(?:can you|could you|please)\s+([^.?\n]+)/gi,
];

const RISK_PATTERNS = [
  /(risk|concern|worried|worry|red flag|blocker|blocking|stuck|delay|delayed|miss|slip|freeze|freeze\.|won't fly|won't sign)/i,
];

const DECISION_PATTERNS = [
  /(?:decided|decision|we'll go with|approved|agreed|signed off|let's go with|we will use|adopt)\s+([^.\n]+)/gi,
];

const OPPORTUNITY_PATTERNS = [
  /(\$[\d,]+(?:\.\d+)?(?:K|M|k|m)?|\d+\s*million|\d+\s*M\b)/g,
  /(opportunity|expansion|upsell|cross-sell|phase\s*2|next phase)/i,
];

const DEPENDENCY_PATTERNS = [
  /(?:depends on|blocked by|waiting on|need|requires|prerequisite)\s+([^.\n]+)/gi,
];

const QUESTION_PATTERNS = [
  /([A-Z][^.!?\n]*\?)/g,
];

const PRODUCT_IDEA_PATTERNS = [
  /(?:we should|could build|new feature|new product|imagine if|wouldn't it be great|reusable|accelerator)\s+([^.\n]+)/gi,
];

const ASSIGNEE_HINTS = ['Viral','Shubhy','Nischay','Prantik','Dushyant','Subrato','Ranu','Meera','Arjun','Kavya','Rahul','Anika'];

function takeUnique<T>(arr: T[], key: (t: T) => string, max: number): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const k = key(item).toLowerCase().slice(0, 80);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
    if (out.length >= max) break;
  }
  return out;
}

function findAssignee(text: string): string | undefined {
  for (const name of ASSIGNEE_HINTS) {
    if (new RegExp(`\\b${name}\\b`, 'i').test(text)) return name;
  }
  return undefined;
}

function findDueDate(text: string): string | undefined {
  const m = text.match(/\b(today|tomorrow|this week|next week|next Tuesday|next Wednesday|by\s+\w+|by\s+\w+\s+\d+|in\s+\d+\s+days|EOW|EOD|end of week|by Friday|by Monday|by end of next sprint|Q[1-4])\b/i);
  return m?.[1];
}

function findValue(text: string): number | undefined {
  const m = text.match(/\$?([\d,]+(?:\.\d+)?)\s*(K|M|k|m|million|thousand)?/);
  if (!m) return undefined;
  const n = parseFloat(m[1].replace(/,/g, ''));
  if (!m[2]) return n;
  if (/^k|thousand$/i.test(m[2])) return n * 1_000;
  if (/^m|million$/i.test(m[2])) return n * 1_000_000;
  return n;
}

function findClient(text: string): string | undefined {
  const clients = ['Roku','Sonoco','Albertsons','KEMET','Yageo','GE Vernova','GEV','Cisco','Oracle','Dexcom','Milwaukee','Bloom'];
  for (const c of clients) {
    if (new RegExp(`\\b${c}\\b`, 'i').test(text)) return c;
  }
  return undefined;
}

function clamp(n: number, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, n)); }

export const mockProvider: LLMProvider = {
  name: 'mock',
  async extract(text: string): Promise<ExtractionResult> {
    // simulate latency for UX
    await new Promise(r => setTimeout(r, 1200));

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);

    // ---------- Action items ----------
    const rawActions: ExtractedActionItem[] = [];
    for (const sent of sentences) {
      for (const pat of ACTION_PATTERNS) {
        pat.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = pat.exec(sent))) {
          const fragment = m[0].trim();
          if (fragment.length < 8 || fragment.length > 220) continue;
          rawActions.push({
            id: nextId('xa'),
            title: fragment.replace(/^(I'll|I will|We'll|We will|let's|need to|action:|todo:)\s+/i, '').replace(/^[a-z]/, c => c.toUpperCase()),
            assigneeHint: findAssignee(sent),
            dueDateHint: findDueDate(sent),
            confidence: clamp(0.65 + (sent.match(/will|by|own/i) ? 0.2 : 0) + (findDueDate(sent) ? 0.1 : 0)),
          });
        }
      }
    }
    const actionItems = takeUnique(rawActions, a => a.title, 10);

    // ---------- Risks ----------
    const rawRisks: ExtractedRisk[] = [];
    for (const sent of sentences) {
      if (RISK_PATTERNS[0].test(sent)) {
        const sev: ExtractedRisk['severity'] =
          /critical|blocker|freeze|won't sign|won't fly/i.test(sent) ? 'critical'
          : /miss|slip|delayed?|stuck|red flag|concern/i.test(sent) ? 'high'
          : /risk|worry/i.test(sent) ? 'medium' : 'low';
        rawRisks.push({
          id: nextId('xr'),
          title: sent.length > 140 ? sent.slice(0, 137) + '…' : sent,
          severity: sev,
          confidence: clamp(0.7 + (sev === 'critical' ? 0.15 : 0)),
        });
      }
    }
    const risks = takeUnique(rawRisks, r => r.title, 8);

    // ---------- Decisions ----------
    const rawDecisions: ExtractedDecision[] = [];
    for (const sent of sentences) {
      for (const pat of DECISION_PATTERNS) {
        pat.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = pat.exec(sent))) {
          rawDecisions.push({
            id: nextId('xd'),
            title: m[0].slice(0, 100),
            decision: sent.length > 220 ? sent.slice(0, 217) + '…' : sent,
            confidence: 0.78,
          });
        }
      }
    }
    const decisions = takeUnique(rawDecisions, d => d.title, 6);

    // ---------- Opportunities ----------
    const rawOpps: ExtractedOpportunity[] = [];
    for (const sent of sentences) {
      if (OPPORTUNITY_PATTERNS[1].test(sent) || OPPORTUNITY_PATTERNS[0].test(sent)) {
        rawOpps.push({
          id: nextId('xo'),
          title: sent.length > 140 ? sent.slice(0, 137) + '…' : sent,
          clientHint: findClient(sent),
          valueHint: findValue(sent),
          confidence: clamp(0.55 + (findValue(sent) ? 0.2 : 0) + (findClient(sent) ? 0.1 : 0)),
        });
      }
    }
    const opportunities = takeUnique(rawOpps, o => o.title, 5);

    // ---------- Dependencies ----------
    const rawDeps: ExtractedDependency[] = [];
    for (const sent of sentences) {
      for (const pat of DEPENDENCY_PATTERNS) {
        pat.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = pat.exec(sent))) {
          const kind: ExtractedDependency['kind'] =
            /blocked by/i.test(m[0]) ? 'blocks'
            : /depends on|waiting on/i.test(m[0]) ? 'depends_on'
            : 'related_to';
          rawDeps.push({
            id: nextId('xdep'),
            title: m[0].slice(0, 120),
            kind,
            confidence: 0.7,
          });
        }
      }
    }
    const dependencies = takeUnique(rawDeps, d => d.title, 5);

    // ---------- Questions ----------
    const rawQuestions: ExtractedQuestion[] = [];
    for (const sent of sentences) {
      for (const pat of QUESTION_PATTERNS) {
        pat.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = pat.exec(sent))) {
          if (m[1].length < 15 || m[1].length > 200) continue;
          rawQuestions.push({ id: nextId('xq'), question: m[1], confidence: 0.6 });
        }
      }
    }
    const questions = takeUnique(rawQuestions, q => q.question, 5);

    // ---------- Product ideas ----------
    const rawIdeas: ExtractedProductIdea[] = [];
    for (const sent of sentences) {
      for (const pat of PRODUCT_IDEA_PATTERNS) {
        pat.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = pat.exec(sent))) {
          rawIdeas.push({ id: nextId('xi'), idea: m[0].slice(0, 200), confidence: 0.55 });
        }
      }
    }
    const productIdeas = takeUnique(rawIdeas, i => i.idea, 3);

    // ---------- Summary / sentiment / urgency ----------
    const urgencyCues = (text.match(/critical|urgent|asap|this week|by end of|signing|freeze|escalate|blocker/gi) || []).length;
    const urgencyScore = clamp(urgencyCues / 8);

    const tenseCues = (text.match(/concern|won't|wont|risk|miss|slip|delay|freeze|blocker/gi) || []).length;
    const positiveCues = (text.match(/great|excellent|on track|approved|signed|excited|happy/gi) || []).length;
    const sentiment: ExtractionResult['sentiment'] =
      tenseCues > positiveCues + 2 ? 'tense'
      : positiveCues > tenseCues + 2 ? 'positive'
      : 'neutral';

    const summaryBits: string[] = [];
    if (actionItems.length) summaryBits.push(`${actionItems.length} action ${actionItems.length === 1 ? 'item' : 'items'} identified`);
    if (risks.length) summaryBits.push(`${risks.length} risk${risks.length === 1 ? '' : 's'} surfaced`);
    if (decisions.length) summaryBits.push(`${decisions.length} decision${decisions.length === 1 ? '' : 's'} captured`);
    if (opportunities.length) summaryBits.push(`${opportunities.length} opportunity signal${opportunities.length === 1 ? '' : 's'}`);
    const lead = lines[0] || 'Meeting transcript processed.';
    const executiveSummary = `${lead.slice(0, 160)}${lead.length > 160 ? '…' : ''} ${summaryBits.join(', ')}. Sentiment: ${sentiment}. Urgency: ${(urgencyScore * 100).toFixed(0)}%.`;

    return {
      actionItems,
      risks,
      decisions,
      opportunities,
      dependencies,
      questions,
      productIdeas,
      executiveSummary,
      sentiment,
      urgencyScore,
    };
  },
};

// -----------------------------------------------------------------------------
// Provider registry — swap implementations via env in real backend
// -----------------------------------------------------------------------------
const providers: Record<string, LLMProvider> = {
  mock: mockProvider,
  // openai: openAIProvider,
  // anthropic: anthropicProvider,
  // gemini: geminiProvider,
  // oci: ociProvider,
};

export function getProvider(name = 'mock'): LLMProvider {
  return providers[name] ?? mockProvider;
}

export async function extractFromTranscript(
  text: string,
  providerName = 'mock'
): Promise<ExtractionResult> {
  const provider = getProvider(providerName);
  return provider.extract(text);
}

// -----------------------------------------------------------------------------
// Sample transcript — used by the upload screen demo
// -----------------------------------------------------------------------------
export const SAMPLE_TRANSCRIPT = `Viral: Thanks for joining. Let's walk through the indemnification language Mark flagged last week.

Mark (Roku Legal): The current draft has uncapped IP indemnification. That won't fly with our procurement team. We need a cap, ideally 12 months of fees.

Viral: We can do 24 months of fees as a cap. We've done that with other media customers.

Mark: Acceptable in principle. I'll need to confirm with our SVP Legal.

Nischay: From a product side, our accuracy on indemnification clauses is currently 78%. We're targeting 85% in the next two weeks via prompt tuning.

Mark: That's a concern for the exec readout next month. We need to see 85% before we can sign.

Viral: Understood. Nischay will own getting accuracy above 85% by end of next sprint. I will send the revised SOW with the 24-month cap by Friday.

Mark: Also — heads up, Q3 procurement freeze is being discussed internally. If we don't sign in the next 6 weeks, this likely pushes to Q4.

Viral: Critical. We'll prioritize closing this in the next 4 weeks.

Mark: One more thing — we'd like a legal indemnification review meeting next week with our SVP. Can you set it up?

Viral: Yes, I will send invites for next Tuesday or Wednesday. We should also explore whether a reusable accelerator for contract clause libraries makes sense across our customer base — this comes up every deal.

Nischay: Agreed. We decided last week to consolidate document processing into a shared service across Documantra and Control Tower. This is related.`;
