import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GuestHouse } from '../models/guesthouse.model';
import { GuestHouseDto, GuestHouseParamsDto } from '../models/dto/guesthouse.dto';

@Injectable({
  providedIn: 'root'
})
export class GuesthouseService {

  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getAllGuestHouses() {
    return this.http.get<GuestHouse[]>(`${this.baseUrl}${environment.endpoints.guestHouse.getAll}`);
  }

  getAvailableGuestHouses(options: GuestHouseParamsDto) {
    return this.http.get<GuestHouse[]>(`${this.baseUrl}${environment.endpoints.guestHouse.getAll}`,
      { params: {
        checkIn: options.checkIn || '',
        checkOut: options.checkOut || '',
        numberOfBeds: options.numberOfBeds || 0
      } }
    );
  }

  getGuestHouseById(id: number) {
    return this.http.get<GuestHouse>(`${this.baseUrl}${environment.endpoints.guestHouse.getById(id)}`);
  }

  createGuestHouse(guestHouse: GuestHouseDto) {
    return this.http.post<GuestHouseDto>(`${this.baseUrl}${environment.endpoints.guestHouse.create}`, guestHouse);
  }

  updateGuestHouse(id: number, guestHouse: GuestHouseDto){
    return this.http.put<GuestHouseDto>(`${this.baseUrl}${environment.endpoints.guestHouse.update(id)}`, guestHouse);
  }

  deleteGuestHouse(id: number) {
    return this.http.delete<void>(`${this.baseUrl}${environment.endpoints.guestHouse.delete(id)}`);
  }

  getTopFiveGuestHouses(){
    return this.http.get<GuestHouse[]>(`${this.baseUrl}${environment.endpoints.guestHouse.topFive}`);
  }

  sortById(guesthouses: GuestHouse[], order: 'asc' | 'desc' | null) {
    guesthouses.sort((a, b) => (order === 'desc' ? a.id - b.id : b.id - a.id));
  }

  sortByName(guesthouses: GuestHouse[], order: 'asc' | 'desc' | null) {
    guesthouses.sort((a, b) => {
      const nameA = a.name!.toLowerCase();
      const nameB = b.name!.toLowerCase();
      return (order === 'asc') ? (nameB.localeCompare(nameA)) : nameA.localeCompare(nameB);
    });
  }

}
