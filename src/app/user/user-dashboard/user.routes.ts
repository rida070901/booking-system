import { Routes } from "@angular/router";
import { UserProfileComponent } from "./user-profile/user-profile.component";
import { UserBookingsComponent } from "./user-bookings/user-bookings.component";


//  /user/...
export const userRoutes: Routes = [
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'profile', component: UserProfileComponent },
  { path: 'bookings', component: UserBookingsComponent },
];
