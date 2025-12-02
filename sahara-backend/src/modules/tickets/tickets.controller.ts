import { Controller, Get, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { SearchBusDto } from './dto/search-bus.dto';
import { SearchMovieDto } from './dto/search-movie.dto';
import { SearchFlightDto } from './dto/search-flights.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('bus')
  async searchBus(@Query() query: SearchBusDto) {
    // Example: /tickets/bus?from=Kathmandu&to=Pokhara&date=2025-12-03&passengers=1
    return this.ticketsService.searchBus(query);
  }

  @Get('movie')
  async searchMovie(@Query() query: SearchMovieDto) {
    // Example: /tickets/movie?city=Kathmandu&date=2025-12-03&movieName=Dune
    return this.ticketsService.searchMovie(query);
  }

  @Get('flight')
  async searchFlight(@Query() query: SearchFlightDto) {
    // Example: /tickets/flight?from=KTM&to=PKR&date=2025-12-03&passengers=2
    return this.ticketsService.searchFlight(query);
  }
}
