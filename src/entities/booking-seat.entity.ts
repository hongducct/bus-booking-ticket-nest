import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from './booking.entity';
import { Seat } from './seat.entity';

@Entity('booking_seats')
export class BookingSeat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Booking, (booking) => booking.bookingSeats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'booking_id' })
  bookingId: string;

  @ManyToOne(() => Seat, (seat) => seat.bookingSeats)
  @JoinColumn({ name: 'seat_id' })
  seat: Seat;

  @Column({ name: 'seat_id' })
  seatId: string;
}

