import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Trip } from './trip.entity';
import { BookingSeat } from './booking-seat.entity';
import { StationPoint } from './station-point.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum PaymentMethod {
  MOMO = 'momo',
  BANK = 'bank',
  CARD = 'card',
  CASH = 'cash',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderId: string; // e.g., "VX1234567890"

  @ManyToOne(() => Trip, (trip) => trip.bookings)
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;

  @Column({ name: 'trip_id' })
  tripId: string;

  @Column()
  customerName: string;

  @Column()
  customerPhone: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column({ nullable: true, name: 'user_id', type: 'uuid' })
  userId: string | null; // Optional: null if guest booking

  @ManyToOne(() => StationPoint, { nullable: true })
  @JoinColumn({ name: 'pickup_point_id' })
  pickupPoint: StationPoint;

  @Column({ nullable: true, name: 'pickup_point_id', type: 'uuid' })
  pickupPointId: string | null;

  @ManyToOne(() => StationPoint, { nullable: true })
  @JoinColumn({ name: 'dropoff_point_id' })
  dropoffPoint: StationPoint;

  @Column({ nullable: true, name: 'dropoff_point_id', type: 'uuid' })
  dropoffPointId: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({
    type: 'varchar',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'varchar',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @OneToMany(() => BookingSeat, (bookingSeat) => bookingSeat.booking)
  bookingSeats: BookingSeat[];

  @CreateDateColumn()
  bookingDate: Date;
}

