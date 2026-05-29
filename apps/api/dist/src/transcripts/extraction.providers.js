"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MockProvider_1, AnthropicProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderRegistry = exports.AnthropicProvider = exports.MockProvider = void 0;
const common_1 = require("@nestjs/common");
// =============================================================================
// Mock provider — pattern-matches without an LLM.
// =============================================================================
let MockProvider = MockProvider_1 = class MockProvider {
    name = 'mock';
    logger = new common_1.Logger(MockProvider_1.name);
    async extract(text) {
        this.logger.log(`Mock extraction on ${text.length} chars`);
        const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const actionVerbs = /(?:will|i'll|i will|going to|need to|let's|we should|action[: ]|todo[: ]|follow up)/i;
        const riskWords = /(?:risk|concern|worried|blocker|might slip|could fail|exposure)/i;
        const decisionWords = /(?:decided|we agreed|the call is|go with|let's go|locked in|consensus)/i;
        const questionWords = /\?\s*$/;
        const moneyRe = /\$\s?([\d,]+(?:\.\d+)?)\s?(k|m|million|thousand)?/i;
        const dueRe = /(?:by|before|due|eod|end of day|end of week|next (?:monday|tuesday|wednesday|thursday|friday)|tomorrow|today)\s+([a-z0-9\- ]+)/i;
        const result = {
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
};
exports.MockProvider = MockProvider;
exports.MockProvider = MockProvider = MockProvider_1 = __decorate([
    (0, common_1.Injectable)()
], MockProvider);
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
let AnthropicProvider = AnthropicProvider_1 = class AnthropicProvider {
    name = 'anthropic';
    logger = new common_1.Logger(AnthropicProvider_1.name);
    apiUrl = 'https://api.anthropic.com/v1/messages';
    model = 'claude-opus-4-6';
    async extract(text, hints) {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey)
            throw new Error('ANTHROPIC_API_KEY is not set');
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
        const data = await res.json();
        this.logger.log(`Anthropic usage: ${JSON.stringify(data.usage ?? {})}`);
        const textBlock = data.content.find((b) => b.type === 'text');
        if (!textBlock)
            throw new Error('No text content in Anthropic response');
        // Strip any accidental markdown fences
        const raw = textBlock.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
        let parsed;
        try {
            parsed = JSON.parse(raw);
        }
        catch (e) {
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
};
exports.AnthropicProvider = AnthropicProvider;
exports.AnthropicProvider = AnthropicProvider = AnthropicProvider_1 = __decorate([
    (0, common_1.Injectable)()
], AnthropicProvider);
// =============================================================================
// Provider registry — picks at runtime from LLM_PROVIDER env var
// =============================================================================
let ProviderRegistry = class ProviderRegistry {
    mock;
    anthropic;
    constructor(mock, anthropic) {
        this.mock = mock;
        this.anthropic = anthropic;
    }
    pick(name) {
        switch ((name ?? process.env.LLM_PROVIDER ?? 'mock').toLowerCase()) {
            case 'anthropic':
                return this.anthropic;
            case 'mock':
            default:
                return this.mock;
        }
    }
};
exports.ProviderRegistry = ProviderRegistry;
exports.ProviderRegistry = ProviderRegistry = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [MockProvider,
        AnthropicProvider])
], ProviderRegistry);
//# sourceMappingURL=extraction.providers.js.map