import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Station } from '../entities/station.entity';
import { StationPoint, PointType } from '../entities/station-point.entity';

@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Station)
    private stationsRepository: Repository<Station>,
    @InjectRepository(StationPoint)
    private stationPointsRepository: Repository<StationPoint>,
  ) {}

  async findAll() {
    return this.stationsRepository.find({
      order: { city: 'ASC', name: 'ASC' },
    });
  }

  async getPopularRoutes() {
    // Return popular route combinations
    return [
      { from: 'Hà Tĩnh', to: 'Hà Nội', price: '250,000đ' },
      { from: 'Hà Nội', to: 'Hà Tĩnh', price: '320,000đ' },
      { from: 'Hà Tĩnh', to: 'Hà Nội', price: '280,000đ' },
      { from: 'Hà Nội', to: 'Hà Tĩnh', price: '320,000đ' },
    ];
  }

  async getStationPoints(stationId: string, type?: PointType) {
    const where: any = {
      stationId,
      isActive: true,
    };

    if (type) {
      where.type = type;
    } else {
      // If no type specified, get both pickup and dropoff points
      where.type = In([PointType.PICKUP, PointType.DROPOFF, PointType.BOTH]);
    }

    return this.stationPointsRepository.find({
      where,
      order: { order: 'ASC', name: 'ASC' },
    });
  }
}

