import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RoomCardComponent } from "../shared/room-card/room-card.component";
import { RoomService } from '../shared/services/room.service';
import { Room } from '../shared/models/room.model';
import { ActivatedRoute, Router } from '@angular/router';
import { GuestHouse } from '../shared/models/guesthouse.model';
import { GuesthouseService } from '../shared/services/guesthouse.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BookRoomModalComponent } from '../book-room-modal/book-room-modal.component';
import { BookService } from '../shared/services/book.service';
import { BookDto } from '../shared/models/dto/book.dto';
import { HomeSearchComponent } from "../home/home-search/home-search.component";
import { RoomParamsDto } from '../shared/models/dto/room.dto';
import { combineLatest } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-guesthouse-details',
  imports: [RoomCardComponent, NavbarComponent, FooterComponent, HomeSearchComponent],
  templateUrl: './guesthouse-details.component.html',
  styleUrl: './guesthouse-details.component.css'
})
export class GuesthouseDetailsComponent implements OnInit{

  private roomService = inject(RoomService);
  private guesthouseService = inject(GuesthouseService);
  private bookService = inject(BookService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private modalService = inject(BsModalService);
  private modalRef?: BsModalRef;

  isLoadingGuesthouse = false;
  isLoadingRooms = false;
  isLoadingBookedDates = false;
  isAllRooms = false;

  private guesthouseId: number = 0;
  guesthouse: GuestHouse = {id: 0, name:'', description:''};
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  queryParams: RoomParamsDto = {};
  bookedDates: { bookFrom: string; bookTo: string; }[] = [];
  selectedFilter: string = '';


  ngOnInit() {
    combineLatest([this.route.params, this.route.queryParams])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, queryParams]) => {
        this.guesthouseId = +params['id'];
        this.loadGuesthouse(this.guesthouseId);
        const { checkIn, checkOut } = queryParams;
        if (checkIn && checkOut) {
          this.queryParams = { checkIn, checkOut };
          this.loadAvailableRooms(this.guesthouseId);
        } else {
          this.loadAllRooms(this.guesthouseId);
        }
      });
  }

  private loadGuesthouse(guesthouseId: number) {
    this.isLoadingGuesthouse = true;
    this.guesthouseService.getGuestHouseById(guesthouseId).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        this.guesthouse = data;
      },
      error: (err: Error) => {
        console.log(err);
      },
      complete: () => {
        this.isLoadingGuesthouse = false;
      }
    });
  }

  private loadAllRooms (guesthouseId: number){
    this.isLoadingRooms = true;
    this.isAllRooms = true;
    console.log('loading all rooms')
    this.roomService.getRoomsByGuestHouse(guesthouseId).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        this.rooms = data;
        this.filteredRooms = data;
        if (this.selectedFilter) this.applyFilter(this.selectedFilter);
      },
      error: (err: Error) => {
        console.log(err);
      },
      complete: () => {
        this.isLoadingRooms = false;
      }
    });
  }

  private loadAvailableRooms (guesthouseId: number){
    this.isLoadingRooms = true;
    this.isAllRooms = false;
    console.log('loading available rooms');
    console.log(this.queryParams)
    this.roomService.getAvailableRoomsByGuestHouse(guesthouseId, this.queryParams).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        console.log(data)
        this.rooms = data;
        this.filteredRooms = data;
        if (this.selectedFilter) this.applyFilter(this.selectedFilter);
      },
      error: (err: Error) => {
        console.log(err);
      },
      complete: () => {
        this.isLoadingRooms = false;
      }
    });
  }

  loadTop5Rooms() {
    console.log('loading top5');
    this.isLoadingRooms = true;
    this.isAllRooms = false;
    this.roomService.getTop5RoomsByGuesthouse(this.guesthouseId)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (top5Rooms) => {
        this.filteredRooms = top5Rooms;
      },
      error: (err: Error) => console.log(err),
      complete: () => (this.isLoadingRooms = false),
    });
  }

  showAllRooms() {
    this.loadAllRooms(this.guesthouseId);
    this.router.navigate([], { //delete searchData query params
      queryParams: {},
      replaceUrl: true //prevents adding to browser history
    });
  }

  showTop5Rooms() {
    this.loadTop5Rooms();
    this.router.navigate([], { //delete searchData query params
      queryParams: {},
      replaceUrl: true //prevents adding to browser history
    });
  }

  onSearchRoom(searchTerm: string) {
    this.filteredRooms = this.rooms.filter(r =>
      r.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  openBookModal(room: Room) {
    console.log('room id: ', room.id)
    this.isLoadingBookedDates = true;
    this.bookService.getBookingByRoom(room.id).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        this.bookedDates = data.map(book => ({
          bookFrom: book.bookFrom,
          bookTo: book.bookTo
        }));
      },
      error: (err: Error) => {
        console.log(err);
      },
      complete: () => {
        this.isLoadingBookedDates = false;
        const modalOptions = {
          backdrop: 'static' as const,
          keyboard: false,
          initialState: {
            roomId: room.id! as number,
            roomName: room.name!,
            bookedDates: this.bookedDates,
          }
        };
        this.modalRef = this.modalService.show(BookRoomModalComponent, modalOptions);
        this.modalRef.onHidden?.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          const onBook = this.modalRef?.content.onBook;
          if(onBook) {
            this.onAddBook(this.modalRef?.content.book);
          }
        });
      }
    });
  }

  private onAddBook(book: BookDto) {
    // console.log('inside onAddBook with book data: ', book)
    this.roomService.bookRoom(book).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next:(data) => {
      this.toastr.success('Successfully booked!', '', {
        positionClass: 'toast-center-center',
        timeOut: 2500,
        progressBar: true,
        closeButton: true,
        easeTime: 300,
        easing: 'ease-in',
      });
      // this.loadAllRooms(this.guesthouseId);
      },
      error: (err: Error) => {
        console.log(err);
        this.toastr.error('Booking failed. Please try again.', 'Error', {
          positionClass: 'toast-center-center',
          timeOut: 3000,
          progressBar: true,
          closeButton: true,
          easeTime: 300,
          easing: 'ease-in',
        });
      }
    });
  }

  applyFilter(filter: string) {
    this.selectedFilter = filter;
    if(this.rooms) {
      this.filteredRooms = this.rooms.sort((a, b) => {
        switch (filter) {
          case 'nameAsc':
            return a.name!.localeCompare(b.name!);
          case 'nameDesc':
            return b.name!.localeCompare(a.name!);
          case 'priceAsc':
            return a.price - b.price;
          case 'priceDesc':
            return b.price - a.price;
          default:
            return 0;
        }
      });
      this.updateQueryParams();
    } else {
      console.log('No rooms found');
    }
  }

  private updateQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        filter: this.selectedFilter,
      },
      queryParamsHandling: 'merge' // merge with existing params
    });
  }

}
