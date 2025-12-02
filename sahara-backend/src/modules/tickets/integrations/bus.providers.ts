// src/tickets/integrations/bus.providers.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { SearchBusDto } from '../dto/search-bus.dto';

@Injectable()
export class BusSewaProvider {
  private readonly logger = new Logger(BusSewaProvider.name);
  private readonly baseUrl =
    process.env.BUS_API_BASE ?? 'https://api.bussewa.nepal'; // placeholder

  async searchBus(params: SearchBusDto) {
    const { from, to, date, passengers, busType } = params;

    try {
      const res = await axios.get(`${this.baseUrl}/search`, {
        params: { from, to, date, passengers, busType },
      });

      return res.data;
    } catch (err) {
      this.logger.error(
        'Bus search failed',
        err instanceof Error ? err.stack : String(err),
      );
      return { results: [], error: 'BUS_SEARCH_FAILED' };
    }
  }
}
