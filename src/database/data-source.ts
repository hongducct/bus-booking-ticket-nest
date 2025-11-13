import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Station } from '../entities/station.entity';
import { Trip } from '../entities/trip.entity';
import { Seat } from '../entities/seat.entity';
import { Booking } from '../entities/booking.entity';
import { BookingSeat } from '../entities/booking-seat.entity';
import { User } from '../entities/user.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Station, Trip, Seat, Booking, BookingSeat, User],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: false,
  ssl: process.env.DATABASE_URL?.includes('ssl') ? { rejectUnauthorized: false } : false,
});

