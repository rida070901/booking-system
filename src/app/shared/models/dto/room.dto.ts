import { AmenitiesEnum } from "../enums/amentities.enum";

export interface RoomDto {
  name?: string | null;
  description?: string | null;
  image?: string | null; // Base64 or URL
  price?: number | null;
  numberOfBeds?: number | null;
  guestHouseId?: number | null;
  amenities?: AmenitiesEnum[] | null;
}

export interface RoomParamsDto {
  checkIn?: string;
  checkOut?: string;
}
