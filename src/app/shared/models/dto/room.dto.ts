import { AmenitiesEnum } from "../enums/amentities.enum";

export interface RoomDto {
  name?: string;
  description?: string;
  image?: string; // Base64 or URL
  price?: number;
  numberOfBeds?: number;
  guestHouseId?: number;
  amenities?: AmenitiesEnum[] | null;
}

export interface RoomParamsDto {
  checkIn?: string;
  checkOut?: string;
}
