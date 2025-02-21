import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { RoomDetailsComponent } from '../room-details/room-details.component';
import { CommonModule } from '@angular/common';
import { Room } from '../../../../../shared/models/room.model';
import { RoomService } from '../../../../../shared/services/room.service';
import { ConfirmDeleteModalComponent } from '../../../../shared/confirm-delete/confirm-delete-modal.component';
import { RoomDto } from '../../../../../shared/models/dto/room.dto';

@Component({
  selector: 'app-room-list',
  imports: [FormsModule, NgxPaginationModule, CommonModule],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.css'
})
export class RoomListComponent implements OnInit{

  private rooms: Room[] = [];
  private guesthouseId: string | null = null;
  private roomService = inject(RoomService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute); //to get guesthouseId & query params (for the sorting)
  private router = inject(Router); //update/reset query params

  //state variables
  isLoading = true;

  //search variables
  //search = signal('');
  filteredRooms = [...this.rooms];

  //modal variables
  private modalService = inject(BsModalService);
  private modalRef?: BsModalRef;

  //sorting variables
  idSort: 'asc' | 'desc' | undefined = undefined;
  nameSort: 'asc' | 'desc' | undefined = undefined;
  priceSort: 'asc' | 'desc' | undefined = undefined;
  guesthouseIdSort: 'asc' | 'desc' | undefined = undefined;

  //pagination variables
  page: number = 1; //current page
  itemsPerPage: number = 5; // default
  perPageOptions = [5, 8, 10, 20]; //dropdown options for user to choose

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      this.guesthouseId = params.get('id');
      if(this.guesthouseId) {
        console.log('guesthouse id passed to room-list: ', this.guesthouseId);
      }
    })

    //this.roomService.createRoom({amenities: [2], name:'test', description:'test', image:'test', guestHouseId: 7, price:80, numberOfBeds:2}).subscribe();

    this.loadRooms(); //load rooms on initialization

    this.router.navigate([], { //reset query params on reload
      queryParams: {},
      replaceUrl: true // prevents adding to browser history
    });
  }


  private loadRooms() {
    const sub = this.roomService.getRoomsByGuestHouse(parseInt(this.guesthouseId!))
    .subscribe({
      next: (data) => {
        this.rooms = data;
        this.filteredRooms = data;
      },
      error: (err: Error) => {
        console.error(err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }


  onItemsPerPageChange(targetValue: string) {
    this.itemsPerPage = Number(targetValue);
    this.page = 1; //go to page 1
  }

  onSearchRoom(searchTerm: string) {
    this.filteredRooms = this.rooms.filter(r =>
      r.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  openDeleteModal(room: Room) {
    this.modalRef = this.modalService.show(ConfirmDeleteModalComponent); //open modal
    this.router.navigate([], { queryParams: { action: 'delete' } });
    this.modalRef.content.name = room.name;
    const sub = this.modalRef.onHidden?.subscribe(() => { // operations kur del nga modal
      this.router.navigate([], { queryParams: {} });
      if(this.modalRef) {
        const confirm = this.modalRef.content.confirm; //boolean: confirm delete -> users choice
        if(confirm) {
          this.onDeleteRoom(room.id);
        }
      } else {
        console.log('ERROR: check modalRef for RoomList in openDeleteModal', this.modalRef);
      }
    });
    this.destroyRef.onDestroy(() => sub?.unsubscribe());
  }

  private onDeleteRoom(roomId: number) {
    const sub = this.roomService.deleteRoom(roomId).subscribe(() => {
      this.loadRooms();
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  openEditModal(room: Room) {
    const modalOptions = {
      backdrop: 'static' as const,
      keyboard: false
    };
    this.modalRef = this.modalService.show(RoomDetailsComponent, modalOptions);
    this.router.navigate([], { queryParams: { action: 'edit' } });
    this.modalRef.content.onEdit = true;
    this.modalRef.content.roomName = room.name;
    this.modalRef.content.guestHouseId = room.guestHouseId;

    this.modalRef.content.roomForm.patchValue({
      id: room.id, //readonly
      name: room.name,
      description: room.description,
      image: room.image,
      price: room.price,
      numberOfBeds: room.numberOfBeds,
      amenities: room.amenities,
    });

    const sub = this.modalRef.onHidden?.subscribe(() => {
      this.router.navigate([], { queryParams: {} });
      if(this.modalRef) {
        const onSaveChanges = this.modalRef.content.onSaveChanges;
        if(onSaveChanges) {
          this.onEditRoom(room.id, this.modalRef.content.room);
        }
      } else {
        console.log('ERROR: check modalRef for RoomDetailsComponent in openEditModal', this.modalRef);
      }
    });
    this.destroyRef.onDestroy(() => sub?.unsubscribe());

  }

  private onEditRoom(id: number, room: RoomDto){
    console.log('indisde onedit: ', room)
    const sub = this.roomService.updateRoom(id, room).subscribe(() => {
      this.loadRooms();
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  openNewRoomModal() {
    const modalOptions = {
      backdrop: 'static' as const,
      keyboard: false
    };
    this.modalRef = this.modalService.show(RoomDetailsComponent, modalOptions);
    this.router.navigate([], { queryParams: { action: 'create-room' } });
    this.modalRef.content.onNew = true;
    this.modalRef.content.guestHouseId = parseInt(this.guesthouseId!);

    const sub = this.modalRef.onHidden?.subscribe(() => {
      this.router.navigate([], { queryParams: {} });
      if(this.modalRef) {
        const onSubmitNew = this.modalRef.content.onSubmitNew;
        if(onSubmitNew) {
          this.onAddRoom(this.modalRef.content.newRoom);
        }
      } else{
        console.log('ERROR: check modalRef for RoomDetailsComponent on openNewRoomModal', this.modalRef);
      }
    });
    this.destroyRef.onDestroy(() => sub?.unsubscribe());
  }

  private onAddRoom(room: Room) {
    console.log('inside onAdd ', room)
    const sub = this.roomService.createRoom(room).subscribe(() => {
      this.loadRooms();
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  sortById() {
    this.roomService.sortById(this.filteredRooms, this.idSort); //ascend if desc & descend if asc/undef
    if(this.idSort === undefined){ //undefined do jet vetem heren e par on reload cmp
      this.idSort = 'desc'; //descending si first filter (just a preference)
    } else {
      this.idSort = this.idSort === 'asc' ? 'desc' : 'asc'; //update this.idSort
    }
    this.updateQueryParams();
  }

  sortByGuesthouseId() {
    this.roomService.sortByGuesthouseId(this.filteredRooms, this.guesthouseIdSort); //ascend if desc & descend if asc/undef
    if(this.guesthouseIdSort === undefined){ //undefined do jet vetem heren e par on reload cmp
      this.guesthouseIdSort = 'desc'; //descending si first filter (just a preference)
    } else {
      this.guesthouseIdSort = this.guesthouseIdSort === 'asc' ? 'desc' : 'asc'; //update
    }
    this.updateQueryParams();
  }

  sortByName() {
    this.roomService.sortByName(this.filteredRooms, this.nameSort); //ascend if desc/undef & descend if asc
    if(this.nameSort === undefined) { //undefined do jet vetem heren e par on reload cmp
      this.nameSort = 'asc'; //ascending si first filter (just a preference)
    } else {
      this.nameSort = this.nameSort === 'asc' ? 'desc' : 'asc';
    }
    this.updateQueryParams();
  }

  sortByPrice() {
    this.roomService.sortByPrice(this.filteredRooms, this.priceSort); //ascend if desc/undef & descend if asc
    if(this.priceSort === undefined){ //undefined do jet vetem heren e par on reload cmp
      this.priceSort = 'asc'; //ascending si first filter (just a preference)
    } else {
      this.priceSort = this.priceSort === 'asc' ? 'desc' : 'asc'; //update this.setOrderById
    }
    this.updateQueryParams();
  }

  private updateQueryParams() { // update the query parameters in the URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        id: this.idSort,
        name: this.nameSort,
        price: this.priceSort,
        guesthouse: this.guesthouseIdSort,
      },
      queryParamsHandling: 'merge' // merge with existing params
    });
  }


}
