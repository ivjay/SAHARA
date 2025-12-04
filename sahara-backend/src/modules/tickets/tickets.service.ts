// src/modules/tickets/tickets.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma.service';
import { SearchBusDto } from './dto/search-bus.dto';
import { SearchMovieDto } from './dto/search-movie.dto';
import { SearchFlightDto } from './dto/search-flights.dto';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  // BUS
  async searchBus(params: SearchBusDto) {
    const baseDate = params.date ?? new Date().toISOString().slice(0, 10);
    const day = new Date(baseDate);

    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    // 👇 cast to any so TS stops complaining about busTrip
    const prisma = this.prisma as any;

    return prisma.busTrip.findMany({
      where: {
        from: params.from,
        to: params.to,
        date: { gte: start, lte: end },
        seatsLeft: { gt: 0 },
      },
      include: {
        provider: true,
      },
      orderBy: { price: 'asc' },
    });
  }

  // MOVIE
  async searchMovie(params: SearchMovieDto) {
    let timeFilter:
      | {
          gte: Date;
          lte: Date;
        }
      | undefined;

    if (params.date) {
      const d = new Date(params.date);
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      timeFilter = { gte: start, lte: end };
    }

    const prisma = this.prisma as any;

    return prisma.movieShow.findMany({
      where: {
        time: timeFilter,
        movieName: params.movieName
          ? { contains: params.movieName, mode: 'insensitive' }
          : undefined,
        seatsLeft: { gt: 0 },
      },
      include: {
        provider: true,
      },
      orderBy: { time: 'asc' },
    });
  }

  // FLIGHT
  async searchFlight(params: SearchFlightDto) {
    const baseDate = params.date ?? new Date().toISOString().slice(0, 10);
    const day = new Date(baseDate);

    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    const prisma = this.prisma as any;

    return prisma.flightTrip.findMany({
      where: {
        from: params.from,
        to: params.to,
        date: { gte: start, lte: end },
        seatsLeft: { gt: 0 },
      },
      include: {
        provider: true,
      },
      orderBy: { price: 'asc' },
    });
  }
}
