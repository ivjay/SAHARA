// src/tickets/dto/search-flight.dto.ts
import { IsOptional, IsString, IsISO8601, IsInt, Min } from 'class-validator';

export class SearchFlightDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsISO8601()
  date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  passengers?: number;

  @IsOptional()
  @IsString()
  cabinClass?: string; // "Economy", "Business"

  @IsOptional()
  @IsString()
  preferredAirline?: string; // "Buddha Air", "Yeti"
}
