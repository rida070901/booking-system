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
  private queryParams = signal<RoomParamsDto>({});
  //private queryParams = signal<RoomParamsDto>({});

  //state variables
  isLoadingGuesthouse = signal<boolean>(false);
  isLoadingRooms = signal<boolean>(false);
  isLoadingBookedDates = signal<boolean>(false);
  isAllRooms = signal<boolean>(false);
  isloggedIn = signal<boolean>(this.authService.isAuthenticated());


  ngOnInit() {
    console.log('ngOnInit: RELOADING COMPONENT');
    this.guesthouseId = +this.route.snapshot.params['id'];
    this.loadGuesthouse(this.guesthouseId);
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((queryParams) => {
        console.log('ngOnInit: INSIDE SUBSCRIBTION QUERYPARAMS');
        const { checkIn, checkOut } = queryParams;
        console.log('queryParams gotten: ', checkIn, 'and ', checkOut);
        console.log('prev params are: ', this.queryParams().checkIn, 'and ', this.queryParams().checkOut);
        if((checkIn && checkOut ) && (checkIn != this.queryParams().checkIn || checkOut != this.queryParams().checkOut)) {
          this.queryParams.set({ checkIn, checkOut });
          this.loadAvailableRooms(this.guesthouseId, { checkIn, checkOut });
        }
        else if(!this.rooms.length){ //coming from view-all-rooms
          this.loadAllRooms(this.guesthouseId);
        }
        if (this.selectedFilter()) this.applyFilter(this.selectedFilter()); //filter without api call
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
      },
      error: (err: Error) => {
        console.log(err);
      },
      complete: () => {
        this.isLoadingRooms.set(false);
      }
    });
  }

  private loadAvailableRooms (guesthouseId: number, params: RoomParamsDto){
    this.isLoadingRooms.set(true);
    this.isAllRooms.set(false);
    console.log('loading available rooms');
    this.roomService.getAvailableRoomsByGuestHouse(guesthouseId, params).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        this.rooms = data;
        this.filteredRooms = data;
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
    this.selectedFilter.set('');
    this.queryParams.set({});
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  showTop5Rooms() {
    this.loadTop5Rooms();
    this.selectedFilter.set('');
    this.queryParams.set({});
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
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
    this.bookService.getBookedDatesByRoom(roomId).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      //next is triggered every time new data is emitted by the observable -> for http.get its only once with the response
      //by the time next runs all response data is available
      next: (bookedDates) => {
        const modalOptions = {
          backdrop: 'static' as const,
          keyboard: false,
          initialState: {
            roomId,
            roomName,
            bookedDates,
          }
        };
        this.modalRef = this.modalService.show(BookRoomModalComponent, modalOptions);
        this.modalRef.onHidden?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
          if(this.modalRef?.content.onBook()) {
            this.onAddBook(this.modalRef?.content.book());
          }
        });
      },
      error: (err: Error) => {
        this.isLoadingBookedDates.set(false);
        console.log(err);
        if ((err as any).status === 401) {
          this.authService.setRedirectUrl(this.router.url.split('?')[0]); // so that onLogin redirects to /guesthouse/:id/rooms
          const modalRef = this.modalService.show(LoginComponent); // open login-modal
          modalRef.onHidden?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            if (this.authService.isAuthenticated()) { //if successful login
              this.openBookModal(roomId, roomName); // reopen modal
            }
          });
        }
      },
      complete: () => {
        this.isLoadingBookedDates.set(false);
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
      queryParamsHandling: 'merge',
      replaceUrl: true,
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
