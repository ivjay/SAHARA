// src/modules/chatbot/llm-schema.ts
import { SaharaIntent, SaharaAction } from './sahara-types';

// LLM intent type – same as SaharaIntent for now
export type SaharaLLMIntent = SaharaIntent;

// LLM action type – reuse SaharaAction to keep shapes identical
export type SaharaLLMAction = SaharaAction;


// Full JSON response we expect from the LLM
export interface SaharaLLMResponse {
  intent: SaharaLLMIntent;
  actions: SaharaLLMAction[];
  reply: string;
  sessionMetadata?: {
    needsClarification?: boolean;
    missingFields?: string[];
  };
}
export interface SaharaSessionMetadata {
  needsClarification: boolean;
  missingFields: string[];
}


