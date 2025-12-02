// src/tickets/integrations/flight.providers.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { SearchFlightDto } from '../dto/search-flights.dto';

@Injectable()
export class FlightProvider {
  private readonly logger = new Logger(FlightProvider.name);
  private readonly baseUrl =
    process.env.FLIGHT_API_BASE ?? 'https://api.flights.nepal'; // placeholder

  async searchFlight(params: SearchFlightDto) {
    const { from, to, date, passengers, cabinClass, preferredAirline } = params;

    try {
      // TODO: replace with real airline aggregator / GDS API
      const res = await axios.get(`${this.baseUrl}/search`, {
        params: { from, to, date, passengers, cabinClass, preferredAirline },
      });

      return res.data;
    } catch (err) {
      this.logger.error(
        'Flight search failed',
        err instanceof Error ? err.stack : String(err),
      );
      return { results: [], error: 'FLIGHT_SEARCH_FAILED' };
    }
  }
}
