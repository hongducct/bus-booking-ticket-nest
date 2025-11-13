import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StationsService } from './stations.service';
import { Public } from '../auth/roles.decorator';

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
}
