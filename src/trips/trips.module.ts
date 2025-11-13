import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { Trip } from '../entities/trip.entity';
import { Station } from '../entities/station.entity';
import { Seat } from '../entities/seat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trip, Station, Seat])],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}

