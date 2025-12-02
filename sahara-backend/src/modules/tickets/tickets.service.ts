// src/tickets/tickets.service.ts
import { Injectable } from '@nestjs/common';
import { BusSewaProvider } from './integrations/bus.providers';
import { MovieProvider } from './integrations/movie.providers';
import { FlightProvider } from './integrations/flight.providers';
import { SearchBusDto } from './dto/search-bus.dto';
import { SearchMovieDto } from './dto/search-movie.dto';
import { SearchFlightDto } from './dto/search-flights.dto';

@Injectable()
export class TicketsService {
  constructor(
    private readonly busProvider: BusSewaProvider,
    private readonly movieProvider: MovieProvider,
    private readonly flightProvider: FlightProvider,
  ) {}

  searchBus(params: SearchBusDto) {
    return this.busProvider.searchBus(params);
  }

  searchMovie(params: SearchMovieDto) {
    return this.movieProvider.searchMovie(params);
  }

  searchFlight(params: SearchFlightDto) {
    return this.flightProvider.searchFlight(params);
  }
}
