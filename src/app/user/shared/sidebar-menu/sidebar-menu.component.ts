import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-sidebar-menu',
  imports: [RouterLink, RouterModule],
  templateUrl: './sidebar-menu.component.html',
  styleUrl: './sidebar-menu.component.css'
})
export class SidebarMenuComponent {

  authService = inject(AuthService);

  role = signal< 'Admin' | 'User' | null >(this.authService.userRole());

}
