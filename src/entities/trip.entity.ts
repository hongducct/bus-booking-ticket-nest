import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Station } from './station.entity';
import { Seat } from './seat.entity';
import { Booking } from './booking.entity';

export enum BusType {
  SEAT = 'seat',
  SLEEPER = 'sleeper',
  LIMOUSINE = 'limousine',
}

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Station, (station) => station.tripsFrom)
  @JoinColumn({ name: 'from_station_id' })
  fromStation: Station;

  @Column({ name: 'from_station_id' })
  fromStationId: string;

  @ManyToOne(() => Station, (station) => station.tripsTo)
  @JoinColumn({ name: 'to_station_id' })
  toStation: Station;

  @Column({ name: 'to_station_id' })
  toStationId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  departureTime: string;

  @Column({ type: 'time' })
  arrivalTime: string;

  @Column({ type: 'int' })
  duration: number; // in minutes

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'varchar',
    enum: BusType,
    default: BusType.SEAT,
  })
  busType: BusType;

  @Column({ type: 'int', default: 0 })
  totalSeats: number;

  @Column({ type: 'simple-array', nullable: true })
  amenities: string[];

  @OneToMany(() => Seat, (seat) => seat.trip)
  seats: Seat[];

  @OneToMany(() => Booking, (booking) => booking.trip)
  bookings: Booking[];
}

