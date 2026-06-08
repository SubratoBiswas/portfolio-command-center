import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  async chat(message: string, _context?: any): Promise<{ reply: string }> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return { reply: this.mockReply(message) };
    }

    try {
      // Gather portfolio snapshot for context
      const [projects, opportunities, risks, resources, products] = await Promise.all([
        this.prisma.project.findMany({ include: { client: true, owner: true }, take: 20 }),
        this.prisma.opportunity.findMany({ include: { client: true, owner: true }, take: 20 }),
        this.prisma.risk.findMany({ where: { status: { notIn: ['closed'] } }, take: 15 }),
        this.prisma.resource.findMany({ where: { active: true }, take: 20 }),
        this.prisma.product.findMany({ take: 15 }),
      ]);

      const systemPrompt = `You are the Chat Assistant AI for Trinamix, a consulting and AI-solutions firm.
You have access to live portfolio data and answer questions concisely and accurately.

PORTFOLIO SNAPSHOT:
Projects (${projects.length}): ${projects.map(p => `${p.name} [${p.rag}/${p.status}]`).join(', ')}
Opportunities (${opportunities.length}): ${opportunities.map(o => `${o.name} [$${(o.value/1000).toFixed(0)}k/${o.stage}]`).join(', ')}
Open Risks (${risks.length}): ${risks.map(r => `${r.title} [${r.severity}]`).join(', ')}
Active Resources (${resources.length}): ${resources.map(r => `${r.name} (${r.role})`).join(', ')}
Products (${products.length}): ${products.map(p => `${p.name} [${p.maturity}]`).join(', ')}

Answer in 2-4 sentences. Be specific, use actual names and numbers from the data above.`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: systemPrompt,
          messages: [{ role: 'user', content: message }],
        }),
      });

      if (!res.ok) throw new Error(`Anthropic error ${res.status}`);
      const data = await res.json() as any;
      const reply = data.content?.[0]?.text ?? 'No response generated.';
      return { reply };
    } catch (err: any) {
      this.logger.error(`Chat error: ${err.message}`);
      return { reply: `Sorry, I encountered an error: ${err.message}` };
    }
  }

  private mockReply(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('risk')) return 'There are open risks in the portfolio. Set ANTHROPIC_API_KEY in Render for AI-powered answers.';
    if (lower.includes('opportunit')) return 'There are active opportunities in the pipeline. Set ANTHROPIC_API_KEY for detailed AI analysis.';
    if (lower.includes('project')) return 'Multiple projects are currently active. Set ANTHROPIC_API_KEY for AI-powered portfolio insights.';
    if (lower.includes('resource') || lower.includes('team')) return 'Your team has active resources across multiple locations. Set ANTHROPIC_API_KEY for utilization insights.';
    return 'I need an ANTHROPIC_API_KEY to answer questions intelligently. Please set it in your Render environment variables.';
  }
}
