import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Trip } from './trip.entity';
import { BookingSeat } from './booking-seat.entity';

export enum SeatStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  HOLDING = 'holding',
}

@Entity('seats')
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Trip, (trip) => trip.seats)
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;

  @Column({ name: 'trip_id' })
  tripId: string;

  @Column()
  number: string; // e.g., "A1", "B2", "F5"

  @Column({ type: 'int' })
  row: number;

  @Column({ type: 'int' })
  floor: number; // 1 or 2

  @Column({
    type: 'varchar',
    enum: SeatStatus,
    default: SeatStatus.AVAILABLE,
  })
  status: SeatStatus;

  @Column({ type: 'timestamptz', nullable: true })
  holdUntil: Date | null;

  @OneToMany(() => BookingSeat, (bookingSeat) => bookingSeat.seat)
  bookingSeats: BookingSeat[];
}

