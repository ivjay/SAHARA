// src/chatbot/sahara-types.ts  (or src/modules/chatbot/sahara-types.ts)

// High-level intent categories Sahara cares about
export type SaharaIntent =
  | 'BOOK_APPOINTMENT'
  | 'BOOK_TICKET'
  | 'INFO_QUERY'
  | 'SMALL_TALK'
  | 'FEEDBACK'
  | 'CONVERSATION'
  | 'UNKNOWN';

// ----------------------------------------
// Ticket payload used when type === 'BOOK_TICKET'
// ----------------------------------------

export type TicketKind = 'BUS' | 'MOVIE' | 'FLIGHT';

export interface TicketPayload {
  kind: TicketKind;

  // Common
  date?: string;       // "YYYY-MM-DD" or ISO
  passengers?: number;

  // BUS / FLIGHT
  from?: string;
  to?: string;
  busType?: string;    // for BUS only

  // MOVIE
  city?: string;
  movieName?: string;
  seats?: number;
  seatType?: string;

  // FLIGHT-specific
  cabinClass?: string;
  preferredAirline?: string;

  // Later: which provider we picked (BusSewa, specific cinema, airline, etc.)
  providerId?: string;

  // Raw/original user message (optional, useful for debugging)
  raw?: string;
}

// ----------------------------------------
// Appointment payload when type === 'BOOK_APPOINTMENT'
// ----------------------------------------

export interface AppointmentPayload {
  serviceType: string; // e.g. "doctor", "dentist", "salon"
  date?: string;       // ISO string
  locationId?: string; // clinic / hospital / business ID (future)
  location?: string;   // free-form address / area
  notes?: string;
  raw?: string;
}

// ----------------------------------------
// Info lookup payload when type === 'INFO_LOOKUP'
// ----------------------------------------

export interface InfoLookupPayload {
  topic: string; // "passport renewal", "citizenship", etc.
  category?: 'GOV' | 'TRAVEL' | 'GENERAL' | 'TRANSPORT';
  raw?: string;
}

// ----------------------------------------
// ACTION TYPES (DISCRIMINATED UNION)
// ----------------------------------------

export interface BookTicketAction {
  type: 'BOOK_TICKET';
  payload: TicketPayload;
}

export interface BookAppointmentAction {
  type: 'BOOK_APPOINTMENT';
  payload: AppointmentPayload;
}

export interface InfoLookupAction {
  type: 'INFO_LOOKUP';
  payload: InfoLookupPayload;
}

// If in future you want actions for SMALL_TALK, FEEDBACK, etc., add them here.

export type SaharaAction =
  | BookTicketAction
  | BookAppointmentAction
  | InfoLookupAction;
