import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Book } from '../models/book.model';
import { environment } from '../../../environments/environment';

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

  getBookingsByUser(userId: string) {
    return this.http.get<Book[]>(`${this.baseUrl}${environment.endpoints.bookings.getByUser(userId)}`)
    .pipe(
      map(books =>
        books.map((book) => ({ ...book, room: { ...book.room, image: this.imgHeader + book.room!.image} }))
      )
    );
  }

  sortById(guesthouses: Book[], order: 'asc' | 'desc' | undefined) {
    guesthouses.sort((a, b) => {
      if (order === 'desc') {
        return a.id - b.id; // ascending if desc
      } else {
        return b.id - a.id; // descending if asc/undef
      }
  });
  }

  sortByTotalPrice(bookings: Book[], order: 'asc' | 'desc' | undefined) {
    bookings.sort((a, b) => {
      const totalPriceA = this.getTotalPrice(a);
      const totalPriceB = this.getTotalPrice(b);
      if (order === 'asc') {
        return totalPriceB - totalPriceA; // descending if asc
      } else {
        return totalPriceA - totalPriceB; // ascending if desc/undef
      }
    });
  }

  sortByRoomName(books: Book[], order: 'asc' | 'desc' | undefined) {
    books.sort((a, b) => {
      const nameA = a.room!.name!.toLowerCase();
      const nameB = b.room!.name!.toLowerCase();
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

  sortByCheckIn(bookings: any[], order: 'asc' | 'desc' | undefined) {
    bookings.sort((a, b) => {
      const checkInA = new Date(a.bookFrom).getTime();
      const checkInB = new Date(b.bookFrom).getTime();
      if (order === 'asc') {
        return checkInB - checkInA; // descending if desc
      } else {
        return checkInA - checkInB; // ascending if desc/undef
      }
    });
  }

  sortByCheckOut(bookings: any[], order: 'asc' | 'desc' | undefined) {
    bookings.sort((a, b) => {
      const checkOutA = new Date(a.bookTo).getTime();
      const checkOutB = new Date(b.bookTo).getTime();
      if (order === 'asc') {
        return checkOutB - checkOutA; // descending if desc
      } else {
        return checkOutA - checkOutB; // ascending if desc/undef
      }
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
