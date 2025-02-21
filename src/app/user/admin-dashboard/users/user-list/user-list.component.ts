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

  //state variables
  isLoading = true;

  //search variables
  private users: User[] = [];
  filteredUsers: User[] = [];
  search = signal('');

  // modal variables
  private modalService = inject(BsModalService);
  private modalRef?: BsModalRef;

  //sorting variables
  idSort: 'asc' | 'desc' | undefined = undefined;
  nameSort: 'asc' | 'desc' | undefined = undefined;

  //pagination variables
  page: number = 1;
  itemsPerPage: number = 5;
  perPageOptions = [5, 8, 10, 20];

  ngOnInit() {
    this.loadUsers();
    this.router.navigate([], { //reset query params on reload
      queryParams: {},
      replaceUrl: true // prevents adding to browser history
    });
  }


  private loadUsers() {
    this.userService.getAllUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
      },
      error: (err: Error) => {
        console.log(err);
      },
      complete: () => {
        this.isLoading = false;
      }
    }
    );
  }


  onItemsPerPageChange(targetValue: string) {
    this.itemsPerPage = Number(targetValue); // passing template var (#targetValue) as arg to this method in html
    this.page = 1;
  }

  onSearchUser(searchTerm: string) {
    this.filteredUsers = this.users.filter(u =>
      u.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  openDetailsModal(user: User) {
    this.modalRef = this.modalService.show(UserDetailsComponent);
    this.modalRef.content.user = user;
  }

  sortById() {
    this.userService.sortById(this.filteredUsers, this.idSort);
    if(this.idSort === undefined){
      this.idSort = 'asc';
    } else {
      this.idSort = this.idSort === 'asc' ? 'desc' : 'asc';
    }
    this.updateQueryParams();
  }

  sortByName() {
    this.userService.sortByName(this.filteredUsers, this.nameSort); //ascend if desc/undef & descend if asc
    if(this.nameSort === undefined) {
      this.nameSort = 'asc'; //ascending si first filter (just a preference)
    } else {
      this.nameSort = this.nameSort === 'asc' ? 'desc' : 'asc';
    }
    this.updateQueryParams();
  }

  private updateQueryParams() { // update the query parameters in the URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        id: this.idSort,
        name: this.nameSort,
      },
      queryParamsHandling: 'merge' // merge with existing params
    });
  }

}
