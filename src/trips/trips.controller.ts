import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { SearchTripsDto } from './dto/search-trips.dto';

@ApiTags('trips')
@Controller('api/trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm chuyến xe' })
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
  @ApiOperation({ summary: 'Lấy thông tin chi tiết chuyến xe' })
  async findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Get(':id/seats')
  @ApiOperation({ summary: 'Lấy danh sách ghế của chuyến xe' })
  async getSeats(@Param('id') id: string) {
    return this.tripsService.getSeats(id);
  }

  @Post(':id/seats/hold')
  @ApiOperation({ summary: 'Giữ ghế' })
  async holdSeats(
    @Param('id') tripId: string,
    @Body() body: { seatIds: string[] },
  ) {
    return this.tripsService.holdSeats(tripId, body.seatIds);
  }

  @Post(':id/seats/release')
  @ApiOperation({ summary: 'Giải phóng ghế' })
  async releaseSeats(@Body() body: { seatIds: string[] }) {
    return this.tripsService.releaseSeats(body.seatIds);
  }
}
