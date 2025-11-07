import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from '../entities/station.entity';

@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Station)
    private stationsRepository: Repository<Station>,
  ) {}

  async findAll() {
    return this.stationsRepository.find({
      order: { city: 'ASC', name: 'ASC' },
    });
  }

  async getPopularRoutes() {
    // Return popular route combinations
    return [
      { from: 'Hồ Chí Minh', to: 'Đà Lạt', price: '250,000đ' },
      { from: 'Hà Nội', to: 'Sapa', price: '320,000đ' },
      { from: 'Hồ Chí Minh', to: 'Nha Trang', price: '280,000đ' },
      { from: 'Hà Nội', to: 'Hải Phòng', price: '150,000đ' },
    ];
  }
}

