import { AmenitiesEnum } from "./enums/amentities.enum";
import { Room } from "./room.model";


export interface RoomAmenity {
  id: number;
  roomId: number;
  room: Room;
  amenities: AmenitiesEnum;
}
