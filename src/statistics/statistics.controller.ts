import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('statistics')
@Controller('api/statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lấy thống kê tổng quan (chỉ admin)' })
  @ApiResponse({ status: 200, description: 'Thống kê tổng quan' })
  async getDashboardStats() {
    return this.statisticsService.getDashboardStats();
  }

  @Get('revenue')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lấy doanh thu theo khoảng thời gian (chỉ admin)' })
  @ApiResponse({ status: 200, description: 'Doanh thu theo ngày' })
  async getRevenue(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const end = new Date(endDate || new Date());
    return this.statisticsService.getRevenueByDateRange(start, end);
  }

  @Get('top-routes')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lấy top tuyến đường phổ biến (chỉ admin)' })
  @ApiResponse({ status: 200, description: 'Top tuyến đường' })
  async getTopRoutes(@Query('limit') limit?: string) {
    return this.statisticsService.getTopRoutes(limit ? parseInt(limit) : 10);
  }

  @Get('users-by-role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lấy số lượng user theo role (chỉ admin)' })
  @ApiResponse({ status: 200, description: 'Số lượng user theo role' })
  async getUsersByRole() {
    return this.statisticsService.getUsersByRole();
  }
}

