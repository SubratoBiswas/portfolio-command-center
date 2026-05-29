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
    urgencyScore: number;
}
export interface LLMProvider {
    name: string;
    extract(transcript: string, hints?: {
        context?: string;
    }): Promise<ExtractionResult>;
}
export declare class MockProvider implements LLMProvider {
    name: "mock";
    private readonly logger;
    extract(text: string): Promise<ExtractionResult>;
}
export declare class AnthropicProvider implements LLMProvider {
    name: "anthropic";
    private readonly logger;
    private readonly apiUrl;
    private readonly model;
    extract(text: string, hints?: {
        context?: string;
    }): Promise<ExtractionResult>;
}
export declare class ProviderRegistry {
    private readonly mock;
    private readonly anthropic;
    constructor(mock: MockProvider, anthropic: AnthropicProvider);
    pick(name?: string): LLMProvider;
}
