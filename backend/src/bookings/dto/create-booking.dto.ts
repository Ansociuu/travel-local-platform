import { IsString, IsOptional, IsNotEmpty, IsDateString, IsNumber, IsArray, ValidateNested, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

class BookingRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  priceAtBooking: number;
}

class BookingTourDto {
  @IsString()
  @IsNotEmpty()
  tourId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  priceAtBooking: number;
}

export class CreateBookingDto {
  @IsOptional()
  @IsString()
  hotelId?: string;

  @IsOptional()
  @IsString()
  tourId?: string;

  @IsDateString()
  @IsNotEmpty()
  checkIn: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @IsString()
  @IsNotEmpty()
  guestName: string;

  @IsEmail()
  @IsNotEmpty()
  guestEmail: string;

  @IsOptional()
  @IsString()
  guestPhone?: string;

  @IsOptional()
  @IsString()
  specialRequest?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingRoomDto)
  bookingRooms?: BookingRoomDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingTourDto)
  bookingTours?: BookingTourDto[];
}
