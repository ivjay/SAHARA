export interface BusTicketResult {
  operator: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  seatsAvailable: number;
  from: string;
  to: string;
  date: string;
}

export interface MovieTicketResult {
  movieName: string;
  hall: string;
  showTime: string;
  price: number;
  seatsAvailable: number;
  date: string;
}

export interface FlightTicketResult {
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  from: string;
  to: string;
  date: string;
}
