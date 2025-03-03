import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GuestHouse } from '../../../../shared/models/guesthouse.model';
import { ConfirmDeleteModalComponent } from '../../../shared/confirm-delete/confirm-delete-modal.component';
import { GuesthouseDetailsComponent } from '../guesthouse-details-modal/guesthouse-details.component';
import { GuesthouseService } from '../../../../shared/services/guesthouse.service';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GuestHouseDto } from '../../../../shared/models/dto/guesthouse.dto';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-guesthouse-list',
  standalone: true,
  imports: [ModalModule, NgxPaginationModule, FormsModule, RouterLink, CommonModule],
  providers: [BsModalService],
  templateUrl: './guesthouse-list.component.html',
  styleUrls: ['./guesthouse-list.component.css']
})
export class GuesthouseListComponent implements OnInit{

  private guesthouseService = inject(GuesthouseService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);


  //data holding objects
  private guesthouses: GuestHouse[] = []; //has all guesthouses
  filteredGuesthouses: GuestHouse[] = []; //copy of filtered 'guesthouses' (showed on ui)
  //shallow copy - if theres nested objects -> operations on filteredGuesthouses will also change values inside guesthouses (bc its just a reference of g in fg)
  //deep copy (copy also nested objects inside Guesthouse object)
  //filteredGuesthouses = JSON.parse(JSON.stringify(this.guesthouses));

  //state variables
  isLoading = signal<boolean>(false);
  creatingNew = signal<boolean>(false);
  deletingId = signal<number | null>(null);
  updatingId = signal<number | null>(null);

  // modal variables
  private modalService = inject(BsModalService);
  private modalRef?: BsModalRef;

  //sorting variables (me arrow posht/lart or both when undefined & query params)
  idSort = signal<'asc' | 'desc' | null>(null);
  nameSort = signal<'asc' | 'desc' | null>(null);

  //pagination variables
  page: number = 1; //current page
  itemsPerPage = signal<number>(5); // default
  perPageOptions = [6, 9, 12, 15]; //dropdown options for user to choose
  //private selectedItemsPerPage = viewChild.required<ElementRef<HTMLSelectElement>>('targetValue'); //view selected dropdown from user

  //search variables
  search = signal<string>('');


  ngOnInit() {

    this.loadGuesthouses(); //load guesthouses list

    this.router.navigate([], {
      queryParams: {}, //reset query params on reload
      replaceUrl: true // prevents adding to browser history
    });

    //get query params for sorting by name / id when reloading cmp -> to save filters after reaload
    // const sub = this.route.queryParams.subscribe((params) => {
    //   if((params['name']) && (this.nameSort !== undefined)) {
    //       this.nameSort = params['name'] === 'asc' ? 'asc' : 'desc';
    //   }
    //   if((params['id']) && (this.idSort != undefined)) {
    //       this.idSort = params['id'] === 'asc' ? 'asc' : 'desc';
    //   }
    // });
    // this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  private loadGuesthouses (){
    this.isLoading.set(true);
    this.guesthouseService.getAllGuestHouses().pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        this.guesthouses = data;
        this.filteredGuesthouses = data;
        // this.totalGuesthouses = data.length;
        // this.totalPages = Math.ceil(this.totalGuesthouses / this.guesthousesPerPage);
        // if(this.currentPage<=this.totalPages){
        //   this.guesthouses = data.slice((this.currentPage-1) * this.guesthousesPerPage, this.currentPage * this.guesthousesPerPage);
        // } else{
        //   this.goToPage(1);
        //   this.guesthouses = data.slice((this.currentPage-1) * this.guesthousesPerPage, this.currentPage * this.guesthousesPerPage);
        // }
        // // this.guesthouses = data.slice((this.currentPage-1) * this.guesthousesPerPage, this.currentPage * this.guesthousesPerPage);
      },
      error: (err: Error) => {
        console.log(err);
      },
      complete: () => {
        this.isLoading.set(false);
        this.showRecentlyAdded();
      }
    }
    );
  }

  showRecentlyAdded() {
    this.filteredGuesthouses = this.guesthouses.sort((a, b) => b.id - a.id);
  }

  onItemsPerPageChange(targetValue: string) {
    this.itemsPerPage.set(Number(targetValue)); // passing template var (#targetValue) as arg to this method in html -> easiest way in this case
    this.page = 1;
    //console.log(this.selectedItemsPerPage().nativeElement);
    //this.itemsPerPage = Number(this.selectedItemsPerPage().nativeElement.value);
    //ose alt - get the value as $event arg (pa viewChild sgn)
    //const target = event.target as HTMLSelectElement; // cast event.target to HTMLSelectElement
    //this.itemsPerPage = Number(target.value); // convert string to number
  }

  openDeleteModal(guesthouseId: number, guesthouseName: string) {
    //console.log(`Guesthouse ${guesthouse.id} about to be deleted!`);
    const modalOptions = {
      backdrop: 'static' as const,
      keyboard: false,
      initialState: {
        name: guesthouseName,
      }
    };
    this.modalRef = this.modalService.show(ConfirmDeleteModalComponent, modalOptions); //hap modal
    this.modalRef.onHidden?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => { // operations kur del nga modal
      if(this.modalRef?.content.confirm()) { //boolean: confirm delete -> users choice
        this.onDeleteGuesthouse(guesthouseId);
      }
    });
  }

  private onDeleteGuesthouse(guesthouseId: number) {
    this.deletingId.set(guesthouseId);
    this.guesthouseService.deleteGuestHouse(guesthouseId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        //this.loadGuesthouses(); //refresh list
        this. guesthouses = [...this.guesthouses.filter((g) => g.id !== guesthouseId)];
        this. filteredGuesthouses = [...this.filteredGuesthouses.filter((g) => g.id !== guesthouseId)];
      },
      error: (err) => {
        console.error('deleting failed:', err);
        this.deletingId.set(null);
      },
      complete: () => {
        this.deletingId.set(null);
      }
    });
  }

  openEditModal(guesthouse: GuestHouse) {
    // console.log(`Guesthouse ${guesthouse.id} about to be editted!`);
    const modalOptions = {
      backdrop: 'static' as const,
      keyboard: false,
      initialState: {
        onEditMode: true,
        guesthouse: guesthouse,
      }
    };
    this.modalRef = this.modalService.show(GuesthouseDetailsComponent, modalOptions);
    this.modalRef.onHidden?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if(this.modalRef?.content.onSubmitChanges()) {
        this.onEditGuesthouse(guesthouse.id, this.modalRef.content.updatedGuesthouse());
      }
    });
  }

  private onEditGuesthouse(guesthouseId: number, guesthouse: GuestHouseDto){
    this.updatingId.set(guesthouseId);
    this.guesthouseService.updateGuestHouse(guesthouseId, guesthouse).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        //this.loadGuesthouses(); //refresh list
        this.guesthouses.map((g) => {
          if(g.id === guesthouseId) {
            g.name = guesthouse.name!;
            g.description = guesthouse.description!;
            return;
          }
        });
        this.filteredGuesthouses.map((g) => {
          if(g.id === guesthouseId) {
            g.name = guesthouse.name!;
            g.description = guesthouse.description!;
            return;
          }
        });
      },
      error: (err) => {
        console.error('updating failed:', err);
        this.updatingId.set(null);
      },
      complete: () => {
        this.updatingId.set(null);
      }
    });
  }

  openNewGuesthouseModal() {
    const modalOptions = {
      backdrop: 'static' as const,
      keyboard: false,
      initialState: {
        onEditMode: false,
      }
    };
    this.modalRef = this.modalService.show(GuesthouseDetailsComponent, modalOptions);
    this.modalRef.onHidden?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if(this.modalRef?.content.onSubmitNew()) {
        this.onAddGuesthouse(this.modalRef.content.newGuesthouse());
      }
    });
  }

  private onAddGuesthouse(guesthouse: GuestHouseDto) {
    // console.log('inside onAddGuesthouse with new: ', guesthouse);
    this.creatingNew.set(true);
    this.guesthouseService.createGuestHouse(guesthouse).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        // this.rooms = [...this.rooms, room];
        // this.filteredRooms = [...this.filteredRooms, room];
        this.toastr.success('Successfully added!', '', {
          positionClass: 'toast-center-center',
          timeOut: 2500,
          progressBar: true,
          closeButton: true,
          easeTime: 300,
          easing: 'ease-in',
        });
        this.loadGuesthouses();
      },
      error: (err) => {
        console.error('adding new guesthouse failed:', err);
        this.creatingNew.set(false);
      },
      complete: () => {
        this.creatingNew.set(false);
      }
    });
  }

  onSearchGuesthouse() { //with ngmodel
    this.filteredGuesthouses = this.guesthouses.filter(g =>
      g.name?.toLowerCase().includes(this.search().trim().toLowerCase())
    );
  }

  sortById() {
    const currentSort = this.idSort();
    this.guesthouseService.sortById(this.filteredGuesthouses, currentSort);
    this.idSort.set(currentSort === null ? 'desc' : (currentSort === 'asc' ? 'desc' : 'asc'));
    this.updateQueryParams();
  }

  sortByName() {
    const currentSort = this.nameSort();
    this.guesthouseService.sortByName(this.filteredGuesthouses, currentSort);
    this.nameSort.set(currentSort === null ? 'asc' : (currentSort === 'asc' ? 'desc' : 'asc'));
    this.updateQueryParams();
  }

  private updateQueryParams() {
    // update the query parameters in the URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        name: this.nameSort(),
        id: this.idSort(),
      },
      queryParamsHandling: 'merge' // merge with existing params
    });
  }

}



  // MANUAL PAGINATION LOGIC
  // currentPage = 1;
  // guesthousesPerPage = 8;
  // totalGuesthouses = 0;
  // totalPages = 0;
  // pageSizeSelected = viewChild.required<ElementRef<HTMLSelectElement>>('pageSizeSelected');
  // get pageNumbers() {
  //   const pages = [];
  //   const startPage = Math.floor((this.currentPage - 1) / 3) * 3 + 1;  // page block starts from 1, 4, 7, ...
  //   const endPage = Math.min(startPage + 2, this.totalPages); // show 3 pages max
  //   // always show the first 3 pages, then the next 3 after navigating
  //   for (let page = startPage; page <= endPage; page++) {
  //     pages.push(page);
  //   }
  //   // Add "..." if there are more pages after the current block
  //   if (endPage < this.totalPages) {
  //     pages.push('...');
  //   }
  //   return pages;
  //   // return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  // }
  // goToPage(page: number) {
  //   if (page >= 1 && page <= this.totalPages) {
  //     this.currentPage = page;
  //     this.loadGuesthouses();
  //   }
  // }
  // onPageSizeChange() {
  //   const selected = this.pageSizeSelected().nativeElement.value;
  //   //console.log(selected, '??')
  //   this.guesthousesPerPage = Number(selected);
  //   //console.log(selected, '???')
  //   this.loadGuesthouses();
  // }
