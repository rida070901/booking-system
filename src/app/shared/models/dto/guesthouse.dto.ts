

export interface GuestHouseDto {
  name?: string;
  description?: string;
  checkIn?: string;
  checkOut?: string;
  numberOfBeds?: number;
}

export interface GuestHouseParamsDto {
  checkIn?: string;
  checkOut?: string;
  numberOfBeds?: number;
}
