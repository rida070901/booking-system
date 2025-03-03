import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Book } from '../../../shared/models/book.model';
import { BookService } from '../../../shared/services/book.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  //data holding objects
  private userId = this.authService.getUserId();
  private books: Book[] = [];
  filteredBooks: Book[] = [];

  //state variables
  isLoading = signal<boolean>(false);

  //search variable
  search = signal<string>('');

  //sorting variables
  idSort = signal<'asc' | 'desc' | null>(null);
  roomNameSort = signal<'asc' | 'desc' | null>(null);
  checkinSort = signal<'asc' | 'desc' | null>(null);
  checkoutSort = signal<'asc' | 'desc' | null>(null);
  priceSort = signal<'asc' | 'desc' | null>(null);

  //pagination variables
  page: number = 1;
  itemsPerPage = signal<number>(5);
  perPageOptions = [5, 9, 12, 15];

  ngOnInit() {
    this.loadBooks();
    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true
    });
  }

  private loadBooks (){
    this.isLoading.set(true);
    console.log(this.userId)
    this.bookService.getBookingsByUser(this.userId!).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.books = data;
        this.filteredBooks = data;
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
    this.filteredBooks = this.books.sort((a, b) => b.id - a.id);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  onItemsPerPageChange(targetValue: string) {
    this.itemsPerPage.set(Number(targetValue));
    this.page = 1;
  }

  onSearchBook() { //search by room name
    this.filteredBooks = this.books.filter(b =>
      b.room?.name?.toLowerCase().includes(this.search().trim().toLowerCase())
    );
  }

  sortById() {
    const currentSort = this.idSort();
    this.bookService.sortById(this.filteredBooks, currentSort);
    this.idSort.set(currentSort === null ? 'desc' : (currentSort === 'asc' ? 'desc' : 'asc'));
    this.updateQueryParams();
  }

  sortByTotalPrice() {
    const currentSort = this.priceSort();
    this.bookService.sortByTotalPrice(this.filteredBooks, currentSort);
    this.priceSort.set(currentSort === null ? 'asc' : (currentSort === 'asc' ? 'desc' : 'asc'));
    this.updateQueryParams();
  }

  sortByRoomName() {
    const currentSort = this.roomNameSort();
    this.bookService.sortByRoomName(this.filteredBooks, currentSort);
    this.roomNameSort.set(currentSort === null ? 'asc' : (currentSort === 'asc' ? 'desc' : 'asc'));
    this.updateQueryParams();
  }

  sortByCheckin() {
    const currentSort = this.checkinSort();
    this.bookService.sortByCheckIn(this.filteredBooks, currentSort);
    this.checkinSort.set(currentSort === null ? 'asc' : currentSort === 'asc' ? 'desc' : 'asc');
    this.updateQueryParams();
  }

  sortByCheckout() {
    const currentSort = this.checkoutSort();
    this.bookService.sortByCheckOut(this.filteredBooks, currentSort);
    this.checkoutSort.set(currentSort === null ? 'asc' : currentSort === 'asc' ? 'desc' : 'asc');
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
        id: this.idSort(),
        room: this.roomNameSort(),
        checkin: this.checkinSort(),
        checkout: this.checkoutSort(),
        price: this.priceSort(),
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
