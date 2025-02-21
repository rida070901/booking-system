import { Routes } from "@angular/router";
import { RoomListComponent } from "./guesthouses/rooms/room-list/room-list.component";
import { UserListComponent } from "./users/user-list/user-list.component";
import { BookingsComponent } from "./bookings/bookings.component";
import { GuesthouseListComponent } from "./guesthouses/guesthouse-list/guesthouse-list.component";

//  /admin/...
export const adminRoutes: Routes = [
  { path: '', redirectTo: 'guesthouses', pathMatch: 'full' },
  { path: 'guesthouses', component: GuesthouseListComponent },
  { path: 'room/guesthouse/:id', component: RoomListComponent },
  { path: 'users', component: UserListComponent },
  { path: 'bookings', component: BookingsComponent },
];


  // {
  //    path: 'guesthouses',
  //    component: GuesthouseListComponent,
  //   //  children: [
  //   //   { path: 'details/:id', component: GuesthouseDetailsComponent },
  //   //  ],
  // },
