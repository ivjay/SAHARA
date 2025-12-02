// src/modules/tickets/tickets.types.ts

export type TicketKind = 'BUS' | 'MOVIE' | 'FLIGHT';

export interface BusSearchParams {
  from?: string;
  to?: string;
  date?: string; // ISO string
}

export interface MovieSearchParams {
  city?: string;
  date?: string; // ISO string
}

export interface FlightSearchParams {
  from?: string;
  to?: string;
  date?: string; // ISO string
}

export interface BusTicketOption {
  provider: 'BUSSEWA' | string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  raw?: any;
}

export interface MovieTicketOption {
  provider: 'QFX' | string;
  cinema: string;
  movieTitle: string;
  showTime: string;
  price: number;
  currency: string;
  raw?: any;
}

export interface FlightTicketOption {
  provider: string; // e.g. "Buddha Air", "Yeti Airlines"
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  raw?: any;
}

export interface TicketSearchResult {
  kind: TicketKind;
  busOptions?: BusTicketOption[];
  movieOptions?: MovieTicketOption[];
  flightOptions?: FlightTicketOption[];
}
