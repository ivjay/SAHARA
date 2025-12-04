// src/chatbot/llm-schema.ts

import { SaharaAction, SaharaIntent } from './sahara-types';

export interface SaharaSessionMetadata {
  needsClarification: boolean;
  missingFields: string[];
}

export interface SaharaLLMResponse {
  intent: SaharaIntent;           // must be one of the allowed strings
  actions: SaharaAction[];        // union of actions
  reply: string;                  // natural language reply for the user
  sessionMetadata: SaharaSessionMetadata;
}
