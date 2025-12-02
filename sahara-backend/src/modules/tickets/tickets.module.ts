import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { BusSewaProvider } from './integrations/bus.providers';
import { MovieProvider } from './integrations/movie.providers';
import { FlightProvider } from './integrations/flight.providers';

@Module({
  providers: [TicketsService, BusSewaProvider, MovieProvider, FlightProvider],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}
