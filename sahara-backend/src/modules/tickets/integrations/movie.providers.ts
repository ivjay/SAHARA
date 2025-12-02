// src/tickets/integrations/movie.providers.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { SearchMovieDto } from '../dto/search-movie.dto';

@Injectable()
export class MovieProvider {
  private readonly logger = new Logger(MovieProvider.name);
  private readonly baseUrl =
    process.env.MOVIE_API_BASE ?? 'https://api.movies.nepal'; // placeholder

  async searchMovie(params: SearchMovieDto) {
    const {
      city,
      cinemaName,
      movieName,
      date,
      showTime,
      seats,
      seatType,
    } = params;

    try {
      const res = await axios.get(`${this.baseUrl}/search`, {
        params: {
          city,
          cinemaName,
          movieName,
          date,
          showTime,
          seats,
          seatType,
        },
      });

      return res.data;
    } catch (err) {
      this.logger.error(
        'Movie search failed',
        err instanceof Error ? err.stack : String(err),
      );
      return { results: [], error: 'MOVIE_SEARCH_FAILED' };
    }
  }
}
