// src/chatbot/chatbot.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { randomUUID } from 'crypto';

import { ChatRequestDto } from './dto/chat-request.dto';
import { AppointmentsService } from '../appointments/appointments.service';
import { TicketsService } from '../tickets/tickets.service';

import { SaharaAction, SaharaIntent } from './sahara-types';
import { SaharaLLMResponse } from './llm-schema';

import { SearchBusDto } from '../tickets/dto/search-bus.dto';
import { SearchMovieDto } from '../tickets/dto/search-movie.dto';
import { SearchFlightDto } from '../tickets/dto/search-flights.dto';
import { SAHARA_SYSTEM_PROMPT } from './sahara-system-prompt';

type HistoryMessage = { role: 'user' | 'assistant'; content: string };

interface RoutedLLMResult {
  intent: SaharaIntent;
  actions: SaharaAction[];
  reply: string;
  needsClarification: boolean;
  missingFields: string[];
}

@Injectable()
export class ChatbotService {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly ticketsService: TicketsService,
  ) {}

  // MAIN ENTRY
  async handleUserMessage(
    user: any | null,
    dto: ChatRequestDto,
  ): Promise<{
    reply: string;
    actions: SaharaAction[];
    sessionId?: string;
    sideEffects?: any[];
  }> {
    const { message, sessionId, history } = dto;
    const useLLM = process.env.SAHARA_USE_LLM === 'true';

    let intent: SaharaIntent;
    let actions: SaharaAction[];
    let reply: string;

    if (useLLM) {
      const result = await this.routeMessageWithLLM(
        message,
        history as HistoryMessage[] | undefined,
      );
      intent = result.intent;
      actions = result.actions;
      reply = result.reply;
    } else {
      const res = this.routeMessageStub(message);
      intent = res.intent;
      actions = res.actions;
      reply = this.buildReplyStub(intent, actions, message, user);
    }

    const sideEffects = await this.executeActions(user, actions);

    return {
      reply,
      actions,
      sessionId: sessionId ?? randomUUID(),
      sideEffects,
    };
  }

  // ------------------------------
  //  LLM ROUTER (OpenRouter) with history
  // ------------------------------
  private async routeMessageWithLLM(
    message: string,
    history?: HistoryMessage[],
  ): Promise<RoutedLLMResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return {
        intent: 'UNKNOWN',
        actions: [],
        reply: `I received: "${message}", but no AI backend is connected.`,
        needsClarification: false,
        missingFields: [],
      };
    }

    const historyMessages =
      history?.map((h) => ({
        role: h.role,
        content: h.content,
      })) ?? [];

    const messagesPayload = [
      { role: 'system', content: SAHARA_SYSTEM_PROMPT },
      ...historyMessages,
      { role: 'user', content: message },
    ];

    try {
      const response = await axios.post(
        process.env.OPENROUTER_URL ??
          'https://openrouter.ai/api/v1/chat/completions',
        {
          model: process.env.OPENROUTER_MODEL ?? 'openai/gpt-4o',
          messages: messagesPayload,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          max_tokens: 400,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.OPENROUTER_SITE_URL ?? '',
            'X-Title': process.env.OPENROUTER_SITE_NAME ?? 'XCODENAME-SAHARA',
          },
          timeout: 8000,
        },
      );

      const raw = response.data?.choices?.[0]?.message?.content;
      if (!raw) {
        throw new Error('Empty LLM response');
      }

      const parsed = JSON.parse(raw) as SaharaLLMResponse;

      return {
        intent: parsed.intent,
        actions: parsed.actions ?? [],
        reply: parsed.reply ?? 'Okay.',
        needsClarification: parsed.sessionMetadata?.needsClarification ?? false,
        missingFields: parsed.sessionMetadata?.missingFields ?? [],
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(
          '[SAHARA LLM ERROR]',
          err.response?.status,
          err.response?.data,
        );
      } else {
        console.error('[SAHARA LLM ERROR]', err);
      }

      return {
        intent: 'UNKNOWN',
        actions: [],
        reply: `I'm having trouble talking to my AI brain right now, but you can still ask me to book tickets or appointments.`,
        needsClarification: false,
        missingFields: [],
      };
    }
  }

  // ------------------------------
  //  STUB ROUTER (fallback when SAHARA_USE_LLM=false)
  // ------------------------------
  private routeMessageStub(message: string): {
    intent: SaharaIntent;
    actions: SaharaAction[];
  } {
    const text = message.toLowerCase();
    const actions: SaharaAction[] = [];

    // APPOINTMENT
    if (text.includes('appointment')) {
      actions.push({
        type: 'BOOK_APPOINTMENT',
        payload: {
          serviceType: 'doctor',
          date: new Date().toISOString(),
          raw: message,
        },
      });
      return { intent: 'BOOK_APPOINTMENT', actions };
    }

    // BUS TICKETS
    if (text.includes('bus')) {
      actions.push({
        type: 'BOOK_TICKET',
        payload: {
          kind: 'BUS',
          from: 'Kathmandu',
          to: 'Pokhara',
          date: new Date().toISOString().slice(0, 10),
          passengers: 1,
          busType: 'Deluxe',
          raw: message,
        },
      });
      return { intent: 'BOOK_TICKET', actions };
    }

    // FLIGHT TICKETS
    if (text.includes('flight')) {
      actions.push({
        type: 'BOOK_TICKET',
        payload: {
          kind: 'FLIGHT',
          from: 'Kathmandu',
          to: 'Pokhara',
          date: new Date().toISOString().slice(0, 10),
          passengers: 1,
          cabinClass: 'Economy',
          preferredAirline: undefined,
          raw: message,
        },
      });
      return { intent: 'BOOK_TICKET', actions };
    }

    // MOVIE TICKETS
    if (text.includes('movie') || text.includes('cinema')) {
      actions.push({
        type: 'BOOK_TICKET',
        payload: {
          kind: 'MOVIE',
          city: 'Kathmandu',
          movieName: undefined,
          date: new Date().toISOString().slice(0, 10),
          seats: 1,
          seatType: 'Regular',
          raw: message,
        },
      });
      return { intent: 'BOOK_TICKET', actions };
    }

    // GENERIC TICKET (fallback: bus)
    if (text.includes('ticket')) {
      actions.push({
        type: 'BOOK_TICKET',
        payload: {
          kind: 'BUS',
          from: 'Kathmandu',
          to: 'Pokhara',
          date: new Date().toISOString().slice(0, 10),
          passengers: 1,
          busType: 'Deluxe',
          raw: message,
        },
      });
      return { intent: 'BOOK_TICKET', actions };
    }

    // INFO LOOKUP
    if (text.includes('passport') || text.includes('visa')) {
      actions.push({
        type: 'INFO_LOOKUP',
        payload: {
          topic: message,
          category: 'GOV',
          raw: message,
        },
      });
      return { intent: 'INFO_QUERY', actions };
    }

    // SMALL TALK
    if (/(hi|hello|hey|namaste)/i.test(text)) {
      return { intent: 'SMALL_TALK', actions: [] };
    }

    return { intent: 'UNKNOWN', actions: [] };
  }

  // ------------------------------
  //  ACTION EXECUTION
  // ------------------------------
  private async executeActions(user: any | null, actions: SaharaAction[]) {
    const sideEffects: any[] = [];

    for (const action of actions) {
      if (action.type === 'BOOK_TICKET') {
        const { kind } = action.payload;

        if (kind === 'BUS') {
          const params: SearchBusDto = {
            from: action.payload.from || '',
            to: action.payload.to || '',
            date: action.payload.date || new Date().toISOString().slice(0, 10),
            passengers: action.payload.passengers,
            busType: action.payload.busType,
          };

          const result = await this.ticketsService.searchBus(params);
          console.log('[SAHARA] BUS ticket options:', result);

          sideEffects.push({
            type: 'BOOK_TICKET',
            kind: 'BUS',
            params,
            result,
          });
        }

        if (kind === 'MOVIE') {
          const params: SearchMovieDto = {
            city: action.payload.city,
            date: action.payload.date,
            movieName: action.payload.movieName,
            seats: action.payload.seats,
            seatType: action.payload.seatType,
          };

          const result = await this.ticketsService.searchMovie(params);
          console.log('[SAHARA] MOVIE ticket options:', result);

          sideEffects.push({
            type: 'BOOK_TICKET',
            kind: 'MOVIE',
            params,
            result,
          });
        }

        if (kind === 'FLIGHT') {
          const params: SearchFlightDto = {
            from: action.payload.from || '',
            to: action.payload.to || '',
            date: action.payload.date || new Date().toISOString().slice(0, 10),
            passengers: action.payload.passengers,
            cabinClass: action.payload.cabinClass,
            preferredAirline: action.payload.preferredAirline,
          };

          const result = await this.ticketsService.searchFlight(params);
          console.log('[SAHARA] FLIGHT ticket options:', result);

          sideEffects.push({
            type: 'BOOK_TICKET',
            kind: 'FLIGHT',
            params,
            result,
          });
        }
      }

      if (action.type === 'BOOK_APPOINTMENT' && user) {
        await this.appointmentsService.create({
          userId: user.id,
          serviceType: action.payload.serviceType,
          date: action.payload.date ?? new Date().toISOString(),
        });

        sideEffects.push({
          type: 'BOOK_APPOINTMENT',
          created: true,
          payload: {
            serviceType: action.payload.serviceType,
            date: action.payload.date,
          },
        });
      }

      if (action.type === 'INFO_LOOKUP') {
        console.log('[SAHARA] INFO_LOOKUP:', action.payload.topic);
        sideEffects.push({
          type: 'INFO_LOOKUP',
          topic: action.payload.topic,
          category: action.payload.category,
        });
      }
    }

    return sideEffects;
  }

  // ------------------------------
  //  STUB REPLY BUILDER
  // ------------------------------
  private buildReplyStub(
    intent: SaharaIntent,
    actions: SaharaAction[],
    msg: string,
    user: any | null,
  ) {
    const name = user?.name ? ` ${user.name}` : '';

    switch (intent) {
      case 'BOOK_APPOINTMENT':
        return `Okay${name}, I created an appointment request for you.`;
      case 'BOOK_TICKET':
        if (actions[0]?.type === 'BOOK_TICKET' && actions[0].payload.kind === 'BUS') {
          return `Got it${name}, I'll check bus tickets for you.`;
        }
        if (actions[0]?.type === 'BOOK_TICKET' && actions[0].payload.kind === 'MOVIE') {
          return `Nice choice${name}, I'll look for movie shows.`;
        }
        if (actions[0]?.type === 'BOOK_TICKET' && actions[0].payload.kind === 'FLIGHT') {
          return `Alright${name}, I'll search available flights.`;
        }
        return `Got it${name}, I'll check ticket options for you.`;
      case 'INFO_QUERY':
        return actions.length && actions[0].type === 'INFO_LOOKUP'
          ? `Here's what I found about: ${actions[0].payload.topic}`
          : `I'll look up that information for you.`;
      case 'SMALL_TALK':
        return `Hello${name}! I'm SAHARA, your assistant.`;
      default:
        return `I received: "${msg}". Try asking me to book an appointment or a ticket.`;
    }
  }
}
