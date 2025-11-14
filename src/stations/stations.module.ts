import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';
import { Station } from '../entities/station.entity';
import { StationPoint } from '../entities/station-point.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Station, StationPoint])],
  controllers: [StationsController],
  providers: [StationsService],
})
export class StationsModule {}

