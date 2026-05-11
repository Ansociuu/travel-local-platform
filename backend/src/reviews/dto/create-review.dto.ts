import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  bookingId: string;

  @IsOptional()
  @IsString()
  hotelId?: string;

  @IsOptional()
  @IsString()
  tourId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  images?: any;
}
