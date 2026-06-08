import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly svc: ChatService) {}

  @Post()
  chat(@Body() body: { message: string; context?: any }) {
    return this.svc.chat(body.message, body.context);
  }
}
