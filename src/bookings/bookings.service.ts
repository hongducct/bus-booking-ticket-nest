import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Booking, BookingStatus, PaymentMethod } from '../entities/booking.entity';
import { BookingSeat } from '../entities/booking-seat.entity';
import { Seat, SeatStatus } from '../entities/seat.entity';
import { Trip } from '../entities/trip.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { SearchBookingDto } from './dto/search-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(BookingSeat)
    private bookingSeatsRepository: Repository<BookingSeat>,
    @InjectRepository(Seat)
    private seatsRepository: Repository<Seat>,
    @InjectRepository(Trip)
    private tripsRepository: Repository<Trip>,
  ) {}

  async create(createBookingDto: CreateBookingDto, userId?: string) {
    const { tripId, seats, customerName, customerPhone, customerEmail, pickupPoint, dropoffPoint } =
      createBookingDto;

    // Verify trip exists
    const trip = await this.tripsRepository.findOne({
      where: { id: tripId },
      relations: ['company'],
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    // Verify seats are available
    const seatIds = seats.map((s) => s.seatId);
    const seatEntities = await this.seatsRepository.find({
      where: {
        id: In(seatIds),
        tripId,
      },
    });

    if (seatEntities.length !== seatIds.length) {
      throw new BadRequestException('Some seats not found');
    }

    const unavailableSeats = seatEntities.filter(
      (seat) => seat.status !== SeatStatus.AVAILABLE && seat.status !== SeatStatus.HOLDING,
    );

    if (unavailableSeats.length > 0) {
      throw new BadRequestException('Some seats are not available');
    }

    // Calculate total price
    const totalPrice = seatEntities.length * Number(trip.price);

    // Generate order ID
    const orderId = `VX${Date.now()}`;

    // Create booking
    const booking = this.bookingsRepository.create({
      orderId,
      tripId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      userId: userId || undefined, // Set userId if user is logged in
      pickupPoint: pickupPoint || undefined,
      dropoffPoint: dropoffPoint || undefined,
      totalPrice,
      paymentMethod: PaymentMethod.CASH, // Default, can be updated
      status: BookingStatus.PENDING,
    });

    const savedBooking = await this.bookingsRepository.save(booking);

    // Create booking seats and mark seats as booked
    const bookingSeats = seatIds.map((seatId) => {
      return this.bookingSeatsRepository.create({
        bookingId: savedBooking.id,
        seatId,
      });
    });

    await this.bookingSeatsRepository.save(bookingSeats);

    // Update seat status
    await this.seatsRepository.update(
      { id: In(seatIds) },
      { status: SeatStatus.BOOKED },
    );

    // Return booking with relations
    return this.bookingsRepository.findOne({
      where: { id: savedBooking.id },
      relations: ['trip', 'trip.company', 'trip.fromStation', 'trip.toStation', 'bookingSeats', 'bookingSeats.seat'],
    });
  }

  async findAll(userId?: string, userEmail?: string, userRole?: string) {
    // Admin can see all bookings
    if (userRole === 'admin') {
      return this.bookingsRepository.find({
        relations: ['trip', 'trip.company', 'trip.fromStation', 'trip.toStation', 'bookingSeats', 'bookingSeats.seat'],
        order: { bookingDate: 'DESC' },
      });
    }

    // User can only see their own bookings (by userId OR email)
    const queryBuilder = this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.trip', 'trip')
      .leftJoinAndSelect('trip.company', 'company')
      .leftJoinAndSelect('trip.fromStation', 'fromStation')
      .leftJoinAndSelect('trip.toStation', 'toStation')
      .leftJoinAndSelect('booking.bookingSeats', 'bookingSeats')
      .leftJoinAndSelect('bookingSeats.seat', 'seat')
      .orderBy('booking.bookingDate', 'DESC');

    // If user has userId, show bookings with userId OR email (for bookings made before registration)
    if (userId && userEmail) {
      queryBuilder.where(
        '(booking.userId = :userId OR booking.customerEmail = :email)',
        { userId, email: userEmail }
      );
    } else if (userId) {
      queryBuilder.where('booking.userId = :userId', { userId });
    } else if (userEmail) {
      queryBuilder.where('booking.customerEmail = :email', { email: userEmail });
    } else {
      // No user info, return empty array
      return [];
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string, userId?: string, userEmail?: string, userRole?: string) {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['trip', 'trip.company', 'trip.fromStation', 'trip.toStation', 'bookingSeats', 'bookingSeats.seat'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Admin can see all bookings
    if (userRole === 'admin') {
      return booking;
    }

    // User can only see their own bookings (by userId OR email)
    if (userId && userEmail) {
      if (booking.userId === userId || booking.customerEmail === userEmail) {
        return booking;
      }
    } else if (userId && booking.userId === userId) {
      return booking;
    } else if (userEmail && booking.customerEmail === userEmail) {
      return booking;
    }

    // If no user info or booking doesn't belong to user, throw forbidden
    if (!userId && !userEmail) {
      throw new ForbiddenException('You must be logged in to view this booking');
    }

    throw new ForbiddenException('You do not have permission to view this booking');
  }

  async findByOrderId(orderId: string) {
    return this.bookingsRepository.findOne({
      where: { orderId },
      relations: ['trip', 'trip.company', 'trip.fromStation', 'trip.toStation', 'bookingSeats', 'bookingSeats.seat'],
    });
  }

  async search(searchDto: SearchBookingDto) {
    const { query } = searchDto;

    // Search by orderId, phone, or email
    const booking = await this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.trip', 'trip')
      .leftJoinAndSelect('trip.company', 'company')
      .leftJoinAndSelect('trip.fromStation', 'fromStation')
      .leftJoinAndSelect('trip.toStation', 'toStation')
      .leftJoinAndSelect('booking.bookingSeats', 'bookingSeats')
      .leftJoinAndSelect('bookingSeats.seat', 'seat')
      .where('booking.orderId = :query', { query })
      .orWhere('booking.customerPhone = :query', { query })
      .orWhere('booking.customerEmail = :query', { query })
      .getOne();

    return booking;
  }

  async cancel(id: string, userId?: string, userEmail?: string, userRole?: string) {
    const booking = await this.findOne(id, userId, userEmail, userRole);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed booking');
    }

    // Update booking status
    booking.status = BookingStatus.CANCELLED;
    await this.bookingsRepository.save(booking);

    // Release seats
    const seatIds = booking.bookingSeats.map((bs) => bs.seatId);
    await this.seatsRepository.update(
      { id: In(seatIds) },
      { status: SeatStatus.AVAILABLE },
    );

    return booking;
  }

  async updatePaymentMethod(id: string, paymentMethod: PaymentMethod, userId?: string, userEmail?: string, userRole?: string) {
    const booking = await this.findOne(id, userId, userEmail, userRole);

    booking.paymentMethod = paymentMethod;
    
    // Auto confirm if payment is not cash
    if (paymentMethod !== PaymentMethod.CASH) {
      booking.status = BookingStatus.CONFIRMED;
    }

    return this.bookingsRepository.save(booking);
  }

  async updateStatus(id: string, status: BookingStatus) {
    console.log('BookingsService.updateStatus called:', { id, status, statusType: typeof status });
    
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['bookingSeats'],
    });

    if (!booking) {
      console.error('Booking not found:', id);
      throw new NotFoundException('Booking not found');
    }

    console.log('Current booking status:', booking.status);
    console.log('Updating to status:', status);

    booking.status = status;
    const savedBooking = await this.bookingsRepository.save(booking);

    console.log('Booking updated successfully:', { id: savedBooking.id, status: savedBooking.status });

    // If cancelled, release seats
    if (status === BookingStatus.CANCELLED) {
      const seatIds = booking.bookingSeats.map((bs) => bs.seatId);
      await this.seatsRepository.update(
        { id: In(seatIds) },
        { status: SeatStatus.AVAILABLE },
      );
      console.log('Seats released for cancelled booking');
    }

    return savedBooking;
  }
}

