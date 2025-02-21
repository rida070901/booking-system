import { Book } from "./book.model";
import { AmenitiesEnum } from "./enums/amentities.enum";



export interface Room {
  id: number;
  name: string | null;
  description: string | null;
  image: string | null;
  price: number;
  numberOfBeds: number;
  guestHouseId: number;
  amenities?: AmenitiesEnum[] | null;
  books?: Book[] | null;
  // guestHouse?: GuestHouse;
  // createdBy?: string | null;
  // createdDate?: string;
}
