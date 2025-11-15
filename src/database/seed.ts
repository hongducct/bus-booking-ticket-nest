import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Station } from '../entities/station.entity';
import { StationPoint, PointType } from '../entities/station-point.entity';
import { Trip, BusType } from '../entities/trip.entity';
import { Seat, SeatStatus } from '../entities/seat.entity';
import { Booking } from '../entities/booking.entity';
import { BookingSeat } from '../entities/booking-seat.entity';
import { User, UserRole } from '../entities/user.entity';

export async function seedDatabase(dataSource: DataSource) {
  const stationRepo = dataSource.getRepository(Station);
  const stationPointRepo = dataSource.getRepository(StationPoint);
  const tripRepo = dataSource.getRepository(Trip);
  const seatRepo = dataSource.getRepository(Seat);
  const userRepo = dataSource.getRepository(User);

  // Clear ALL existing data (fresh start every time)
  console.log('🗑️  Clearing all existing data...');
  try {
    // Use raw SQL queries to delete all data in correct order
    // This avoids the "Empty criteria" error with TypeORM delete()
    
    // Delete in correct order (child tables first, respecting foreign keys)
    // 1. booking_seats (references bookings and seats)
    const bookingSeatCount = await dataSource.query('SELECT COUNT(*) as count FROM booking_seats');
    if (parseInt(bookingSeatCount[0]?.count || '0') > 0) {
      await dataSource.query('DELETE FROM booking_seats');
      console.log(`   - Deleted booking seats`);
    }
    
    // 2. bookings (references trips, users, station_points)
    const bookingCount = await dataSource.query('SELECT COUNT(*) as count FROM bookings');
    if (parseInt(bookingCount[0]?.count || '0') > 0) {
      await dataSource.query('DELETE FROM bookings');
      console.log(`   - Deleted bookings`);
    }
    
    // 3. seats (references trips)
    const seatCount = await dataSource.query('SELECT COUNT(*) as count FROM seats');
    if (parseInt(seatCount[0]?.count || '0') > 0) {
      await dataSource.query('DELETE FROM seats');
      console.log(`   - Deleted seats`);
    }
    
    // 4. trips (references stations)
    const tripCount = await dataSource.query('SELECT COUNT(*) as count FROM trips');
    if (parseInt(tripCount[0]?.count || '0') > 0) {
      await dataSource.query('DELETE FROM trips');
      console.log(`   - Deleted trips`);
    }
    
    // 5. station_points (references stations)
    const stationPointCount = await dataSource.query('SELECT COUNT(*) as count FROM station_points');
    if (parseInt(stationPointCount[0]?.count || '0') > 0) {
      await dataSource.query('DELETE FROM station_points');
      console.log(`   - Deleted station points`);
    }
    
    // 6. stations (no dependencies, can be deleted last)
    const stationCount = await dataSource.query('SELECT COUNT(*) as count FROM stations');
    if (parseInt(stationCount[0]?.count || '0') > 0) {
      await dataSource.query('DELETE FROM stations');
      console.log(`   - Deleted stations`);
    }
    
    // 7. users (clear all users, we'll create admin fresh)
    const userCount = await dataSource.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(userCount[0]?.count || '0') > 0) {
      await dataSource.query('DELETE FROM users');
      console.log(`   - Deleted users`);
    }
    
    console.log('✅ All existing data cleared!');
  } catch (error: any) {
    // Tables might not exist yet, continue with seeding
    console.log('⚠️  Clearing existing data skipped:', error.message);
  }

  // Create Admin User (always create fresh)
  console.log('👤 Creating admin user...');
  try {
    // Check if admin already exists and delete it first
    const existingAdmin = await userRepo.findOne({
      where: { email: 'admin@mailinhtransit.com' },
    });
    
    if (existingAdmin) {
      await userRepo.remove(existingAdmin);
      console.log('   - Removed existing admin user');
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepo.create({
      email: 'admin@mailinhtransit.com',
      password: hashedPassword,
      name: 'Admin MaiLinh Transit',
      phone: '1900 1234',
      role: UserRole.ADMIN,
    });
    await userRepo.save(admin);
    console.log('✅ Admin user created successfully!');
    console.log('   📧 Email: admin@mailinhtransit.com');
    console.log('   🔑 Password: admin123');
    console.log('   ⚠️  Please change the password after first login!');
  } catch (error: any) {
    console.error('❌ Could not create admin user:', error.message);
    throw error;
  }

  // Create Stations
  const stations = [
    // { name: 'Hồ Chí Minh', city: 'Hồ Chí Minh', address: 'Bến xe Miền Đông' },
    // { name: 'Đà Lạt', city: 'Đà Lạt', address: 'Bến xe Đà Lạt' },
    { name: 'Hà Nội', city: 'Hà Nội', address: 'Bến xe Nước Ngầm' },
    { name: 'Hà Tĩnh', city: 'Hà Tĩnh', address: 'Bến xe Hà Tĩnh' },
    // { name: 'Sapa', city: 'Sapa', address: 'Bến xe Sapa' },
    // { name: 'Nha Trang', city: 'Nha Trang', address: 'Bến xe Nha Trang' },
    // { name: 'Hải Phòng', city: 'Hải Phòng', address: 'Bến xe Hải Phòng' },
    // { name: 'Đà Nẵng', city: 'Đà Nẵng', address: 'Bến xe Đà Nẵng' },
    // { name: 'Cần Thơ', city: 'Cần Thơ', address: 'Bến xe Cần Thơ' },
    // { name: 'Vũng Tàu', city: 'Vũng Tàu', address: 'Bến xe Vũng Tàu' },
  ];
  
  const savedStations = await stationRepo.save(stations);
  console.log(`✅ Created ${savedStations.length} stations`);

  // Create Station Points (điểm đón/trả) for each station
  console.log('📍 Creating station points...');
  const stationPoints: Partial<StationPoint>[] = [];

  // Hà Nội - multiple pickup/dropoff points
  const haNoiStation = savedStations.find(s => s.name === 'Hà Nội');
  if (haNoiStation) {
    stationPoints.push(
      { stationId: haNoiStation.id, name: 'Bến xe Mỹ Đình', address: 'Số 20 Phạm Hùng, Mỹ Đình, Nam Từ Liêm, Hà Nội', type: PointType.BOTH, order: 1 },
      { stationId: haNoiStation.id, name: 'Bến xe Giáp Bát', address: 'Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội', type: PointType.BOTH, order: 2 },
      { stationId: haNoiStation.id, name: 'Bến xe Nước Ngầm', address: 'Nguyễn Xiển, Thanh Xuân, Hà Nội', type: PointType.BOTH, order: 3 },
      { stationId: haNoiStation.id, name: 'Trạm dừng Cầu Giấy', address: 'Cầu Giấy, Hà Nội', type: PointType.PICKUP, order: 4 },
      { stationId: haNoiStation.id, name: 'Trạm dừng Long Biên', address: 'Long Biên, Hà Nội', type: PointType.PICKUP, order: 5 },
    );
  }

  // Hà Tĩnh - multiple pickup/dropoff points (example)
  // Note: Hà Tĩnh is not in the stations list, but we'll add points for other stations
  const haTinhStation = savedStations.find(s => s.name === 'Hà Tĩnh');
  if (haTinhStation) {
    stationPoints.push(
      { stationId: haTinhStation.id, name: 'Bến xe Hà Tĩnh', address: 'Bến xe Hà Tĩnh', type: PointType.BOTH, order: 1 },
      { stationId: haTinhStation.id, name: 'Trạm dừng Thạch Hà', address: 'Thạch Hà, Hà Tĩnh', type: PointType.DROPOFF, order: 2 },
      { stationId: haTinhStation.id, name: 'Trạm dừng Can Lộc', address: 'Can Lộc, Hà Tĩnh', type: PointType.DROPOFF, order: 3 },
    );
  }

  // Hồ Chí Minh
  const hcmStation = savedStations.find(s => s.name === 'Hồ Chí Minh');
  if (hcmStation) {
    stationPoints.push(
      { stationId: hcmStation.id, name: 'Bến xe Miền Đông', address: '292 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM', type: PointType.BOTH, order: 1 },
      { stationId: hcmStation.id, name: 'Bến xe Miền Tây', address: '395 Kinh Dương Vương, An Lạc, Bình Tân, TP.HCM', type: PointType.BOTH, order: 2 },
      { stationId: hcmStation.id, name: 'Trạm dừng Quận 1', address: 'Nguyễn Huệ, Quận 1, TP.HCM', type: PointType.PICKUP, order: 3 },
      { stationId: hcmStation.id, name: 'Trạm dừng Quận 7', address: 'Nguyễn Thị Thập, Quận 7, TP.HCM', type: PointType.PICKUP, order: 4 },
    );
  }

  // Đà Lạt
  const daLatStation = savedStations.find(s => s.name === 'Đà Lạt');
  if (daLatStation) {
    stationPoints.push(
      { stationId: daLatStation.id, name: 'Bến xe Đà Lạt', address: 'Bến xe Đà Lạt, Lâm Đồng', type: PointType.BOTH, order: 1 },
      { stationId: daLatStation.id, name: 'Trạm dừng Trung tâm', address: 'Trung tâm thành phố Đà Lạt', type: PointType.DROPOFF, order: 2 },
      { stationId: daLatStation.id, name: 'Trạm dừng Hồ Xuân Hương', address: 'Gần Hồ Xuân Hương, Đà Lạt', type: PointType.DROPOFF, order: 3 },
    );
  }

  // Add points for other stations (simplified)
  savedStations.forEach((station) => {
    if (!stationPoints.find(sp => sp.stationId === station.id)) {
      stationPoints.push({
        stationId: station.id,
        name: station.address || `Bến xe ${station.name}`,
        address: station.address || `Bến xe ${station.name}`,
        type: PointType.BOTH,
        order: 1,
      });
    }
  });

  await stationPointRepo.save(stationPoints);
  console.log(`✅ Created ${stationPoints.length} station points`);

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
  // await tripRepo.clear();
  const trips: Partial<Trip>[] = [];
  
  dates.forEach((tripDate) => {
      // Hà Nội -> Hà Tĩnh routes
      trips.push({
      fromStationId: savedStations[0].id, // Hà Nội
      toStationId: savedStations[1].id, // Hà Tĩnh
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
    // Hà Tĩnh -> Hà Nội routes
    trips.push({
      fromStationId: savedStations[1].id, // Hà Tĩnh
      toStationId: savedStations[0].id, // Hà Nội
      date: tripDate,
      departureTime: '06:00',
      arrivalTime: '12:40',
      duration: 400,
      price: 250000,
      busType: BusType.SLEEPER,
      totalSeats: 36,
      amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm', 'TV'],
    });
    trips.push({
      fromStationId: savedStations[1].id, // Hà Tĩnh
      toStationId: savedStations[0].id, // Hà Nội
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
      fromStationId: savedStations[1].id, // Hà Tĩnh
      toStationId: savedStations[0].id, // Hà Nội
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
      fromStationId: savedStations[1].id, // Hà Tĩnh
      toStationId: savedStations[0].id, // Hà Nội
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
      fromStationId: savedStations[1].id, // Hà Tĩnh
      toStationId: savedStations[0].id, // Hà Nội
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
      fromStationId: savedStations[1].id, // Hà Tĩnh
      toStationId: savedStations[0].id, // Hà Nội
      date: tripDate,
      departureTime: '20:00',
      arrivalTime: '02:40',
      duration: 400,
      price: 270000,
      busType: BusType.SLEEPER,
      totalSeats: 36,
      amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm', 'TV', 'Massage'],
    });
    trips.push({
      fromStationId: savedStations[1].id, // Hà Tĩnh
      toStationId: savedStations[0].id, // Hà Nội
      date: tripDate,
      departureTime: '22:00',
      arrivalTime: '04:40',
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
  
  // // Hà Nội -> Sapa
  // trips.push({
  //   fromStationId: savedStations[2].id, // Hà Nội
  //   toStationId: savedStations[3].id, // Sapa
  //   date: tomorrow,
  //   departureTime: '08:00',
  //   arrivalTime: '14:00',
  //   duration: 360,
  //   price: 320000,
  //   busType: BusType.SLEEPER,
  //   totalSeats: 36,
  //   amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm', 'TV'],
  // });
  
  // // Hồ Chí Minh -> Nha Trang
  // trips.push({
  //   fromStationId: savedStations[0].id, // Hồ Chí Minh
  //   toStationId: savedStations[4].id, // Nha Trang
  //   date: tomorrow,
  //   departureTime: '08:00',
  //   arrivalTime: '14:00',
  //   duration: 360,
  //   price: 280000,
  //   busType: BusType.SLEEPER,
  //   totalSeats: 36,
  //   amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm', 'TV'],
  // });
  
  // // Hà Nội -> Hải Phòng
  // trips.push({
  //   fromStationId: savedStations[2].id, // Hà Nội
  //   toStationId: savedStations[5].id, // Hải Phòng
  //   date: tomorrow,
  //   departureTime: '07:00',
  //   arrivalTime: '10:00',
  //   duration: 180,
  //   price: 150000,
  //   busType: BusType.SEAT,
  //   totalSeats: 40,
  //   amenities: ['Wifi', 'Nước uống', 'Điều hòa'],
  // });
  
  // // Hồ Chí Minh -> Đà Nẵng
  // trips.push({
  //   fromStationId: savedStations[0].id, // Hồ Chí Minh
  //   toStationId: savedStations[6].id, // Đà Nẵng
  //   date: tomorrow,
  //   departureTime: '09:00',
  //   arrivalTime: '21:00',
  //   duration: 720,
  //   price: 450000,
  //   busType: BusType.SLEEPER,
  //   totalSeats: 36,
  //   amenities: ['Wifi', 'Nước uống', 'Điều hòa', 'Giường nằm', 'TV', 'Massage'],
  // });

  const savedTrips = await tripRepo.save(trips);

  // Create seats for each trip
  for (const trip of savedTrips) {
    await createSeats(trip.id, trip.totalSeats);
  }

  console.log('✅ Database seeded successfully!');
  console.log(`   - ${savedStations.length} stations`);
  console.log(`   - ${savedTrips.length} trips (MaiLinh Transit)`);
  console.log(`   - Admin account: admin@mailinhtransit.com`);
}

