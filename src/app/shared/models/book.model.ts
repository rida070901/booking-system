import { Room } from "./room.model";


export interface Book {
  id: number;
  roomId: number;
  bookFrom: string;
  bookTo: string;
  room: Room;
  createdBy?: string | null;
  createdDate?: string;
}
