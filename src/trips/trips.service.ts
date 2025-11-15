import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Trip } from '../entities/trip.entity';
import { Station } from '../entities/station.entity';
import { Seat, SeatStatus } from '../entities/seat.entity';
import { StationPoint, PointType } from '../entities/station-point.entity';
import { SearchTripsDto } from './dto/search-trips.dto';
import { BusType } from '../entities/trip.entity';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private tripsRepository: Repository<Trip>,
    @InjectRepository(Station)
    private stationsRepository: Repository<Station>,
    @InjectRepository(Seat)
    private seatsRepository: Repository<Seat>,
    @InjectRepository(StationPoint)
    private stationPointsRepository: Repository<StationPoint>,
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
      relations: ['fromStation', 'toStation'],
    });
  }

  async getTripPoints(tripId: string) {
    const trip = await this.tripsRepository.findOne({
      where: { id: tripId },
      relations: ['fromStation', 'toStation'],
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    // Get pickup points (from station - pickup or both)
    const pickupPoints = await this.stationPointsRepository.find({
      where: {
        stationId: trip.fromStationId,
        isActive: true,
        type: In([PointType.PICKUP, PointType.BOTH]),
      },
      order: { order: 'ASC', name: 'ASC' },
    });

    // Get dropoff points (to station - dropoff or both)
    const dropoffPoints = await this.stationPointsRepository.find({
      where: {
        stationId: trip.toStationId,
        isActive: true,
        type: In([PointType.DROPOFF, PointType.BOTH]),
      },
      order: { order: 'ASC', name: 'ASC' },
    });

    return {
      pickupPoints,
      dropoffPoints,
    };
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

  async createTrip(createTripDto: any) {
    const {
      fromStationId,
      toStationId,
      date,
      departureTime,
      arrivalTime,
      duration,
      price,
      busType = BusType.SEAT,
      totalSeats = 40,
      amenities = [],
    } = createTripDto;

    // Verify stations exist
    const fromStation = await this.stationsRepository.findOne({
      where: { id: fromStationId },
    });
    if (!fromStation) {
      throw new Error('From station not found');
    }

    const toStation = await this.stationsRepository.findOne({
      where: { id: toStationId },
    });
    if (!toStation) {
      throw new Error('To station not found');
    }

    // Check if trip already exists for this date and route
    const existingTrip = await this.tripsRepository.findOne({
      where: {
        fromStationId,
        toStationId,
        date: new Date(date),
        departureTime,
      },
    });

    if (existingTrip) {
      throw new Error('Trip already exists for this date and time');
    }

    // Create trip
    const trip = this.tripsRepository.create({
      fromStationId,
      toStationId,
      date: new Date(date),
      departureTime,
      arrivalTime,
      duration,
      price,
      busType,
      totalSeats,
      amenities,
    });

    const savedTrip = await this.tripsRepository.save(trip);

    // Create seats for the trip
    await this.createSeatsForTrip(savedTrip.id, totalSeats);

    return this.findOne(savedTrip.id);
  }

  async createTripsBatch(createTripsBatchDto: any) {
    const {
      fromStationId,
      toStationId,
      startDate,
      days = 30,
      departureTime,
      arrivalTime,
      duration,
      price,
      busType = BusType.SEAT,
      totalSeats = 40,
      amenities = [],
    } = createTripsBatchDto;

    const start = new Date(startDate);
    const trips: Trip[] = [];
    const errors: Array<{ date: string; error: string }> = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      try {
        const trip = await this.createTrip({
          fromStationId,
          toStationId,
          date: dateStr,
          departureTime,
          arrivalTime,
          duration,
          price,
          busType,
          totalSeats,
          amenities,
        });
        if (trip) {
          trips.push(trip);
        }
      } catch (error: any) {
        errors.push({ date: dateStr, error: error?.message || 'Unknown error' });
      }
    }

    return {
      success: trips.length,
      failed: errors.length,
      trips,
      errors,
    };
  }

  private async createSeatsForTrip(tripId: string, totalSeats: number) {
    const seats: Partial<Seat>[] = [];
    
    // Floor 1 layout
    const floor1Layout = [
      ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'],
      ['D1', 'D2', 'D3', 'D4', 'D5'],
    ];
    
    floor1Layout.forEach((row, rowIndex) => {
      row.forEach((seatNum) => {
        seats.push({
          tripId,
          number: seatNum,
          row: rowIndex,
          floor: 1,
          status: SeatStatus.AVAILABLE,
        });
      });
    });

    // Floor 2 layout
    const floor2Layout = [
      ['F1', 'F2', 'F3', 'F4', 'F5'],
      ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
    ];

    floor2Layout.forEach((row, rowIndex) => {
      row.forEach((seatNum) => {
        seats.push({
          tripId,
          number: seatNum,
          row: rowIndex,
          floor: 2,
          status: SeatStatus.AVAILABLE,
        });
      });
    });

    // Add more seats if needed
    let seatCount = seats.length;
    let floor = 1;
    let row = 2;
    let number = 1;

    while (seatCount < totalSeats) {
      const seatNum = `C${number}`;
      seats.push({
        tripId,
        number: seatNum,
        row,
        floor,
        status: SeatStatus.AVAILABLE,
      });

      seatCount++;
      number++;

      if (number > 6) {
        number = 1;
        row++;
        if (row > 3) {
          row = 0;
          floor = floor === 1 ? 2 : 1;
        }
      }
    }

    await this.seatsRepository.save(seats);
  }
}

