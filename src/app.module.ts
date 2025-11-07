import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TripsModule } from './trips/trips.module';
import { BookingsModule } from './bookings/bookings.module';
import { StationsModule } from './stations/stations.module';
import { Station } from './entities/station.entity';
import { BusCompany } from './entities/bus-company.entity';
import { Trip } from './entities/trip.entity';
import { Seat } from './entities/seat.entity';
import { Booking } from './entities/booking.entity';
import { BookingSeat } from './entities/booking-seat.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false, // Use migrations instead
      ssl: process.env.DATABASE_URL?.includes('ssl') ? { rejectUnauthorized: false } : false,
    }),
    
    TripsModule,
    BookingsModule,
    StationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
