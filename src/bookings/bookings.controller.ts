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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { SearchBookingDto } from './dto/search-booking.dto';

@ApiTags('bookings')
@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn đặt vé' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng' })
  async findAll() {
    return this.bookingsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm đơn hàng' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(@Query() searchDto: SearchBookingDto) {
    return this.bookingsService.search(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin đơn hàng' })
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Hủy đơn hàng' })
  async cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }

  @Put(':id/payment')
  @ApiOperation({ summary: 'Cập nhật phương thức thanh toán' })
  async updatePayment(
    @Param('id') id: string,
    @Body() body: { paymentMethod: string },
  ) {
    return this.bookingsService.updatePaymentMethod(
      id,
      body.paymentMethod as any,
    );
  }
}
