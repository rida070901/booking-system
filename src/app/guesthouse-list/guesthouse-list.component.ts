import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { GuesthouseService } from '../shared/services/guesthouse.service';
import { GuestHouse } from '../shared/models/guesthouse.model';
import { GuesthouseCardComponent } from "../shared/guesthouse-card/guesthouse-card.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { NgxPaginationModule } from 'ngx-pagination';
import { ActivatedRoute, Router } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";
import { GuestHouseParamsDto } from '../shared/models/dto/guesthouse.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HomeSearchComponent } from "../home/home-search/home-search.component";

@Component({
  selector: 'app-guesthouse-list',
  imports: [GuesthouseCardComponent, NavbarComponent, NgxPaginationModule, FooterComponent, HomeSearchComponent],
  templateUrl: './guesthouse-list.component.html',
  styleUrl: './guesthouse-list.component.css'
})
export class GuesthouseListComponent implements OnInit{

    private guesthouseService = inject(GuesthouseService);
    private destroyRef = inject(DestroyRef);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    //data objects
    private guesthouses: GuestHouse[] = [];
    filteredGuesthouses: GuestHouse[] = [];
    private selectedFilter = signal<string>('');
    queryParams: GuestHouseParamsDto = {};

    //state variables
    isLoading = signal<boolean>(false);
    isAllGuesthouses = signal<boolean>(false);
    currentView = signal<'all' | 'top5' | 'available'>('all');

    //pagination variables
    page: number = 1;
    itemsPerPage = signal<number>(6);
    perPageOptions = [6, 9, 12, 15];


    ngOnInit() {
      this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(queryParams => {
        const { checkIn, checkOut, adults, children } = queryParams;
        if (checkIn && checkOut && adults && children) {
          this.queryParams = {
            checkIn: checkIn,
            checkOut: checkOut,
            numberOfBeds: (parseInt(adults) + parseInt(children)) as number || undefined,
          };
          this.loadAvailableGuesthouses();
        } else if (this.currentView() === 'top5') {
          this.loadTop5Guesthouses();
        } else {
          this.loadAllGuesthouses();
        }
      });
    }

    private loadAllGuesthouses() {
      this.currentView.set('all');
      this.isLoading.set(true);
      this.isAllGuesthouses.set(true);
      this.guesthouseService.getAllGuestHouses().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.guesthouses = data;
          this.filteredGuesthouses = data;
          if (this.selectedFilter) this.applyFilter(this.selectedFilter());
        },
        error: (err) => console.log(err),
        complete: () => {
          this.isLoading.set(false);
        }
      });
    }

    private loadAvailableGuesthouses() {
      this.currentView.set('available');
      this.isLoading.set(true);
      this.isAllGuesthouses.set(false);
      this.guesthouseService.getAvailableGuestHouses(this.queryParams).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.guesthouses = data;
          this.filteredGuesthouses = data;
          if (this.selectedFilter) this.applyFilter(this.selectedFilter());
        },
        error: (err: Error) => {
          console.log(err);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      })
    }

    private loadTop5Guesthouses (){
      this.currentView.set('top5');
      this.isLoading.set(true);
      this.isAllGuesthouses.set(false);
      this.guesthouseService.getTopFiveGuestHouses().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.guesthouses = data;
          this.filteredGuesthouses = data;
          if (this.selectedFilter) this.applyFilter(this.selectedFilter());
        },
        error: (err: Error) => {
          console.log(err);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
    }

    showAllGuesthouses() {
      this.loadAllGuesthouses();
      this.router.navigate([], { //delete searchData query params
        queryParams: {},
        replaceUrl: true //prevents adding to browser history
      });
    }

    showTop5Guesthouses() {
      this.loadTop5Guesthouses();
      this.router.navigate([], { //delete searchData query params
        queryParams: {},
        replaceUrl: true //prevents adding to browser history
      });
    }

    onItemsPerPageChange(targetValue: string) {
      this.itemsPerPage.set(Number(targetValue));
      this.page = 1;
    }

    onSearchGuesthouse(searchTerm: string) {
      this.filteredGuesthouses = this.guesthouses.filter(r =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    applyFilter(filter: string) {
      this.selectedFilter.set(filter);
      if (this.guesthouses) {
        this.filteredGuesthouses = this.guesthouses.sort((a, b) => {
          switch (filter) {
            case 'nameAsc':
              return a.name!.localeCompare(b.name!);
            case 'nameDesc':
              return b.name!.localeCompare(a.name!);
            case 'idAsc':
              return a.id - b.id;
            case 'idDesc':
              return b.id - a.id;
            default:
              return 0;
          }
        });
        this.updateQueryParams();
      } else {
        console.log('No guesthouses found');
      }
    }


    private updateQueryParams() {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          filter: this.selectedFilter(),
        },
        queryParamsHandling: 'merge' // merge with existing params
      });
    }

    // private loadGuesthouses() {
    //   this.isLoading = true;
    //   const sub = this.guesthouseService.getAllGuestHouses().pipe(
    //     switchMap((guesthouses) => {
    //       if (guesthouses.length === 0) {
    //         return of([]); // No guesthouses, return empty array immediately
    //       }

    //       const guesthouseObservables = guesthouses.map((guesthouse) =>
    //         this.roomService.getRoomsByGuestHouse(guesthouse.id).pipe(
    //           switchMap((rooms) => {
    //             if (rooms.length === 0) return of(null); // No rooms in this guesthouse

    //             const bookingObservables = rooms.map((room) =>
    //               this.bookService.getBookingByRoom(room.id).pipe(
    //                 map((bookings) =>
    //                   this.matchSearchCriteria(room, bookings) ? 1 : 0
    //                 ),
    //                 catchError((err) => {
    //                   console.log(err);
    //                   return of(0); // On error, assume no available rooms
    //                 })
    //               )
    //             );

    //             return forkJoin(bookingObservables).pipe(
    //               map((availableCounts) =>
    //                 availableCounts.reduce((a, b) => a + b, 0) > 0 ? guesthouse : null
    //               )
    //             );
    //           }),
    //           catchError((err) => {
    //             console.log(err);
    //             return of(null);
    //           })
    //         )
    //       );

    //       return forkJoin(guesthouseObservables);
    //     }),
    //     catchError((err) => {
    //       console.log(err);
    //       return of([]);
    //     })
    //   ).subscribe({
    //     next: (result) => {
    //       // reduce is used to ensure a strictly typed GuestHouse[]
    //       const validGuesthouses: GuestHouse[] = result.reduce((acc, g) => {
    //         if (g !== null) acc.push(g);
    //         return acc;
    //       }, [] as GuestHouse[]);          this.guesthouses = validGuesthouses;
    //       this.filteredGuesthouses = [...validGuesthouses];
    //       this.isLoading = false;
    //     },
    //     error: (err) => {
    //       console.log(err);
    //       this.isLoading = false;
    //     }
    //   });

    //   this.destroyRef.onDestroy(() => sub.unsubscribe());
    // }

      // first --> fetch all guesthouses
    // for each guesthouse -> fetch all rooms
    // for each room -> fetch all bookings
    // if a room has no bookings -> is available
    // if at least 1 available room exists -> the guesthouse-card is shown

    // filter rooms based on search criteria
    // private matchSearchCriteria(room: Room, bookings: Book[]): boolean {
    //   if (!this.searchData.checkIn || !this.searchData.checkOut) return true;

    //   const checkInDate = new Date(this.searchData.checkIn);
    //   const checkOutDate = new Date(this.searchData.checkOut);

    //   // Check if any booking overlaps with the requested dates
    //   return !bookings.some(booking => {
    //     const bookingFrom = new Date(booking.bookFrom);
    //     const bookingTo = new Date(booking.bookTo);

    //     return (
    //       (checkInDate >= bookingFrom && checkInDate < bookingTo) ||
    //       (checkOutDate > bookingFrom && checkOutDate <= bookingTo) ||
    //       (checkInDate <= bookingFrom && checkOutDate >= bookingTo)
    //     );
    //   });
    // }
}
