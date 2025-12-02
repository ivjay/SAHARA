import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { AppointmentsModule } from '../appointments/appointments.module';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [AppointmentsModule, TicketsModule],
  providers: [ChatbotService],
  controllers: [ChatbotController],
})
export class ChatbotModule {}
