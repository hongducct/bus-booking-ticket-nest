import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from '../entities/booking.entity';
import { BookingSeat } from '../entities/booking-seat.entity';
import { Seat } from '../entities/seat.entity';
import { Trip } from '../entities/trip.entity';
import { StationPoint } from '../entities/station-point.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, BookingSeat, Seat, Trip, StationPoint])],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}

