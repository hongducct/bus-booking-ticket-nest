import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingSeatDto {
  @IsUUID()
  seatId: string;
}

export class CreateBookingDto {
  @IsUUID()
  tripId: string;

  @IsString()
  customerName: string;

  @IsString()
  customerPhone: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  pickupPoint?: string;

  @IsOptional()
  @IsString()
  dropoffPoint?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBookingSeatDto)
  seats: CreateBookingSeatDto[];
}

