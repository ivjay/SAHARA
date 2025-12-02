// src/tickets/dto/search-movie.dto.ts
import { IsOptional, IsString, IsISO8601, IsInt, Min } from 'class-validator';

export class SearchMovieDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  cinemaName?: string;

  @IsOptional()
  @IsString()
  movieName?: string;

  @IsOptional()
  @IsISO8601()
  date?: string;

  @IsOptional()
  @IsString()
  showTime?: string; // "19:00", "7:00 PM"

  @IsOptional()
  @IsInt()
  @Min(1)
  seats?: number;

  @IsOptional()
  @IsString()
  seatType?: string; // "Gold", "Balcony"
}
