import { IsString, IsOptional } from 'class-validator';

export class CreateWishlistDto {
  @IsOptional()
  @IsString()
  hotelId?: string;

  @IsOptional()
  @IsString()
  tourId?: string;
}
