import { Body, Controller, Post, Req } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatRequestDto } from './dto/chat-request.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  async handleMessage(
    @Body() dto: ChatRequestDto,
    @Req() req: any,
  ) {
    // In real app you'll inject user from auth guard / request
    const user = req.user ?? null;

    const result = await this.chatbotService.handleUserMessage(user, dto);

    // You can shape the HTTP response however you like
    return {
      reply: result.reply,
      actions: result.actions,
      sessionId: result.sessionId,
      sideEffects: result.sideEffects ?? [],
    };
  }
}
