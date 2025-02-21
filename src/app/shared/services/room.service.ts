import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Room } from '../models/room.model';
import { RoomDto, RoomParamsDto } from '../models/dto/room.dto';
import { from, map, mergeMap, shareReplay, switchMap, tap, toArray } from 'rxjs';
import { Book } from '../models/book.model';
import { BookDto } from '../models/dto/book.dto';
import { BookService } from './book.service';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private bookService = inject(BookService);
  imgHeader = 'data:image/jpeg;base64,';


  getRoomsByGuestHouse(guestHouseId: number) {
    return this.http.get<Room[]>(`${this.baseUrl}${environment.endpoints.room.getByGuestHouse(guestHouseId)}`).pipe(
      tap((rooms) =>
        rooms.forEach((room) => ( room.image = this.imgHeader + room.image ))
      ),
      shareReplay(1) // cache-s the latest http response (only when rooms rarely change)
      // ---> prevents multiple http calls if multiple subscribers request the data
      // ---> especially useful when loading the same data in different components
    );
  }

  // basic approach -> since only modifying image (a side effect), tap is more suitable -> avoids unnecessary re-mapping
  // getRoomsByGuestHouse(guestHouseId: number) {
  //   return this.http.get<Room[]>(`${this.baseUrl}${environment.endpoints.room.getByGuestHouse(guestHouseId)}`).pipe(
  //     map((rooms) =>
  //       rooms.map((room) => ({ ...room, image: this.imgHeader + room.image }))
  //     )
  //   );
  // }

  getAvailableRoomsByGuestHouse(guestHouseId: number, options: RoomParamsDto) {
    return this.http.get<Room[]>(`${this.baseUrl}${environment.endpoints.room.getByGuestHouse(guestHouseId)}`,
    { params: {
      checkIn: options.checkIn || '',
      checkOut: options.checkOut || '',
      }
    }
    ).pipe(
        tap((rooms) =>
          rooms.forEach((room) => ( room.image = this.imgHeader + room.image ))
        )
      );
  }

  getTop5RoomsByGuesthouse(guesthouseId: number) {
    return this.getRoomsByGuestHouse(guesthouseId).pipe(
      switchMap((rooms: Room[]) =>
        from(rooms).pipe(
          mergeMap(
            (room) =>
              this.bookService.getBookingByRoom(room.id).pipe(
                map((bookings: Book[]) => ({
                  room,
                  bookingsCount: bookings.length,
                }))
              ),
            5 // (it means runs up to 5 requests in parallel) concurrency-> adjusting based on performance
          ),
          toArray(),
          map((roomsWithCounts) =>
            roomsWithCounts
              .sort((a, b) => b.bookingsCount - a.bookingsCount)
              .slice(0, 5)
              .map((item) => ({
                ...item.room,
                books: item.room.books ?? [],
              }))
          )
        )
      )
    );
  }

  // basic approach --> very slow to load!!!
  // getTop5RoomsByGuesthouse(guesthouseId: number) {
  //   return this.getRoomsByGuestHouse(guesthouseId).pipe(
  //     switchMap((rooms: Room[]) => {
  //       const bookingRequests = rooms.map((room) =>
  //         this.bookService.getBookingByRoom(room.id).pipe(
  //           map((bookings: Book[]) => ({
  //             room,
  //             bookingsCount: bookings.length,
  //           }))
  //         )
  //       );
  //       return forkJoin(bookingRequests);
  //     }),
  //     map((roomsWithCounts) =>
  //       roomsWithCounts
  //         .sort((a, b) => b.bookingsCount - a.bookingsCount)
  //         .slice(0, 5)
  //         .map((item) => ({
  //           ...item.room,
  //           books: item.room.books ?? [],
  //         }))
  //     )
  //   );
  // }

  getRoomById(id: number) {
    return this.http.get<Room>(`${this.baseUrl}${environment.endpoints.room.getById(id)}`);
  }

  createRoom(room: Room) {
    return this.http.post<RoomDto>(`${this.baseUrl}${environment.endpoints.room.create}`, room);
  }

  updateRoom(id: number, room: RoomDto) {
    return this.http.put<Room>(`${this.baseUrl}${environment.endpoints.room.update(id)}`, room);
  }

  deleteRoom(id: number){
    return this.http.delete<void>(`${this.baseUrl}${environment.endpoints.room.delete(id)}`);
  }

  bookRoom(bookingDetails: BookDto) {
    return this.http.post<BookDto>(`${this.baseUrl}${environment.endpoints.room.book}`, bookingDetails);
  }

  sortById(rooms: Room[], order: 'asc' | 'desc' | undefined) {
    rooms.sort((a, b) => {
      if (order === 'desc') {
        return a.id - b.id; // ascending if desc
      } else {
        return b.id - a.id; // descending if asc/undef
      }
    });
  }

  sortByGuesthouseId(rooms: Room[], order: 'asc' | 'desc' | undefined) {
    rooms.sort((a, b) => {
      if (order === 'desc') {
        return a.id - b.id; // ascending if desc
      } else {
        return b.id - a.id; // descending if asc/undef
      }
    });
  }

  sortByPrice(rooms: Room[], order: 'asc' | 'desc' | undefined) {
    rooms.sort((a, b) => {
      if (order === 'asc') {
        return b.price - a.price; // descending if asc
      } else {
        return a.price - b.price; // ascending if desc/undef
      }
    });
  }

  sortByName(rooms: Room[], order: 'asc' | 'desc' | undefined) {
    rooms.sort((a, b) => {
      const nameA = a.name!.toLowerCase();
      const nameB = b.name!.toLowerCase();
      if (order === undefined) {
        return nameA > nameB ? 1 : (nameA < nameB ? -1 : 0); // first -> ascending order
      }
      else if (order === 'desc') {
        return nameA > nameB ? 1 : (nameA < nameB ? -1 : 0); // ascending order
      }
      else {
        return nameA < nameB ? 1 : (nameA > nameB ? -1 : 0); // descending order
      }
    });
  }

}
