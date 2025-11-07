import { IsString, IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchTripsDto {
  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  passengers?: number;

  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  busType?: string;

  @IsOptional()
  @IsString()
  timeSlot?: string; // 'morning', 'afternoon', 'evening'

  @IsOptional()
  @IsString()
  sortBy?: 'price' | 'time' | 'rating';
}

