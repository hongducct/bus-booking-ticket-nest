import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Trip } from './trip.entity';

@Entity('stations')
export class Station {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  address: string;

  @OneToMany(() => Trip, (trip) => trip.fromStation)
  tripsFrom: Trip[];

  @OneToMany(() => Trip, (trip) => trip.toStation)
  tripsTo: Trip[];
}

