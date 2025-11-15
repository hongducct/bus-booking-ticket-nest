import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Station } from './station.entity';

export enum PointType {
  PICKUP = 'pickup', // Điểm đón
  DROPOFF = 'dropoff', // Điểm trả
  BOTH = 'both', // Cả đón và trả
}

@Entity('station_points')
export class StationPoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Station, (station) => station.points)
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @Column({ name: 'station_id' })
  stationId: string;

  @Column()
  name: string; // Tên điểm đón/trả, ví dụ: "Bến xe Mỹ Đình", "Trạm dừng số 1"

  @Column({ nullable: true })
  address: string; // Địa chỉ chi tiết

  @Column({
    type: 'varchar',
    enum: PointType,
    default: PointType.BOTH,
  })
  type: PointType; // Loại điểm: đón, trả, hoặc cả hai

  @Column({ type: 'int', default: 0 })
  order: number; // Thứ tự hiển thị

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Có đang hoạt động không
}

