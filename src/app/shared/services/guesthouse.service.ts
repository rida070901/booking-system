import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GuestHouse } from '../models/guesthouse.model';
import { GuestHouseDto } from '../models/dto/guesthouse.dto';

@Injectable({
  providedIn: 'root'
})
export class GuesthouseService {

  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getAllGuestHouses() {
    return this.http.get<GuestHouse[]>(`${this.baseUrl}${environment.endpoints.guestHouse.getAll}`);
  }

  getAvailableGuestHouses(options: GuestHouseDto) {
    return this.http.get<GuestHouse[]>(`${this.baseUrl}${environment.endpoints.guestHouse.getAll}`,
      { params: {
        checkIn: options.checkIn || '',
        checkOut: options.checkOut || '',
        numberOfBeds: options.numberOfBeds || 0
      }
    }
    );
  }

  getGuestHouseById(id: number) {
    return this.http.get<GuestHouse>(`${this.baseUrl}${environment.endpoints.guestHouse.getById(id)}`);
  }

  createGuestHouse(guestHouse: GuestHouse) {
    return this.http.post<GuestHouseDto>(`${this.baseUrl}${environment.endpoints.guestHouse.create}`, guestHouse);
  }

  updateGuestHouse(id: number, guestHouse: GuestHouse){
    return this.http.put<GuestHouse>(`${this.baseUrl}${environment.endpoints.guestHouse.update(id)}`, guestHouse);
  }

  deleteGuestHouse(id: number) {
    return this.http.delete<void>(`${this.baseUrl}${environment.endpoints.guestHouse.delete(id)}`);
  }

  getTopFiveGuestHouses(){
    return this.http.get<GuestHouse[]>(`${this.baseUrl}${environment.endpoints.guestHouse.topFive}`);
  }

  sortById(guesthouses: GuestHouse[], order: 'asc' | 'desc' | undefined) {
    guesthouses.sort((a, b) => {
      if (order === 'desc') {
        return a.id - b.id; // ascending if desc
      } else {
        return b.id - a.id; // descending if asc/undef
      }
    });
  }

  sortByName(guesthouses: GuestHouse[], order: 'asc' | 'desc' | undefined) {
    guesthouses.sort((a, b) => {
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
