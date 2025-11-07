import { DataSource } from 'typeorm';
import { Station } from '../entities/station.entity';
import { BusCompany } from '../entities/bus-company.entity';
import { Trip, BusType } from '../entities/trip.entity';
import { Seat, SeatStatus } from '../entities/seat.entity';
import { Booking } from '../entities/booking.entity';
import { BookingSeat } from '../entities/booking-seat.entity';

export async function seedDatabase(dataSource: DataSource) {
  const stationRepo = dataSource.getRepository(Station);
  const companyRepo = dataSource.getRepository(BusCompany);
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
    
    const companyCount = await companyRepo.count();
    if (companyCount > 0) await companyRepo.clear();
    
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

  // Create Bus Companies
  const companies = [
    { name: 'BX Nam Nghĩa - Quảng Bình', rating: 4.8, phone: '1900 1234', email: 'namnghia@bus.com' },
    { name: 'Phương Trang - FUTA Bus Lines', rating: 4.9, phone: '1900 1235', email: 'phuongtrang@bus.com' },
    { name: 'Thành Bưởi', rating: 4.7, phone: '1900 1236', email: 'thanhbuoi@bus.com' },
    { name: 'Mai Linh Express', rating: 4.6, phone: '1900 1237', email: 'mailinh@bus.com' },
    { name: 'Hà Linh', rating: 4.5, phone: '1900 1238', email: 'halinh@bus.com' },
    { name: 'Kumho Samco', rating: 4.8, phone: '1900 1239', email: 'kumho@bus.com' },
  ];

  const savedCompanies = await companyRepo.save(companies);

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

  // Create trips for multiple dates
  const trips: Partial<Trip>[] = [];
  
  dates.forEach((tripDate) => {
    trips.push({
      companyId: savedCompanies[0].id,
      fromStationId: savedStations[0].id, // Hồ Chí Minh
      toStationId: savedStations[1].id, // Đà Lạt
      date: tripDate,
      departureTime: '08:00',
      arrivalTime: '14:40',
      duration: 400, // 6h 40p
      price: 250000,
      busType: BusType.SLEEPER,
      totalSeats: 36,
      amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm'],
    });
    
    trips.push({
      companyId: savedCompanies[1].id,
      fromStationId: savedStations[0].id,
      toStationId: savedStations[1].id,
      date: tripDate,
      departureTime: '09:30',
      arrivalTime: '16:00',
      duration: 390,
      price: 280000,
      busType: BusType.LIMOUSINE,
      totalSeats: 18,
      amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Limousine', 'Massage'],
    });
    
    trips.push({
      companyId: savedCompanies[2].id,
      fromStationId: savedStations[0].id,
      toStationId: savedStations[1].id,
      date: tripDate,
      departureTime: '11:00',
      arrivalTime: '17:30',
      duration: 390,
      price: 230000,
      busType: BusType.SEAT,
      totalSeats: 40,
      amenities: ['Wifi', 'Nước uống', 'Điều hòa'],
    });
    
    trips.push({
      companyId: savedCompanies[3].id,
      fromStationId: savedStations[0].id,
      toStationId: savedStations[1].id,
      date: tripDate,
      departureTime: '13:00',
      arrivalTime: '19:40',
      duration: 400,
      price: 260000,
      busType: BusType.SLEEPER,
      totalSeats: 36,
      amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm'],
    });
    
    trips.push({
      companyId: savedCompanies[4].id,
      fromStationId: savedStations[0].id,
      toStationId: savedStations[1].id,
      date: tripDate,
      departureTime: '15:30',
      arrivalTime: '22:00',
      duration: 390,
      price: 240000,
      busType: BusType.SEAT,
      totalSeats: 40,
      amenities: ['Wifi', 'Nước uống', 'Điều hòa'],
    });
    
    trips.push({
      companyId: savedCompanies[5].id,
      fromStationId: savedStations[0].id,
      toStationId: savedStations[1].id,
      date: tripDate,
      departureTime: '17:00',
      arrivalTime: '23:30',
      duration: 390,
      price: 270000,
      busType: BusType.LIMOUSINE,
      totalSeats: 18,
      amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Limousine', 'Massage'],
    });
  });

  // Add more routes (only for tomorrow to avoid too many trips)
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  trips.push({
    companyId: savedCompanies[0].id,
    fromStationId: savedStations[2].id, // Hà Nội
    toStationId: savedStations[3].id, // Sapa
    date: tomorrow,
    departureTime: '08:00',
    arrivalTime: '14:00',
    duration: 360,
    price: 320000,
    busType: BusType.SLEEPER,
    totalSeats: 36,
    amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm'],
  });
  
  trips.push({
    companyId: savedCompanies[1].id,
    fromStationId: savedStations[0].id, // Hồ Chí Minh
    toStationId: savedStations[4].id, // Nha Trang
    date: tomorrow,
    departureTime: '09:00',
    arrivalTime: '15:00',
    duration: 360,
    price: 280000,
    busType: BusType.SLEEPER,
    totalSeats: 36,
    amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm'],
  });

  const savedTrips = await tripRepo.save(trips);

  // Create seats for each trip
  for (const trip of savedTrips) {
    await createSeats(trip.id, trip.totalSeats);
  }

  console.log('✅ Database seeded successfully!');
  console.log(`   - ${savedStations.length} stations`);
  console.log(`   - ${savedCompanies.length} bus companies`);
  console.log(`   - ${savedTrips.length} trips`);
}

