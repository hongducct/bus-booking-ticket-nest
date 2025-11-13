import { DataSource } from 'typeorm';
import { Station } from '../entities/station.entity';
import { Trip, BusType } from '../entities/trip.entity';
import { Seat, SeatStatus } from '../entities/seat.entity';
import { Booking } from '../entities/booking.entity';
import { BookingSeat } from '../entities/booking-seat.entity';

export async function seedDatabase(dataSource: DataSource) {
  const stationRepo = dataSource.getRepository(Station);
  const tripRepo = dataSource.getRepository(Trip);
  const seatRepo = dataSource.getRepository(Seat);

  // Clear existing data (only if tables exist and have data)
  try {
    const bookingSeatRepo = dataSource.getRepository(BookingSeat);
    const bookingRepo = dataSource.getRepository(Booking);
    
    const seatCount = await seatRepo.count();
    if (seatCount > 0) await seatRepo.clear();
    
    const bookingSeatCount = await bookingSeatRepo.count();
    if (bookingSeatCount > 0) await bookingSeatRepo.clear();
    
    const bookingCount = await bookingRepo.count();
    if (bookingCount > 0) await bookingRepo.clear();
    
    const tripCount = await tripRepo.count();
    if (tripCount > 0) await tripRepo.clear();
    
    const stationCount = await stationRepo.count();
    if (stationCount > 0) await stationRepo.clear();
  } catch (error) {
    // Tables might not exist yet, continue with seeding
    console.log('Clearing existing data skipped:', error.message);
  }

  // Create Stations
  const stations = [
    { name: 'Hồ Chí Minh', city: 'Hồ Chí Minh', address: 'Bến xe Miền Đông' },
    { name: 'Đà Lạt', city: 'Đà Lạt', address: 'Bến xe Đà Lạt' },
    { name: 'Hà Nội', city: 'Hà Nội', address: 'Bến xe Mỹ Đình' },
    { name: 'Sapa', city: 'Sapa', address: 'Bến xe Sapa' },
    { name: 'Nha Trang', city: 'Nha Trang', address: 'Bến xe Nha Trang' },
    { name: 'Hải Phòng', city: 'Hải Phòng', address: 'Bến xe Hải Phòng' },
    { name: 'Đà Nẵng', city: 'Đà Nẵng', address: 'Bến xe Đà Nẵng' },
    { name: 'Cần Thơ', city: 'Cần Thơ', address: 'Bến xe Cần Thơ' },
    { name: 'Vũng Tàu', city: 'Vũng Tàu', address: 'Bến xe Vũng Tàu' },
  ];

  const savedStations = await stationRepo.save(stations);

  // Helper function to create seats for a trip
  const createSeats = async (tripId: string, totalSeats: number) => {
    const seats: Partial<Seat>[] = [];
    
    // Floor 1 layout
    const floor1Layout = [
      ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'],
      ['D1', 'D2', 'D3', 'D4', 'D5'],
    ];
    
    floor1Layout.forEach((row, rowIndex) => {
      row.forEach((seatNum) => {
        const randomStatus = Math.random();
        let status = SeatStatus.AVAILABLE;
        
        if (randomStatus < 0.15) status = SeatStatus.BOOKED;
        else if (randomStatus < 0.25) status = SeatStatus.HOLDING;
        
        seats.push({
          tripId,
          number: seatNum,
          row: rowIndex,
          floor: 1,
          status,
        });
      });
    });

    // Floor 2 layout
    const floor2Layout = [
      ['F1', 'F2', 'F3', 'F4', 'F5'],
      ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
      ['C1', 'C2', 'C3', 'C4', 'C5'],
      ['E1', 'E2', 'E3', 'E4', 'E5'],
    ];
    
    floor2Layout.forEach((row, rowIndex) => {
      row.forEach((seatNum) => {
        const randomStatus = Math.random();
        let status = SeatStatus.AVAILABLE;
        
        if (randomStatus < 0.15) status = SeatStatus.BOOKED;
        else if (randomStatus < 0.25) status = SeatStatus.HOLDING;
        
        seats.push({
          tripId,
          number: seatNum,
          row: rowIndex,
          floor: 2,
          status,
        });
      });
    });

    await seatRepo.save(seats);
  };

  // Create Trips
  // Create trips for today, tomorrow, and next 7 days
  const today = new Date();
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }

  // Create trips for multiple dates - All trips belong to MaiLinh Transit
  const trips: Partial<Trip>[] = [];
  
  dates.forEach((tripDate) => {
      // Hồ Chí Minh -> Đà Lạt routes
      trips.push({
      fromStationId: savedStations[0].id, // Hồ Chí Minh
      toStationId: savedStations[1].id, // Đà Lạt
      date: tripDate,
      departureTime: '06:00',
      arrivalTime: '12:40',
      duration: 400, // 6h 40p
      price: 250000,
      busType: BusType.SLEEPER,
      totalSeats: 36,
      amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm', 'TV'],
    });
    
    trips.push({
      fromStationId: savedStations[0].id,
      toStationId: savedStations[1].id,
      date: tripDate,
      departureTime: '08:00',
      arrivalTime: '14:40',
      duration: 400,
      price: 250000,
      busType: BusType.SLEEPER,
      totalSeats: 36,
      amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm', 'TV'],
    });
    
    trips.push({
      fromStationId: savedStations[0].id,
      toStationId: savedStations[1].id,
      date: tripDate,
      departureTime: '10:00',
      arrivalTime: '16:40',
      duration: 400,
      price: 250000,
      busType: BusType.SLEEPER,
      totalSeats: 36,
      amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm', 'TV'],
    });
    
    trips.push({
      fromStationId: savedStations[0].id,
      toStationId: savedStations[1].id,
      date: tripDate,
      departureTime: '13:00',
      arrivalTime: '19:40',
      duration: 400,
      price: 260000,
      busType: BusType.SLEEPER,
      totalSeats: 36,
      amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm', 'TV', 'Massage'],
    });
    
    trips.push({
      fromStationId: savedStations[0].id,
      toStationId: savedStations[1].id,
      date: tripDate,
      departureTime: '15:00',
      arrivalTime: '21:40',
      duration: 400,
      price: 260000,
      busType: BusType.SLEEPER,
      totalSeats: 36,
      amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm', 'TV'],
    });
    
    trips.push({
      fromStationId: savedStations[0].id,
      toStationId: savedStations[1].id,
      date: tripDate,
      departureTime: '20:00',
      arrivalTime: '02:40',
      duration: 400,
      price: 270000,
      busType: BusType.SLEEPER,
      totalSeats: 36,
      amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm', 'TV', 'Massage'],
    });
  });

  // Add more routes for MaiLinh Transit
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Hà Nội -> Sapa
  trips.push({
    fromStationId: savedStations[2].id, // Hà Nội
    toStationId: savedStations[3].id, // Sapa
    date: tomorrow,
    departureTime: '08:00',
    arrivalTime: '14:00',
    duration: 360,
    price: 320000,
    busType: BusType.SLEEPER,
    totalSeats: 36,
    amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm', 'TV'],
  });
  
  // Hồ Chí Minh -> Nha Trang
  trips.push({
    fromStationId: savedStations[0].id, // Hồ Chí Minh
    toStationId: savedStations[4].id, // Nha Trang
    date: tomorrow,
    departureTime: '08:00',
    arrivalTime: '14:00',
    duration: 360,
    price: 280000,
    busType: BusType.SLEEPER,
    totalSeats: 36,
    amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm', 'TV'],
  });
  
  // Hà Nội -> Hải Phòng
  trips.push({
    fromStationId: savedStations[2].id, // Hà Nội
    toStationId: savedStations[5].id, // Hải Phòng
    date: tomorrow,
    departureTime: '07:00',
    arrivalTime: '10:00',
    duration: 180,
    price: 150000,
    busType: BusType.SEAT,
    totalSeats: 40,
    amenities: ['Wifi', 'Nước uống', 'Điều hòa'],
  });
  
  // Hồ Chí Minh -> Đà Nẵng
  trips.push({
    fromStationId: savedStations[0].id, // Hồ Chí Minh
    toStationId: savedStations[6].id, // Đà Nẵng
    date: tomorrow,
    departureTime: '09:00',
    arrivalTime: '21:00',
    duration: 720,
    price: 450000,
    busType: BusType.SLEEPER,
    totalSeats: 36,
    amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm', 'TV', 'Massage'],
  });

  const savedTrips = await tripRepo.save(trips);

  // Create seats for each trip
  for (const trip of savedTrips) {
    await createSeats(trip.id, trip.totalSeats);
  }

  console.log('✅ Database seeded successfully!');
  console.log(`   - ${savedStations.length} stations`);
  console.log(`   - ${savedTrips.length} trips (MaiLinh Transit)`);
}

