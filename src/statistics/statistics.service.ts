import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { Trip } from '../entities/trip.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(Trip)
    private tripsRepository: Repository<Trip>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [
      totalBookings,
      totalRevenue,
      totalUsers,
      totalTrips,
      todayBookings,
      todayRevenue,
      monthBookings,
      monthRevenue,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
    ] = await Promise.all([
      // Total bookings
      this.bookingsRepository.count(),
      
      // Total revenue
      this.bookingsRepository
        .createQueryBuilder('booking')
        .select('COALESCE(SUM(booking.totalPrice), 0)', 'total')
        .where('booking.status = :status', { status: BookingStatus.CONFIRMED })
        .getRawOne()
        .then((result) => parseFloat(result?.total || '0') || 0),

      // Total users
      this.usersRepository.count(),

      // Total trips
      this.tripsRepository.count(),

      // Today bookings
      this.bookingsRepository.count({
        where: {
          bookingDate: Between(today, tomorrow),
        },
      }),

      // Today revenue
      this.bookingsRepository
        .createQueryBuilder('booking')
        .select('COALESCE(SUM(booking.totalPrice), 0)', 'total')
        .where('booking.status = :status', { status: BookingStatus.CONFIRMED })
        .andWhere('booking.bookingDate >= :start', { start: today })
        .andWhere('booking.bookingDate < :end', { end: tomorrow })
        .getRawOne()
        .then((result) => parseFloat(result?.total || '0') || 0),

      // Month bookings
      this.bookingsRepository.count({
        where: {
          bookingDate: Between(thisMonth, nextMonth),
        },
      }),

      // Month revenue
      this.bookingsRepository
        .createQueryBuilder('booking')
        .select('COALESCE(SUM(booking.totalPrice), 0)', 'total')
        .where('booking.status = :status', { status: BookingStatus.CONFIRMED })
        .andWhere('booking.bookingDate >= :start', { start: thisMonth })
        .andWhere('booking.bookingDate < :end', { end: nextMonth })
        .getRawOne()
        .then((result) => parseFloat(result?.total || '0') || 0),

      // Pending bookings
      this.bookingsRepository.count({
        where: { status: BookingStatus.PENDING },
      }),

      // Confirmed bookings
      this.bookingsRepository.count({
        where: { status: BookingStatus.CONFIRMED },
      }),

      // Cancelled bookings
      this.bookingsRepository.count({
        where: { status: BookingStatus.CANCELLED },
      }),
    ]);

    return {
      overview: {
        totalBookings,
        totalRevenue,
        totalUsers,
        totalTrips,
      },
      today: {
        bookings: todayBookings,
        revenue: todayRevenue,
      },
      thisMonth: {
        bookings: monthBookings,
        revenue: monthRevenue,
      },
      bookingsByStatus: {
        pending: pendingBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
      },
    };
  }

  async getRevenueByDateRange(startDate: Date, endDate: Date) {
    const bookings = await this.bookingsRepository.find({
      where: {
        bookingDate: Between(startDate, endDate),
        status: BookingStatus.CONFIRMED,
      },
      order: {
        bookingDate: 'ASC',
      },
    });

    // Group by date
    const revenueByDate: Record<string, number> = {};
    bookings.forEach((booking) => {
      const date = booking.bookingDate.toISOString().split('T')[0];
      revenueByDate[date] = (revenueByDate[date] || 0) + booking.totalPrice;
    });

    return Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }

  async getTopRoutes(limit: number = 10) {
    const bookings = await this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.trip', 'trip')
      .leftJoinAndSelect('trip.fromStation', 'fromStation')
      .leftJoinAndSelect('trip.toStation', 'toStation')
      .where('booking.status = :status', { status: BookingStatus.CONFIRMED })
      .getMany();

    const routeCounts: Record<string, { route: string; count: number; revenue: number }> = {};

    bookings.forEach((booking) => {
      if (booking.trip && booking.trip.fromStation && booking.trip.toStation) {
        const route = `${booking.trip.fromStation.name} → ${booking.trip.toStation.name}`;
        if (!routeCounts[route]) {
          routeCounts[route] = { route, count: 0, revenue: 0 };
        }
        routeCounts[route].count += 1;
        routeCounts[route].revenue += booking.totalPrice;
      }
    });

    return Object.values(routeCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getUsersByRole() {
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    return users.map((u) => ({
      role: u.role,
      count: parseInt(u.count),
    }));
  }
}

