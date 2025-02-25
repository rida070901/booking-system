

export interface GuestHouseDto {
  name?: string | null;
  description?: string | null;
}

export interface GuestHouseParamsDto {
  checkIn?: string;
  checkOut?: string;
  numberOfBeds?: number;
}
