import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Booking } from '../entities/booking.entity';
import { Trip } from '../entities/trip.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Trip, User])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}

