import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Book } from '../models/book.model';
import { environment } from '../../../environments/environment';
import { BookedDate } from '../models/dto/book.dto';

@Injectable({
  providedIn: 'root',
})
export class BookService {

  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  imgHeader = 'data:image/jpeg;base64,';

  getBookingByRoom(roomId: number) {
    return this.http.get<Book[]>(`${this.baseUrl}${environment.endpoints.bookings.getByRoom(roomId)}`);
  }

  getBookedDatesByRoom(roomId: number) {
    return this.http.get<Book[]>(`${this.baseUrl}${environment.endpoints.bookings.getByRoom(roomId)}`)
    .pipe(
      map((data) => data.map(({ bookFrom, bookTo }): BookedDate => ({ bookFrom, bookTo })))
    );
  }

  getBookingsByUser(userId: string) {
    return this.http.get<Book[]>(`${this.baseUrl}${environment.endpoints.bookings.getByUser(userId)}`)
    .pipe(
      map(books =>
        books.map((book) => ({ ...book, room: { ...book.room, image: this.imgHeader + book.room!.image} }))
      )
    );
  }

  sortById(books: Book[], order: 'asc' | 'desc' | null) {
    books.sort((a, b) => (order === 'desc' ? a.id - b.id : b.id - a.id));
  }

  sortByTotalPrice(books: Book[], order: 'asc' | 'desc' | null) {
    books.sort((a, b) => {
      const totalA = this.getTotalPrice(a);
      const totalB = this.getTotalPrice(b);
      return order === 'asc' ? totalB - totalA : totalA - totalB;
    });
  }

  sortByRoomName(books: Book[], order: 'asc' | 'desc' | null) {
    books.sort((a, b) => {
      const nameA = a.room.name!.toLowerCase();
      const nameB = b.room.name!.toLowerCase();
      return (order === 'asc') ? (nameB.localeCompare(nameA)) : nameA.localeCompare(nameB);
    });
  }

  sortByCheckIn(books: Book[], order: 'asc' | 'desc' | null) {
    books.sort((a, b) => {
      const dateA = new Date(a.bookFrom).getTime();
      const dateB = new Date(b.bookFrom).getTime();
      return order === 'asc' ? dateB - dateA : dateA - dateB;
    });
  }

  sortByCheckOut(books: Book[], order: 'asc' | 'desc' | null) {
    books.sort((a, b) => {
      const dateA = new Date(a.bookTo).getTime();
      const dateB = new Date(b.bookTo).getTime();
      return order === 'asc' ? dateB - dateA : dateA - dateB;
    });
  }

  getTotalPrice(booking: Book) {
    const nights =
      (new Date(booking.bookTo).getTime() - new Date(booking.bookFrom).getTime()) /
      (1000 * 60 * 60 * 24); // converts ms to days
    return booking.room.price * nights;
  }

  getBookingStatus(b: Book) {
    if (!b?.bookFrom || !b?.bookTo) return 'Unknown';
    const today = new Date().setHours(0, 0, 0, 0); // normalize today's date (ignore time)
    const checkIn = new Date(b.bookFrom).setHours(0, 0, 0, 0);
    const checkOut = new Date(b.bookTo).setHours(0, 0, 0, 0);
    if (checkIn > today) return 'Active'; // future check-in
    if (checkOut < today) return 'Unactive'; // past checkout
    if (checkIn <= today && checkOut >= today) return 'In Progress'; // ongoing
    return 'Unknown';
  }


}
