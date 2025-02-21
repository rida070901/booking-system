import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { UserDto } from '../models/dto/user.dto';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getAllUsers() {
    return this.http.get<User[]>(`${this.baseUrl}${environment.endpoints.users.getAll}`);
  }

  getUserById(id: string) {
    return this.http.get<User>(`${this.baseUrl}${environment.endpoints.users.getById(id)}`);
  }

  updateUser(id: string, user: UserDto) {
    return this.http.put<UserDto>(`${this.baseUrl}${environment.endpoints.users.update(id)}`, user);
  }

  sortById(users: User[], order: 'asc' | 'desc' | undefined) {
    users.sort((a, b) => {
      const idA = a.id!.toLowerCase();
      const idB = b.id!.toLowerCase();
      if (order === undefined) {
        return idA > idB ? 1 : (idA < idB ? -1 : 0); // first -> ascending order
      }
      else if (order === 'desc') {
        return idA > idB ? 1 : (idA < idB ? -1 : 0); // ascending order
      }
      else {
        return idA < idB ? 1 : (idA > idB ? -1 : 0); // descending order
      }
    });
  }

  sortByName(users: User[], order: 'asc' | 'desc' | undefined) {
    users.sort((a, b) => {
      const nameA = a.firstName!.toLowerCase();
      const nameB = b.firstName!.toLowerCase();
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
