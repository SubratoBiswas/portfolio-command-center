import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TranscriptsController } from './transcripts.controller';
import { TranscriptsService } from './transcripts.service';
import { ExtractionProcessor } from './extraction.processor';
import { MockProvider, AnthropicProvider, ProviderRegistry } from './extraction.providers';
import { EXTRACTION_QUEUE } from './extraction.queue';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: EXTRACTION_QUEUE }),
  ],
  controllers: [TranscriptsController],
  providers: [
    TranscriptsService,
    ExtractionProcessor,
    MockProvider,
    AnthropicProvider,
    ProviderRegistry,
  ],
  exports: [TranscriptsService],
})
export class TranscriptsModule {}
