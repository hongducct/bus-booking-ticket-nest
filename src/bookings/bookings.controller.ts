import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { SearchBookingDto } from './dto/search-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingStatus } from '../entities/booking.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('bookings')
@Controller('api/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Public() // Allow guest booking
  @ApiOperation({ summary: 'Tạo đơn đặt vé (không cần đăng nhập)' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createBookingDto: CreateBookingDto, @Request() req?: any) {
    // If user is logged in, use their userId
    const userId = req?.user?.userId || null;
    return this.bookingsService.create(createBookingDto, userId);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng (yêu cầu đăng nhập)' })
  async findAll(@Request() req: any) {
    const userId = req.user?.userId;
    const userEmail = req.user?.email;
    const userRole = req.user?.role;
    return this.bookingsService.findAll(userId, userEmail, userRole);
  }

  @Get('search')
  @Public() // Allow guest search
  @ApiOperation({ summary: 'Tìm kiếm đơn hàng (không cần đăng nhập)' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(@Query() searchDto: SearchBookingDto) {
    return this.bookingsService.search(searchDto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin đơn hàng (yêu cầu đăng nhập)' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.userId;
    const userEmail = req.user?.email;
    const userRole = req.user?.role;
    return this.bookingsService.findOne(id, userId, userEmail, userRole);
  }

  @Put(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hủy đơn hàng (yêu cầu đăng nhập)' })
  async cancel(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.userId;
    const userEmail = req.user?.email;
    const userRole = req.user?.role;
    return this.bookingsService.cancel(id, userId, userEmail, userRole);
  }

  @Put(':id/payment')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật phương thức thanh toán (yêu cầu đăng nhập)' })
  async updatePayment(
    @Param('id') id: string,
    @Body() body: { paymentMethod: string },
    @Request() req: any,
  ) {
    const userId = req.user?.userId;
    const userEmail = req.user?.email;
    const userRole = req.user?.role;
    return this.bookingsService.updatePaymentMethod(
      id,
      body.paymentMethod as any,
      userId,
      userEmail,
      userRole,
    );
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng (chỉ admin)' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateBookingStatusDto,
    @Request() req: any,
  ) {
    console.log('Update status request:', { id, status: updateStatusDto.status, user: req.user });
    return this.bookingsService.updateStatus(id, updateStatusDto.status);
  }
}
