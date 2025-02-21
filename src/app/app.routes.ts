import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { authGuard } from './shared/guards/auth.guard';
import { roleGuard } from './shared/guards/role.guard';
import { AdminDashboardComponent } from './user/admin-dashboard/admin-dashboard.component';
import { adminRoutes } from './user/admin-dashboard/admin.routes';
import { UserDashboardComponent } from './user/user-dashboard/user-dashboard.component';
import { userRoutes } from './user/user-dashboard/user.routes';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { GuesthouseListComponent } from './guesthouse-list/guesthouse-list.component';
import { GuesthouseDetailsComponent } from './guesthouse-details/guesthouse-details.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'guesthouses/all',
    component: GuesthouseListComponent,
  },
  {
    path: 'guesthouse/:id/rooms',
    component: GuesthouseDetailsComponent
  },
  // {
  //   path: 'login',
  //   component: LoginComponent
  // },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    children: adminRoutes,
    canActivate:  [authGuard, roleGuard],
    data: {role: 'Admin'}
  },
  {
    path: 'user',
    component: UserDashboardComponent,
    children: userRoutes,
    canActivate:  [authGuard, roleGuard],
    data: {role: 'User'}
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
