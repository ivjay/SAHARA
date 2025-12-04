import { Body, Controller, Post, Req } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatRequestDto } from './dto/chat-request.dto';

@Controller('chat')               // 👈 this makes route = /api/chat
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()                         
  async handleMessage(
    @Body() dto: ChatRequestDto,
    @Req() req: any,
  ) {
    const user = req.user ?? null;

    const result = await this.chatbotService.handleUserMessage(user, dto);

    return {
      reply: result.reply,
      actions: result.actions,
      sessionId: result.sessionId,
      sideEffects: result.sideEffects ?? [],
    };
  }
}
