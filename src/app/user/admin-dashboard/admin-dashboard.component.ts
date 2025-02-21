import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarMenuComponent } from '../shared/sidebar-menu/sidebar-menu.component';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterOutlet, NavbarComponent, SidebarMenuComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {

}
