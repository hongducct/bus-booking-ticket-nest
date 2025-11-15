import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { SearchTripsDto } from './dto/search-trips.dto';
import { CreateTripDto } from './dto/create-trip.dto';
import { CreateTripsBatchDto } from './dto/create-trips-batch.dto';
import { Public } from '../auth/roles.decorator';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../entities/user.entity';

@ApiTags('trips')
@Controller('api/trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Tìm kiếm chuyến xe (không cần đăng nhập)' })
  @ApiResponse({ status: 200, description: 'Danh sách chuyến xe' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(@Query() searchDto: SearchTripsDto) {
    try {
      return await this.tripsService.searchTrips(searchDto);
    } catch (error) {
      console.error('Error in search trips:', error);
      throw error;
    }
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Lấy thông tin chi tiết chuyến xe (không cần đăng nhập)' })
  async findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Get(':id/seats')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách ghế của chuyến xe (không cần đăng nhập)' })
  async getSeats(@Param('id') id: string) {
    return this.tripsService.getSeats(id);
  }

  @Get(':id/points')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách điểm đón/trả của chuyến xe (không cần đăng nhập)' })
  @ApiResponse({ status: 200, description: 'Danh sách điểm đón và điểm trả' })
  async getTripPoints(@Param('id') id: string) {
    return this.tripsService.getTripPoints(id);
  }

  @Post(':id/seats/hold')
  @Public()
  @ApiOperation({ summary: 'Giữ ghế (không cần đăng nhập)' })
  async holdSeats(
    @Param('id') tripId: string,
    @Body() body: { seatIds: string[] },
  ) {
    return this.tripsService.holdSeats(tripId, body.seatIds);
  }

  @Post(':id/seats/release')
  @Public()
  @ApiOperation({ summary: 'Giải phóng ghế (không cần đăng nhập)' })
  async releaseSeats(@Body() body: { seatIds: string[] }) {
    return this.tripsService.releaseSeats(body.seatIds);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Tạo chuyến xe mới (chỉ admin)' })
  @ApiResponse({ status: 201, description: 'Tạo chuyến xe thành công' })
  async create(@Body() createTripDto: CreateTripDto) {
    return this.tripsService.createTrip(createTripDto);
  }

  @Post('batch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Tạo nhiều chuyến xe cho nhiều ngày (chỉ admin)' })
  @ApiResponse({ status: 201, description: 'Tạo chuyến xe thành công' })
  async createBatch(@Body() createTripsBatchDto: CreateTripsBatchDto) {
    return this.tripsService.createTripsBatch(createTripsBatchDto);
  }
}
