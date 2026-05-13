import { Injectable, Logger } from '@nestjs/common';

// =============================================================================
// Shared extraction shape
// =============================================================================

export interface ExtractionResult {
  actionItems: Array<{
    title: string;
    assignee?: string;
    dueDate?: string;
    priority?: 'p0' | 'p1' | 'p2' | 'p3';
    confidence: number;
  }>;
  risks: Array<{
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  }>;
  decisions: Array<{
    title: string;
    decision: string;
    rationale?: string;
    confidence: number;
  }>;
  opportunities: Array<{
    name: string;
    client?: string;
    value?: number;
    confidence: number;
  }>;
  dependencies: Array<{
    from: string;
    to: string;
    kind: 'blocks' | 'depends_on' | 'related_to';
    confidence: number;
  }>;
  questions: Array<{
    question: string;
    context?: string;
    confidence: number;
  }>;
  productIdeas: Array<{
    name: string;
    description: string;
    confidence: number;
  }>;
  executiveSummary: string;
  sentiment: 'positive' | 'neutral' | 'mixed' | 'negative';
  urgencyScore: number; // 0-1
}

export interface LLMProvider {
  name: string;
  extract(transcript: string, hints?: { context?: string }): Promise<ExtractionResult>;
}

// =============================================================================
// Mock provider — pattern-matches without an LLM.
// =============================================================================

@Injectable()
export class MockProvider implements LLMProvider {
  name = 'mock' as const;
  private readonly logger = new Logger(MockProvider.name);

  async extract(text: string): Promise<ExtractionResult> {
    this.logger.log(`Mock extraction on ${text.length} chars`);
    const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);

    const actionVerbs = /(?:will|i'll|i will|going to|need to|let's|we should|action[: ]|todo[: ]|follow up)/i;
    const riskWords = /(?:risk|concern|worried|blocker|might slip|could fail|exposure)/i;
    const decisionWords = /(?:decided|we agreed|the call is|go with|let's go|locked in|consensus)/i;
    const questionWords = /\?\s*$/;
    const moneyRe = /\$\s?([\d,]+(?:\.\d+)?)\s?(k|m|million|thousand)?/i;
    const dueRe = /(?:by|before|due|eod|end of day|end of week|next (?:monday|tuesday|wednesday|thursday|friday)|tomorrow|today)\s+([a-z0-9\- ]+)/i;

    const result: ExtractionResult = {
      actionItems: [],
      risks: [],
      decisions: [],
      opportunities: [],
      dependencies: [],
      questions: [],
      productIdeas: [],
      executiveSummary: '',
      sentiment: 'neutral',
      urgencyScore: 0.5,
    };

    for (const line of lines) {
      if (actionVerbs.test(line)) {
        const due = line.match(dueRe)?.[1];
        result.actionItems.push({
          title: line.replace(/^[A-Z][a-z]+:\s*/, '').slice(0, 200),
          dueDate: due,
          priority: /asap|urgent|today|tomorrow/i.test(line) ? 'p1' : 'p2',
          confidence: 0.78,
        });
      }
      if (riskWords.test(line)) {
        result.risks.push({
          title: line.slice(0, 120),
          description: line,
          severity: /critical|blocker|fail/i.test(line) ? 'high' : 'medium',
          confidence: 0.72,
        });
      }
      if (decisionWords.test(line)) {
        result.decisions.push({
          title: line.slice(0, 120),
          decision: line,
          confidence: 0.81,
        });
      }
      if (questionWords.test(line)) {
        result.questions.push({ question: line, confidence: 0.7 });
      }
      const money = line.match(moneyRe);
      if (money) {
        const raw = parseFloat(money[1].replace(/,/g, ''));
        const mult = /m|million/i.test(money[2] || '') ? 1_000_000 : /k|thousand/i.test(money[2] || '') ? 1_000 : 1;
        result.opportunities.push({ name: line.slice(0, 80), value: raw * mult, confidence: 0.6 });
      }
    }

    result.executiveSummary =
      `Meeting covered ${result.actionItems.length} action items, ${result.risks.length} risks, ` +
      `${result.decisions.length} decisions, and ${result.questions.length} open questions.`;
    const totalSignals = result.actionItems.length + result.risks.length * 2 + result.decisions.length;
    result.urgencyScore = Math.min(1, totalSignals / 10);
    return result;
  }
}

// =============================================================================
// Anthropic provider — fully implemented using the Messages API.
// Set LLM_PROVIDER=anthropic and ANTHROPIC_API_KEY to activate.
// =============================================================================

const SYSTEM_PROMPT = `You are an expert meeting analyst. Extract structured intelligence from the meeting transcript.
Return ONLY a valid JSON object matching the ExtractionResult schema below — no markdown, no prose, just JSON.

Schema:
{
  "actionItems": [{ "title": string, "assignee"?: string, "dueDate"?: string (ISO), "priority"?: "p0"|"p1"|"p2"|"p3", "confidence": number (0-1) }],
  "risks": [{ "title": string, "description": string, "severity": "low"|"medium"|"high"|"critical", "confidence": number }],
  "decisions": [{ "title": string, "decision": string, "rationale"?: string, "confidence": number }],
  "opportunities": [{ "name": string, "client"?: string, "value"?: number, "confidence": number }],
  "dependencies": [{ "from": string, "to": string, "kind": "blocks"|"depends_on"|"related_to", "confidence": number }],
  "questions": [{ "question": string, "context"?: string, "confidence": number }],
  "productIdeas": [{ "name": string, "description": string, "confidence": number }],
  "executiveSummary": string,
  "sentiment": "positive"|"neutral"|"mixed"|"negative",
  "urgencyScore": number (0-1)
}

Rules:
- Only extract items explicitly mentioned in the transcript.
- confidence reflects how clearly the item was stated (0.9+ = explicitly stated, 0.6-0.89 = implied, <0.6 = inferred).
- dueDate must be an ISO 8601 date string or omitted.
- Keep titles concise (under 120 chars). Descriptions may be longer.
- If nothing was found for a category, return an empty array.
- executiveSummary should be 2-3 sentences capturing the meeting's key outcomes.`;

@Injectable()
export class AnthropicProvider implements LLMProvider {
  name = 'anthropic' as const;
  private readonly logger = new Logger(AnthropicProvider.name);
  private readonly apiUrl = 'https://api.anthropic.com/v1/messages';
  private readonly model = 'claude-opus-4-6';

  async extract(text: string, hints?: { context?: string }): Promise<ExtractionResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

    this.logger.log(`Anthropic extraction: ${text.length} chars, model=${this.model}`);

    const userMessage = hints?.context
      ? `Context: ${hints.context}\n\n---TRANSCRIPT---\n${text}`
      : `---TRANSCRIPT---\n${text}`;

    const body = {
      model: this.model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    };

    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API error ${res.status}: ${errText}`);
    }

    const data = await res.json() as {
      content: Array<{ type: string; text: string }>;
      usage?: { input_tokens: number; output_tokens: number };
    };

    this.logger.log(`Anthropic usage: ${JSON.stringify(data.usage ?? {})}`);

    const textBlock = data.content.find((b) => b.type === 'text');
    if (!textBlock) throw new Error('No text content in Anthropic response');

    // Strip any accidental markdown fences
    const raw = textBlock.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

    let parsed: ExtractionResult;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      this.logger.error(`Failed to parse Anthropic JSON response: ${raw.slice(0, 500)}`);
      throw new Error('Anthropic returned invalid JSON');
    }

    // Ensure all required arrays exist (defensive)
    parsed.actionItems ??= [];
    parsed.risks ??= [];
    parsed.decisions ??= [];
    parsed.opportunities ??= [];
    parsed.dependencies ??= [];
    parsed.questions ??= [];
    parsed.productIdeas ??= [];
    parsed.executiveSummary ??= '';
    parsed.sentiment ??= 'neutral';
    parsed.urgencyScore ??= 0.5;

    return parsed;
  }
}

// =============================================================================
// Provider registry — picks at runtime from LLM_PROVIDER env var
// =============================================================================

@Injectable()
export class ProviderRegistry {
  constructor(
    private readonly mock: MockProvider,
    private readonly anthropic: AnthropicProvider,
  ) {}

  pick(name?: string): LLMProvider {
    switch ((name ?? process.env.LLM_PROVIDER ?? 'mock').toLowerCase()) {
      case 'anthropic':
        return this.anthropic;
      case 'mock':
      default:
        return this.mock;
    }
  }
}
