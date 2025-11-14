import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StationsService } from './stations.service';
import { Public } from '../auth/roles.decorator';
import { PointType } from '../entities/station-point.entity';

@ApiTags('stations')
@Controller('api/stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách trạm dừng (không cần đăng nhập)' })
  async findAll() {
    return this.stationsService.findAll();
  }

  @Get('popular-routes')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách tuyến đường phổ biến (không cần đăng nhập)' })
  async getPopularRoutes() {
    return this.stationsService.getPopularRoutes();
  }

  @Get(':stationId/points')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách điểm đón/trả của một trạm (không cần đăng nhập)' })
  @ApiParam({ name: 'stationId', description: 'ID của trạm' })
  @ApiQuery({ name: 'type', enum: PointType, required: false, description: 'Loại điểm: pickup, dropoff, hoặc both' })
  async getStationPoints(
    @Param('stationId') stationId: string,
    @Query('type') type?: PointType,
  ) {
    return this.stationsService.getStationPoints(stationId, type);
  }
}
