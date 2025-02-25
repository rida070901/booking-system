import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserDetailsComponent } from '../user-details/user-details.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { User } from '../../../../shared/models/user.model';
import { UserService } from '../../../../shared/services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-list',
  imports: [NgxPaginationModule, CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit{

  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  //data holding objects
  private users: User[] = [];
  filteredUsers: User[] = [];

  //state variables
  isLoading = signal<boolean>(false);

  // modal variables
  private modalService = inject(BsModalService);
  private modalRef?: BsModalRef;

  //sorting variables
  idSort = signal<'asc' | 'desc' | null>(null);
  nameSort = signal<'asc' | 'desc' | null>(null);

  //pagination variables
  page: number = 1;
  itemsPerPage = signal<number>(5);
  perPageOptions = [6, 9, 12, 15];

  ngOnInit() {
    this.loadUsers();
    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true
    });
  }

  private loadUsers() {
    this.isLoading.set(true);
    this.userService.getAllUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
      },
      error: (err: Error) => {
        console.log(err);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    }
    );
  }

  showRecentlyAdded() {
    this.filteredUsers = this.users.sort((a, b) => b.id!.localeCompare(a.id!));
  }


  onItemsPerPageChange(targetValue: string) {
    this.itemsPerPage.set(Number(targetValue)); // passing template var (#targetValue) as arg to this method in html
    this.page = 1;
  }

  onSearchUser(searchTerm: string) {
    this.filteredUsers = this.users.filter(u =>
      u.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  openDetailsModal(user: User) {
    const modalOptions = {
      backdrop: 'static' as const,
      keyboard: false,
      initialState: {
        user: user,
      }
    };
    this.modalRef = this.modalService.show(UserDetailsComponent, modalOptions);
  }

  sortById() {
    const currentSort = this.idSort();
    this.userService.sortById(this.filteredUsers, currentSort);
    this.idSort.set(currentSort === null ? 'asc' : (currentSort === 'asc' ? 'desc' : 'asc'));
    this.updateQueryParams();
  }

  sortByName() {
    const currentSort = this.nameSort();
    this.userService.sortByName(this.filteredUsers, currentSort);
    this.nameSort.set(currentSort === null ? 'asc' : (currentSort === 'asc' ? 'desc' : 'asc'));
    this.updateQueryParams();
  }

  private updateQueryParams() { // update the query parameters in the URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        id: this.idSort(),
        name: this.nameSort(),
      },
      queryParamsHandling: 'merge' // merge with existing params
    });
  }

}
