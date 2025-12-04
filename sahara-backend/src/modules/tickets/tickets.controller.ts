// src/modules/tickets/tickets.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { SearchBusDto } from './dto/search-bus.dto';
import { SearchMovieDto } from './dto/search-movie.dto';
import { SearchFlightDto } from './dto/search-flights.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('bus/search')
  async searchBus(@Body() dto: SearchBusDto) {
    return this.ticketsService.searchBus(dto);
  }

  @Post('movie/search')
  async searchMovie(@Body() dto: SearchMovieDto) {
    return this.ticketsService.searchMovie(dto);
  }

  @Post('flight/search')
  async searchFlight(@Body() dto: SearchFlightDto) {
    return this.ticketsService.searchFlight(dto);
  }
}
