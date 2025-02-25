import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
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
import { AuthService } from '../shared/services/auth.service';
import { LoginComponent } from '../login/login.component';

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
  private authService = inject(AuthService);
  private modalService = inject(BsModalService);
  private modalRef?: BsModalRef;

  //data objects
  private guesthouseId: number = 0;
  guesthouse: GuestHouse = {id: 0, name:'', description:''};
  private rooms: Room[] = [];
  filteredRooms: Room[] = [];
  private selectedFilter = signal<string>('');
  bookedDates: { bookFrom: string; bookTo: string; }[] = [];
  queryParams: RoomParamsDto = {};

  //state variables
  isLoadingGuesthouse = signal<boolean>(false);
  isLoadingRooms = signal<boolean>(false);
  isLoadingBookedDates = signal<boolean>(false);
  isAllRooms = signal<boolean>(false);
  isloggedIn = signal<boolean>(this.authService.isAuthenticated());


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
    this.isLoadingGuesthouse.set(true);
    this.guesthouseService.getGuestHouseById(guesthouseId).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        this.guesthouse = data;
      },
      error: (err: Error) => {
        console.log(err);
      },
      complete: () => {
        this.isLoadingGuesthouse.set(false);
      }
    });
  }

  private loadAllRooms (guesthouseId: number){
    this.isLoadingRooms.set(true);
    this.isAllRooms.set(true);
    console.log('loading all rooms')
    this.roomService.getRoomsByGuestHouse(guesthouseId).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        this.rooms = data;
        this.filteredRooms = data;
        if (this.selectedFilter) this.applyFilter(this.selectedFilter());
      },
      error: (err: Error) => {
        console.log(err);
      },
      complete: () => {
        this.isLoadingRooms.set(false);
      }
    });
  }

  private loadAvailableRooms (guesthouseId: number){
    this.isLoadingRooms.set(true);
    this.isAllRooms.set(false);
    console.log('loading available rooms');
    console.log(this.queryParams)
    this.roomService.getAvailableRoomsByGuestHouse(guesthouseId, this.queryParams).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        console.log(data)
        this.rooms = data;
        this.filteredRooms = data;
        if (this.selectedFilter) this.applyFilter(this.selectedFilter());
      },
      error: (err: Error) => {
        console.log(err);
      },
      complete: () => {
        this.isLoadingRooms.set(false);
      }
    });
  }

  loadTop5Rooms() {
    console.log('loading top5');
    this.isLoadingRooms.set(true);
    this.isAllRooms.set(false);
    this.roomService.getTop5RoomsByGuesthouse(this.guesthouseId)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (top5Rooms) => {
        this.filteredRooms = top5Rooms;
      },
      error: (err: Error) => console.log(err),
      complete: () => {
        this.isLoadingRooms.set(false);
      }
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

  openBookModal(roomId: number, roomName: string) {
    console.log('room id: ', roomId)
    this.isLoadingBookedDates.set(true);
    this.bookService.getBookingByRoom(roomId).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        this.bookedDates = data.map(book => ({
          bookFrom: book.bookFrom,
          bookTo: book.bookTo
        }));
      },
      error: (err: Error) => {
        this.isLoadingBookedDates.set(false);
        console.log(err);
        if ((err as any).status === 401) {
          const currentUrl = this.router.url.split('?')[0];
          this.authService.setRedirectUrl(currentUrl); // so that onLogin redirects to /rooms
          const modalRef = this.modalService.show(LoginComponent); // open login-modal
          modalRef.onHidden?.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            if (this.authService.isAuthenticated()) { //if successful login
              this.openBookModal(roomId, roomName); // reopen modal
            }
          });
        }
      },
      complete: () => {
        this.isLoadingBookedDates.set(false);
        const modalOptions = {
          backdrop: 'static' as const,
          keyboard: false,
          initialState: {
            roomId: roomId! as number,
            roomName: roomName!,
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
      next:() => {
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
    this.selectedFilter.set(filter);
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
        filter: this.selectedFilter(),
      },
      queryParamsHandling: 'merge', // merge with existing params
      replaceUrl: true, //dont add url to browser history
    });
  }

    // private checkAuthAndProceed(roomId: number, roomName: string) {
  //   if (this.authService.isAuthenticated()) {
  //     this.openBookModal(roomId, roomName); //if authenticated -> proceed direkt
  //   } else {
  //     const currentUrl = this.router.url.split('?')[0];
  //     this.authService.setRedirectUrl(currentUrl); //so that onLogin redirects to /rooms
  //     this.router.navigate([], {
  //       relativeTo: this.route,
  //       queryParams: { room: roomId, name: roomName },
  //       queryParamsHandling: 'merge',
  //     });

  //     const modalRef = this.modalService.show(LoginComponent);
  //     modalRef.onHidden?.pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe(() => {
  //       if (this.authService.isAuthenticated()) { //if successful login
  //         this.openBookModal(roomId, roomName); // continue same action (stored in authService) after-login
  //       }
  //     });
  //   }
  // }

}
