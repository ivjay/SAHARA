// src/chatbot/sahara-types.ts

// High-level intent, must match what you put in the prompt
export type SaharaIntent =
  | 'BOOK_APPOINTMENT'
  | 'BOOK_TICKET'
  | 'INFO_QUERY'
  | 'SMALL_TALK'
  | 'FEEDBACK'
  | 'CONVERSATION'
  | 'UNKNOWN';

// Allowed backend action "type" strings
export type SaharaActionType =
  | 'BOOK_TICKET'
  | 'BOOK_APPOINTMENT'
  | 'INFO_LOOKUP';

// ----------------------
// Payload shapes
// ----------------------

// For bus/movie/flight ticket search
export interface BookTicketPayload {
  kind: 'BUS' | 'MOVIE' | 'FLIGHT';

  // Common
  date?: string; // "YYYY-MM-DD" or ISO
  passengers?: number;

  // BUS / FLIGHT
  from?: string;
  to?: string;

  // BUS-only
  busType?: string;

  // MOVIE-only
  city?: string;
  movieName?: string;
  seats?: number;
  seatType?: string;

  // FLIGHT-only
  cabinClass?: string;
  preferredAirline?: string;

  // Optional internal/provider/raw stuff
  providerId?: string;
  raw?: string;
}

// Appointment booking payload
export interface BookAppointmentPayload {
  serviceType: string;        // REQUIRED in your prompt
  date?: string;              // ISO date string (optional)
  locationId?: string;
  location?: string;
  notes?: string;
  raw?: string;
}

// Info lookup payload
export interface InfoLookupPayload {
  topic: string;
  category: 'GOV' | 'TRAVEL' | 'GENERAL' | 'TRANSPORT';
  raw?: string;
}

// ----------------------
// Action objects
// ----------------------

export interface BookTicketAction {
  type: 'BOOK_TICKET';
  payload: BookTicketPayload;
}

export interface BookAppointmentAction {
  type: 'BOOK_APPOINTMENT';
  payload: BookAppointmentPayload;
}

export interface InfoLookupAction {
  type: 'INFO_LOOKUP';
  payload: InfoLookupPayload;
}

// Union of all actions
export type SaharaAction =
  | BookTicketAction
  | BookAppointmentAction
  | InfoLookupAction;
