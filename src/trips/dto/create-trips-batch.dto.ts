import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsDateString, Min, IsInt, MinDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BusType } from '../../entities/trip.entity';

export class CreateTripsBatchDto {
  @ApiProperty({ example: 'uuid-of-from-station' })
  @IsString()
  fromStationId: string;

  @ApiProperty({ example: 'uuid-of-to-station' })
  @IsString()
  toStationId: string;

  @ApiProperty({ example: '2025-11-11' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: 30, description: 'Số ngày để tạo trips (mặc định 30)' })
  @IsInt()
  @Min(1)
  days: number = 30;

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

