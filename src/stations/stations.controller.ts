import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StationsService } from './stations.service';

@ApiTags('stations')
@Controller('api/stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách trạm dừng' })
  async findAll() {
    return this.stationsService.findAll();
  }

  @Get('popular-routes')
  @ApiOperation({ summary: 'Lấy danh sách tuyến đường phổ biến' })
  async getPopularRoutes() {
    return this.stationsService.getPopularRoutes();
  }
}
