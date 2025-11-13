import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { BookingStatus } from '../../entities/booking.entity';

export class UpdateBookingStatusDto {
  @ApiProperty({ 
    enum: BookingStatus, 
    example: BookingStatus.CONFIRMED,
    description: 'Trạng thái đơn hàng: pending, confirmed, cancelled, completed'
  })
  @IsEnum(BookingStatus, { 
    message: 'Status must be one of: pending, confirmed, cancelled, completed' 
  })
  @Transform(({ value }) => {
    // Normalize to lowercase for enum matching
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    return value;
  })
  status: BookingStatus;
}

