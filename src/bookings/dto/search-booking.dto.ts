import { IsString } from 'class-validator';

export class SearchBookingDto {
  @IsString()
  query: string;
}

