import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GuestHouse } from '../../../../shared/models/guesthouse.model';
import { ConfirmDeleteModalComponent } from '../../../shared/confirm-delete/confirm-delete-modal.component';
import { GuesthouseDetailsComponent } from '../guesthouse-details-modal/guesthouse-details.component';
import { GuesthouseService } from '../../../../shared/services/guesthouse.service';


@Component({
  selector: 'app-guesthouse-list',
  standalone: true,
  imports: [ModalModule, NgxPaginationModule, FormsModule, RouterLink],
  providers: [BsModalService],
  templateUrl: './guesthouse-list.component.html',
  styleUrls: ['./guesthouse-list.component.css']
})
export class GuesthouseListComponent implements OnInit{

  private guesthouses: GuestHouse[] = [];
  private guesthouseService = inject(GuesthouseService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute); //to get query params (for the sorting)
  private router = inject(Router);

  //state variables
  isLoading = true;

  // modal variables
  private modalService = inject(BsModalService);
  private modalRef?: BsModalRef;

  //sorting variables (me arrow posht/lart or both when undefined & query params)
  idSort: 'asc' | 'desc' | undefined = undefined;
  nameSort: 'asc' | 'desc' | undefined = undefined;

  //pagination variables
  page: number = 1; //current page
  itemsPerPage: number = 5; // default
  perPageOptions = [5, 8, 10, 20]; //dropdown options for user to choose
  //private selectedItemsPerPage = viewChild.required<ElementRef<HTMLSelectElement>>('targetValue'); //view selected dropdown from user

  //search variables
  search: string = '';
  filteredGuesthouses = [...this.guesthouses];
  //shallow copy - if theres nested objects -> operations on filteredGuesthouses will also change values inside guesthouses (bc its just a reference of g in fg)
  //deep copy (copy also nested objects inside Guesthouse object)
  //filteredGuesthouses = JSON.parse(JSON.stringify(this.guesthouses));


  ngOnInit() {

    //load guesthouses list
    this.loadGuesthouses();

    this.router.navigate([], { //reset query params on reload
      queryParams: {},
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
    const sub = this.guesthouseService.getAllGuestHouses().subscribe({
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
        this.isLoading = false;
      }
    }
    );
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  onItemsPerPageChange(targetValue: string) {
    this.itemsPerPage = Number(targetValue); // passing template var (#targetValue) as arg to this method in html -> easiest way in this case
    this.page = 1;
    //console.log(this.selectedItemsPerPage().nativeElement);
    //this.itemsPerPage = Number(this.selectedItemsPerPage().nativeElement.value);
    //ose alt - get the value as $event arg (pa viewChild sgn)
    //const target = event.target as HTMLSelectElement; // cast event.target to HTMLSelectElement
    //this.itemsPerPage = Number(target.value); // convert string to number
  }

  openDeleteModal(guesthouse: GuestHouse) {
    //console.log(`Guesthouse ${guesthouse.id} about to be deleted!`);
    this.modalRef = this.modalService.show(ConfirmDeleteModalComponent); //hap modal
    this.router.navigate([], { queryParams: { action: 'delete' } });
    this.modalRef.content.name = guesthouse.name;
    const sub = this.modalRef.onHidden?.subscribe(() => { // operations kur del nga modal
      this.router.navigate([], { queryParams: {} });
      //console.log('inside on hidden');
      if(this.modalRef) {
        const confirm = this.modalRef.content.confirm; //boolean: confirm delete -> users choice
        if(confirm) {
          this.onDeleteGuesthouse(guesthouse.id);
        }
      } else {
        console.log('ERROR: check modalRef for GuesthouseList in openDeleteModal', this.modalRef);
      }
    });
    this.destroyRef.onDestroy(() => sub?.unsubscribe());
  }

  private onDeleteGuesthouse(guesthouseId: number) {
    const sub = this.guesthouseService.deleteGuestHouse(guesthouseId).subscribe(() => {
      this.loadGuesthouses();
    });
    //console.log(`Guesthouse ${guesthouseId} deleted!`);
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  openEditModal(guesthouse: GuestHouse) {
    // console.log(`Guesthouse ${guesthouse.id} about to be editted!`);
    // this.router.navigate(['admin/guesthouses/details']); //change url - just for view purposes
    const modalOptions = {
      backdrop: 'static' as const,
      keyboard: false
    };
    this.modalRef = this.modalService.show(GuesthouseDetailsComponent, modalOptions);
    this.router.navigate([], { queryParams: { action: 'edit' } });
    this.modalRef.content.onEdit = true;
    this.modalRef.content.guesthouseName = guesthouse.name;

    //patch selected guesthouse values to the form as default values to then edit
    this.modalRef.content.guesthouseForm.patchValue({
      id: guesthouse.id, //kjo do jet readonly
      name: guesthouse.name,
      description: guesthouse.description,
    });

    const sub = this.modalRef.onHidden?.subscribe(() => {
      this.router.navigate([], { queryParams: {} });
      if(this.modalRef) {
        const onSaveChanges = this.modalRef.content.onSaveChanges;
        if(onSaveChanges) {
          this.onEditGuesthouse(this.modalRef.content.guesthouse);
          //console.log(this.modalRef.content.guesthouseForm.value);
          //this.onEditGuesthouse(this.modalRef.content.guesthouseForm.value);
        }
        // this.router.navigate(['admin/guesthouses']);
      } else {
        console.log('ERROR: check modalRef for GuesthouseDetailsComponent in openEditModal', this.modalRef);
      }
    });
    this.destroyRef.onDestroy(() => sub?.unsubscribe());

  }

  private onEditGuesthouse(guesthouse: GuestHouse){
    const sub = this.guesthouseService.updateGuestHouse(guesthouse.id, guesthouse).subscribe(() => {
      this.loadGuesthouses();
      //console.log(`Guesthouse ${guesthouse.id} updated!`);
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  openNewGuesthouseModal() {
    const modalOptions = {
      backdrop: 'static' as const,
      keyboard: false
    };
    this.modalRef = this.modalService.show(GuesthouseDetailsComponent, modalOptions);
    this.router.navigate([], { queryParams: { action: 'create-guesthouse' } });
    this.modalRef.content.onNew = true;

    const sub = this.modalRef.onHidden?.subscribe(() => {
      this.router.navigate([], { queryParams: {} });
      if(this.modalRef) {
        const onSubmitNew = this.modalRef.content.onSubmitNew;
        if(onSubmitNew) {
          this.onAddGuesthouse(this.modalRef.content.newGuesthouse);
        }
      } else{
        console.log('ERROR: check modalRef for GuesthouseDetailsComponent on openNewGuesthouseModal', this.modalRef);
      }
    });
    this.destroyRef.onDestroy(() => sub?.unsubscribe());
  }

  private onAddGuesthouse(guesthouse: GuestHouse) {
    console.log('inside onAddGuesthouse with new: ', guesthouse);
    const sub = this.guesthouseService.createGuestHouse(guesthouse).subscribe(() => {
      this.loadGuesthouses();
      console.log(`Guesthouse ${guesthouse} added!`);
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  onSearchGuesthouse() {
    if(!this.search) {
      this.filteredGuesthouses = [...this.guesthouses];
      return;
    }
    this.filteredGuesthouses = this.guesthouses.filter(g =>
      g.name?.toLowerCase().includes(this.search.trim().toLowerCase())
    );
  }

  sortById() {
    this.guesthouseService.sortById(this.filteredGuesthouses, this.idSort); //ascend if desc & descend if asc/undef
    if(this.idSort === undefined){ //undefined do jet vetem heren e par on reload cmp
      this.idSort = 'desc'; //descending si first filter (just a preference)
    } else {
      this.idSort = this.idSort === 'asc' ? 'desc' : 'asc'; //update this.setOrderById
    }
    this.updateQueryParams();
  }

  sortByName() {
    this.guesthouseService.sortByName(this.filteredGuesthouses, this.nameSort); //ascend if desc/undef & descend if asc
    if(this.nameSort === undefined) { //undefined do jet vetem heren e par on reload cmp
      this.nameSort = 'asc'; //ascending si first filter (just a preference)
    } else {
      this.nameSort = this.nameSort === 'asc' ? 'desc' : 'asc';
    }
    this.updateQueryParams();
  }

  private updateQueryParams() {
    // update the query parameters in the URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        name: this.nameSort,
        id: this.idSort,
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
