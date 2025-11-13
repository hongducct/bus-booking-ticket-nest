import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BusType } from '../../entities/trip.entity';

export class CreateTripDto {
  @ApiProperty({ example: 'uuid-of-company' })
  @IsString()
  companyId: string;

  @ApiProperty({ example: 'uuid-of-from-station' })
  @IsString()
  fromStationId: string;

  @ApiProperty({ example: 'uuid-of-to-station' })
  @IsString()
  toStationId: string;

  @ApiProperty({ example: '2025-11-11' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '08:00' })
  @IsString()
  departureTime: string;

  @ApiProperty({ example: '14:00' })
  @IsString()
  arrivalTime: string;

  @ApiProperty({ example: 360 })
  @IsNumber()
  duration: number; // in minutes

  @ApiProperty({ example: 200000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ enum: BusType, example: BusType.SEAT, required: false })
  @IsOptional()
  @IsEnum(BusType)
  busType?: BusType;

  @ApiProperty({ example: 40, required: false })
  @IsOptional()
  @IsNumber()
  totalSeats?: number;

  @ApiProperty({ example: ['wifi', 'ac', 'toilet'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
}

