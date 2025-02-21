import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarMenuComponent } from '../shared/sidebar-menu/sidebar-menu.component';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-user-dashboard',
  imports: [RouterOutlet, NavbarComponent, SidebarMenuComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {

}
