import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Book } from '../../../shared/models/book.model';
import { BookService } from '../../../shared/services/book.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-bookings',
  imports: [FormsModule, NgxPaginationModule, CommonModule],
  templateUrl: './user-bookings.component.html',
  styleUrl: './user-bookings.component.css'
})
export class UserBookingsComponent implements OnInit{

  private bookService = inject(BookService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute); //to get query params (for the sorting)
  private router = inject(Router);
  private userId = this.authService.getUserId();

  //state variables
  isLoading = true;

  //sorting variables (me arrow posht/lart or both when undefined & query params)
  idSort: 'asc' | 'desc' | undefined = undefined; //by default from recently added
  roomNameSort: 'asc' | 'desc' | undefined = undefined;
  checkinSort: 'asc' | 'desc' | undefined = undefined;
  checkoutSort: 'asc' | 'desc' | undefined = undefined;
  priceSort: 'asc' | 'desc' | undefined = undefined;

  //pagination variables
  page: number = 1; //current page
  itemsPerPage: number = 5; // default
  perPageOptions = [5, 8, 10, 20]; //dropdown options for user to choose

  //search variables
  search: string = '';
  private books: Book[] = [];
  filteredBooks: Book[] = [];


  ngOnInit() {
    this.loadBooks();
    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true // prevents adding to browser history
    });
  }

  private loadBooks (){
    console.log(this.userId)
    const sub = this.bookService.getBookingsByUser(this.userId!).subscribe({
      next: (data) => {
        this.books = data;
        this.filteredBooks = data;
        console.log(this.books)
        console.log('resp: ', data)
      },
      error: (err: Error) => {
        console.log(err);
      },
      complete: () => {
        this.isLoading = false;
      }
    }
    );
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  showRecentlyAdded() {
    this.filteredBooks = this.books.sort((a, b) => b.id - a.id);
  }

  onItemsPerPageChange(targetValue: string) {
    this.itemsPerPage = Number(targetValue);
    this.page = 1;
  }

  onSearchBook() { //search by room name
    if(!this.search) {
      this.filteredBooks = [...this.books];
      return;
    }
    this.filteredBooks = this.books.filter(b =>
      b.room?.name?.toLowerCase().includes(this.search.trim().toLowerCase())
    );
  }

  sortById() {
    this.bookService.sortById(this.filteredBooks, this.idSort); //ascend if desc & descend if asc/undef
    if(this.idSort === undefined){ //undefined do jet vetem heren e par on reload cmp
      this.idSort = 'desc'; //descending si first filter (just a preference)
    } else {
      this.idSort = this.idSort === 'asc' ? 'desc' : 'asc'; //update this.setOrderById
    }
    this.updateQueryParams();
  }

  sortByTotalPrice() {
    this.bookService.sortByTotalPrice(this.filteredBooks, this.priceSort);
    if (this.priceSort === undefined) {
      this.priceSort = 'asc'; // ascending as default preference
    } else {
      this.priceSort = this.priceSort === 'asc' ? 'desc' : 'asc'; // toggle order
    }
    this.updateQueryParams();
  }

  sortByRoomName() {
    this.bookService.sortByRoomName(this.filteredBooks, this.roomNameSort); //ascend if desc/undef & descend if asc
    if(this.roomNameSort === undefined) { //undefined do jet vetem heren e par on reload cmp
      this.roomNameSort = 'asc'; //ascending si first filter (just a preference)
    } else {
      this.roomNameSort = this.roomNameSort === 'asc' ? 'desc' : 'asc';
    }
    this.updateQueryParams();
  }

  sortByCheckin() {
    this.bookService.sortByCheckIn(this.filteredBooks, this.checkinSort);
    this.checkinSort = this.checkinSort === undefined ? 'asc' : this.checkinSort === 'asc' ? 'desc' : 'asc';
    this.updateQueryParams();
  }

  sortByCheckout() {
    this.bookService.sortByCheckOut(this.filteredBooks, this.checkoutSort);
    this.checkoutSort = this.checkoutSort === undefined ? 'asc' : this.checkoutSort === 'asc' ? 'desc' : 'asc';
    this.updateQueryParams();
  }

  filterByStatus(selectedStatus: string) {
    this.filteredBooks =
      selectedStatus ? this.books.filter((b) => this.getBookingStatus(b) === selectedStatus) : [...this.books];
  }

  private updateQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        id: this.idSort,
        room: this.roomNameSort,
        checkin: this.checkinSort,
        checkout: this.checkoutSort,
        price: this.priceSort,
      },
      queryParamsHandling: 'merge'
    });
  }

  getTotalPrice(b: Book) {
    return this.bookService.getTotalPrice(b);
  }

  getBookingStatus(b: Book) {
    return this.bookService.getBookingStatus(b);
  }

}
