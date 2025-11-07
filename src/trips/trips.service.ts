import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Trip } from '../entities/trip.entity';
import { Station } from '../entities/station.entity';
import { BusCompany } from '../entities/bus-company.entity';
import { Seat, SeatStatus } from '../entities/seat.entity';
import { SearchTripsDto } from './dto/search-trips.dto';
import { BusType } from '../entities/trip.entity';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private tripsRepository: Repository<Trip>,
    @InjectRepository(Station)
    private stationsRepository: Repository<Station>,
    @InjectRepository(BusCompany)
    private busCompaniesRepository: Repository<BusCompany>,
    @InjectRepository(Seat)
    private seatsRepository: Repository<Seat>,
  ) {}

  async searchTrips(searchDto: SearchTripsDto) {
    try {
      const { from, to, date, minPrice, maxPrice, busType, timeSlot, sortBy } =
        searchDto;

      console.log('Search request:', { from, to, date, minPrice, maxPrice, busType, timeSlot, sortBy });

      // Find stations (case-insensitive search for PostgreSQL)
      const fromStation = await this.stationsRepository
        .createQueryBuilder('station')
        .where('LOWER(station.name) = LOWER(:name)', { name: from })
        .getOne();
      
      const toStation = await this.stationsRepository
        .createQueryBuilder('station')
        .where('LOWER(station.name) = LOWER(:name)', { name: to })
        .getOne();

      if (!fromStation || !toStation) {
        console.log('Stations not found:', { from, to, fromStation: !!fromStation, toStation: !!toStation });
        // Log available stations for debugging
        const allStations = await this.stationsRepository.find();
        console.log('Available stations:', allStations.map(s => s.name));
        return [];
      }

    // Build query
    // Use date string directly for comparison (PostgreSQL handles date comparison well)
    const queryBuilder = this.tripsRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.company', 'company')
      .leftJoinAndSelect('trip.fromStation', 'fromStation')
      .leftJoinAndSelect('trip.toStation', 'toStation')
      .where('trip.fromStationId = :fromId', { fromId: fromStation.id })
      .andWhere('trip.toStationId = :toId', { toId: toStation.id })
      .andWhere('trip.date = :date', { date });
    
    console.log('Search query:', { fromStation: fromStation.name, toStation: toStation.name, date });

    // Price filter
    if (minPrice) {
      queryBuilder.andWhere('trip.price >= :minPrice', { minPrice });
    }
    if (maxPrice) {
      queryBuilder.andWhere('trip.price <= :maxPrice', { maxPrice });
    }

    // Bus type filter
    if (busType) {
      queryBuilder.andWhere('trip.busType = :busType', { busType });
    }

    // Time slot filter (PostgreSQL syntax)
    if (timeSlot) {
      if (timeSlot === 'morning') {
        queryBuilder.andWhere(
          "EXTRACT(HOUR FROM trip.departureTime::time) >= 6",
        );
        queryBuilder.andWhere(
          "EXTRACT(HOUR FROM trip.departureTime::time) < 12",
        );
      } else if (timeSlot === 'afternoon') {
        queryBuilder.andWhere(
          "EXTRACT(HOUR FROM trip.departureTime::time) >= 12",
        );
        queryBuilder.andWhere(
          "EXTRACT(HOUR FROM trip.departureTime::time) < 18",
        );
      } else if (timeSlot === 'evening') {
        queryBuilder.andWhere(
          "(EXTRACT(HOUR FROM trip.departureTime::time) >= 18 OR EXTRACT(HOUR FROM trip.departureTime::time) < 6)",
        );
      }
    }

    // Sort
    if (sortBy === 'price') {
      queryBuilder.orderBy('trip.price', 'ASC');
    } else if (sortBy === 'rating') {
      queryBuilder.orderBy('company.rating', 'DESC');
    } else {
      queryBuilder.orderBy('trip.departureTime', 'ASC');
    }

    const trips = await queryBuilder.getMany();
    
    console.log(`Found ${trips.length} trips for search`);

    // Get available seats count for each trip
    const tripsWithSeats = await Promise.all(
      trips.map(async (trip) => {
        try {
          const availableSeats = await this.seatsRepository.count({
            where: {
              tripId: trip.id,
              status: SeatStatus.AVAILABLE,
            },
          });

          const totalSeats = await this.seatsRepository.count({
            where: { tripId: trip.id },
          });

          return {
            ...trip,
            availableSeats,
            totalSeats,
          };
        } catch (error) {
          console.error(`Error getting seats for trip ${trip.id}:`, error);
          return {
            ...trip,
            availableSeats: 0,
            totalSeats: trip.totalSeats || 0,
          };
        }
      }),
    );

      return tripsWithSeats;
    } catch (error) {
      console.error('Error in searchTrips:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  async findOne(id: string) {
    return this.tripsRepository.findOne({
      where: { id },
      relations: ['company', 'fromStation', 'toStation'],
    });
  }

  async getSeats(tripId: string) {
    return this.seatsRepository.find({
      where: { tripId },
      order: { floor: 'ASC', row: 'ASC', number: 'ASC' },
    });
  }

  async holdSeats(tripId: string, seatIds: string[]) {
    const holdUntil = new Date();
    holdUntil.setMinutes(holdUntil.getMinutes() + 15); // Hold for 15 minutes

    await this.seatsRepository.update(
      {
        id: In(seatIds),
        tripId,
        status: SeatStatus.AVAILABLE,
      },
      {
        status: SeatStatus.HOLDING,
        holdUntil,
      },
    );

    return this.seatsRepository.find({
      where: { id: In(seatIds) },
    });
  }

  async releaseSeats(seatIds: string[]) {
    const seats = await this.seatsRepository.find({
      where: { id: In(seatIds), status: SeatStatus.HOLDING },
    });

    for (const seat of seats) {
      seat.status = SeatStatus.AVAILABLE;
      seat.holdUntil = null;
      await this.seatsRepository.save(seat);
    }
  }
}

