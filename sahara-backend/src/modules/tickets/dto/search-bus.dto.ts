// src/tickets/dto/search-bus.dto.ts
import { IsOptional, IsString, IsISO8601, IsInt, Min } from 'class-validator';

export class SearchBusDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  // You can use ISO date (YYYY-MM-DD) or full ISO8601 if you want time too
  @IsOptional()
  @IsISO8601()
  date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  passengers?: number;

  @IsOptional()
  @IsString()
  busType?: string; // e.g. "Deluxe", "AC", "Sleeper"
}
