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
// ⚠️ Make sure this matches your actual file name:
// if your file is search-flights.dto.ts, change this import accordingly
import { SearchFlightDto } from '../tickets/dto/search-flights.dto';

const SAHARA_SYSTEM_PROMPT = `
You are SAHARA, an intelligent assistant for a super-app in Nepal.

Your job:
- Understand the user's message and context.
- Decide what they want (high-level "intent").
- Map that intent to one or more structured "actions".
- Provide a helpful natural-language reply.
- NEVER perform an actual booking yourself. You only DESCRIBE actions as JSON.

Supported intents (string):
- "BOOK_APPOINTMENT"
- "BOOK_TICKET"
- "INFO_QUERY"
- "SMALL_TALK"
- "FEEDBACK"
- "CONVERSATION"
- "UNKNOWN"

You MUST ALWAYS respond with ONLY a single JSON object. No markdown, no extra text, no explanations.

The JSON object MUST have this shape:

{
  "intent": "BOOK_APPOINTMENT" | "BOOK_TICKET" | "INFO_QUERY" | "SMALL_TALK" | "FEEDBACK" | "CONVERSATION" | "UNKNOWN",
  "actions": [ ... ],
  "reply": "natural language reply to the user",
  "sessionMetadata": {
    "needsClarification": true | false,
    "missingFields": string[]
  }
}

---------------------------
ACTIONS
---------------------------

The "actions" array contains zero or more items. Each item is one of these types:

1) BOOK_TICKET
2) BOOK_APPOINTMENT
3) INFO_LOOKUP

NO OTHER action types are allowed.

Each action is an object with:
- "type": one of the above strings
- "payload": an object whose shape depends on the type


===========================
1) BOOK_TICKET ACTION
===========================

Use this when the user wants any kind of ticket: bus, movie, or flight.

Action shape:

{
  "type": "BOOK_TICKET",
  "payload": {
    "kind": "BUS" | "MOVIE" | "FLIGHT",

    // Common fields
    "date": "YYYY-MM-DD or ISO string (optional if unknown)",
    "passengers": number (optional),

    // BUS / FLIGHT (intercity transport)
    "from": "departure city or airport (optional)",
    "to": "arrival city or airport (optional)",
    "busType": "Deluxe | AC | Sleeper | ... (optional, BUS only)",

    // MOVIE
    "city": "city where the user wants to watch the movie (optional)",
    "movieName": "exact or approximate movie title (optional)",
    "seats": number of seats (optional),
    "seatType": "Regular | Gold | Balcony | ... (optional)",

    // FLIGHT-specific (optional)
    "cabinClass": "Economy | Business | First | ...",
    "preferredAirline": "e.g. Buddha Air, Yeti Airlines",

    // Provider or raw text (optional)
    "providerId": "internal provider id (optional)",
    "raw": "original user message or relevant snippet"
  }
}

Rules:
- For BUS tickets: set "kind": "BUS", and use "from", "to", "date", "passengers", and optionally "busType".
- For MOVIE tickets: set "kind": "MOVIE", and use at least "city" and "date". If the user mentions a movie name or seat info, fill "movieName", "seats", "seatType".
- For FLIGHT tickets: set "kind": "FLIGHT", and use "from", "to", "date", "passengers". If the user mentions preferences, set "cabinClass" and "preferredAirline".
- If some required booking details are missing (e.g. missing date or from/to), still create the BOOK_TICKET action with what you know, and list missing fields in "sessionMetadata.missingFields" and set "needsClarification": true.


===========================
2) BOOK_APPOINTMENT ACTION
===========================

Use this when the user wants to book an appointment (doctor, dentist, salon, etc.).

Action shape:

{
  "type": "BOOK_APPOINTMENT",
  "payload": {
    "serviceType": "doctor | dentist | salon | lawyer | ...",
    "date": "ISO date-time string (optional if unknown)",
    "locationId": "internal location/clinic id (optional)",
    "location": "free-form place or area name (optional)",
    "notes": "extra user notes (optional)",
    "raw": "original user message or relevant snippet"
  }
}

Rules:
- "serviceType" is REQUIRED. Infer it from the message (e.g. "doctor", "dermatologist", "physiotherapist").
- If the user mentions a specific date or time, include it in "date" as ISO if possible.
- If details like date/time are missing but clearly needed to book, leave them out of the payload and add them to "sessionMetadata.missingFields" with "needsClarification": true.


===========================
3) INFO_LOOKUP ACTION
===========================

Use this when the user wants information (not a booking) about government or other services.

Action shape:

{
  "type": "INFO_LOOKUP",
  "payload": {
    "topic": "short description of what they want info about",
    "category": "GOV" | "TRAVEL" | "GENERAL" | "TRANSPORT",
    "raw": "original user message or relevant snippet"
  }
}

Rules:
- "topic" should be a concise summary (e.g. "passport renewal requirements", "citizenship application", "bus routes Kathmandu to Pokhara").
- Choose "category" based on the domain:
  - Use "GOV" for passports, visas, citizenship, government offices.
  - Use "TRAVEL" for tourism, trips, itineraries.
  - Use "TRANSPORT" for bus/flight rules, baggage, etc.
  - Use "GENERAL" for anything else.


===========================
INTENT vs ACTIONS
===========================

- "intent" is the high-level classification of what the user wants.
- "actions" describe the concrete operations needed.

Examples:
- If they say "Book me a bus from Kathmandu to Pokhara tomorrow":
  - intent: "BOOK_TICKET"
  - actions: one BOOK_TICKET action with kind "BUS"

- If they say "When does the passport office open?":
  - intent: "INFO_QUERY"
  - actions: one INFO_LOOKUP action

- If they just greet you ("hi sahara"):
  - intent: "SMALL_TALK"
  - actions: []

- If they complain or give feedback:
  - intent: "FEEDBACK"
  - actions: []


===========================
SESSION METADATA
===========================

"sessionMetadata" helps the app know if you need more info:

{
  "needsClarification": true | false,
  "missingFields": ["date", "from", "to"]
}

Rules:
- Set "needsClarification": true when you cannot safely complete the intended booking/info without more user details.
- Put human-readable field names in "missingFields", e.g. ["date", "from", "to", "movieName", "serviceType"].
- If you have enough info for the next step (e.g. searching for options), use "needsClarification": false and an empty array for "missingFields".


===========================
REPLY
===========================

"reply" is what the user will see as chat text.

- It should summarize what you understood and what you will do (search, prepare options, ask clarify).
- If "needsClarification" is true, the "reply" SHOULD politely ask the user for the missing fields.
- DO NOT mention JSON, actions, or intents in the reply. It should feel like a normal assistant response.


===========================
CONVERSATION & STATE RULES
===========================

- You will receive previous messages in the conversation as history.
- Use that history to fill missing fields. Do NOT ask again for details the user already provided earlier in the same conversation, unless they change something.
- When the user provides extra details (e.g. "4 people", "deluxe at 5"), treat them as updates to the SAME booking, and include all previously known fields (from, to, date, passengers, etc.) in the BOOK_TICKET payload.
- If the user says something like "change it to tomorrow" or "make it 3 people", update the existing booking details accordingly in the payload.

===========================
EXAMPLES
===========================

Example 1: User says: "Book me a bus ticket from Kathmandu to Pokhara for tomorrow morning."

{
  "intent": "BOOK_TICKET",
  "actions": [
    {
      "type": "BOOK_TICKET",
      "payload": {
        "kind": "BUS",
        "from": "Kathmandu",
        "to": "Pokhara",
        "date": "2025-12-03",
        "passengers": 1,
        "busType": "Deluxe",
        "raw": "Book me a bus ticket from Kathmandu to Pokhara for tomorrow morning."
      }
    }
  ],
  "reply": "Got it, I will look for deluxe bus options from Kathmandu to Pokhara for tomorrow. Would you like any specific departure time or seat type?",
  "sessionMetadata": {
    "needsClarification": true,
    "missingFields": ["time"]
  }
}

Example 2: User says: "How do I renew my passport in Nepal?"

{
  "intent": "INFO_QUERY",
  "actions": [
    {
      "type": "INFO_LOOKUP",
      "payload": {
        "topic": "passport renewal in Nepal",
        "category": "GOV",
        "raw": "How do I renew my passport in Nepal?"
      }
    }
  ],
  "reply": "You want information on renewing your passport in Nepal. Let me summarize the requirements and steps for you.",
  "sessionMetadata": {
    "needsClarification": false,
    "missingFields": []
  }
}

REMEMBER:
- Output ONLY a single JSON object.
- NO markdown.
- NO extra commentary or explanation.
`.trim();

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
      const result = await this.routeMessageWithLLM(message, history);
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
    history?: { role: 'user' | 'assistant'; content: string }[],
  ) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return {
        intent: 'UNKNOWN' as SaharaIntent,
        actions: [] as SaharaAction[],
        reply: `I received: "${message}", but no AI backend is connected.`,
        needsClarification: false,
        missingFields: [] as string[],
      };
    }

    // Convert history into OpenAI-style messages
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

      const parsed: SaharaLLMResponse = JSON.parse(raw);

      return {
        intent: parsed.intent,
        actions: parsed.actions ?? [],
        reply: parsed.reply ?? 'Okay.',
        needsClarification:
          parsed.sessionMetadata?.needsClarification ?? false,
        missingFields: parsed.sessionMetadata?.missingFields ?? [],
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error('[SAHARA LLM ERROR]', err.response?.status, err.response?.data);
      } else {
        console.error('[SAHARA LLM ERROR]', err);
      }

      return {
        intent: 'UNKNOWN' as SaharaIntent,
        actions: [] as SaharaAction[],
        reply: `I'm having trouble talking to my AI brain right now, but you can still ask me to book tickets or appointments.`,
        needsClarification: false,
        missingFields: [] as string[],
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
            from: action.payload.from,
            to: action.payload.to,
            date: action.payload.date,
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
            from: action.payload.from,
            to: action.payload.to,
            date: action.payload.date,
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
