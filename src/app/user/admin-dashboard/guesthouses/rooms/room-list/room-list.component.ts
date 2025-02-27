import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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

  private guesthouseId: string | null = null;
  private roomService = inject(RoomService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute); //to get guesthouseId & query params (for the sorting)
  private router = inject(Router); //update/reset query params

  //data holding objects
  private rooms: Room[] = [];
  filteredRooms: Room[] = [];

  //state variables
  isLoading = signal<boolean>(false);
  deletingId = signal<number | null>(null);
  updatingId = signal<number | null>(null);

  //modal variables
  private modalService = inject(BsModalService);
  private modalRef?: BsModalRef;

  //sorting variables
  idSort = signal<'asc' | 'desc' | null>(null);
  nameSort = signal<'asc' | 'desc' | null>(null);
  priceSort = signal<'asc' | 'desc' | null>(null);
  guesthouseIdSort = signal<'asc' | 'desc' | null>(null);

  //pagination variables
  page: number = 1;
  itemsPerPage = signal<number>(5);
  perPageOptions = [6, 9, 12, 15];

  ngOnInit() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.guesthouseId = params.get('id');
      if(this.guesthouseId) {
        console.log('guesthouse id passed to room-list: ', this.guesthouseId);
      }
    })
    this.loadRooms();
    this.router.navigate([], { //reset query params on reload
      queryParams: {},
      replaceUrl: true
    });
  }


  private loadRooms() {
    this.isLoading.set(true);
    this.roomService.getRoomsByGuestHouse(parseInt(this.guesthouseId!)).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        this.rooms = data;
        this.filteredRooms = data;
      },
      error: (err: Error) => {
        console.error(err);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  showRecentlyAdded() {
    this.filteredRooms = this.rooms.sort((a, b) => b.id - a.id);
  }

  onItemsPerPageChange(targetValue: string) {
    this.itemsPerPage.set(Number(targetValue));
    this.page = 1;
  }

  onSearchRoom(searchTerm: string) {
    this.filteredRooms = this.rooms.filter(r =>
      r.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  openDeleteModal(roomId: number, roomName: string) {
    const modalOptions = {
      backdrop: 'static' as const,
      keyboard: false,
      initialState: {
        name: roomName,
      }
    };
    this.modalRef = this.modalService.show(ConfirmDeleteModalComponent, modalOptions);
    this.modalRef.onHidden?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if(this.modalRef?.content.confirm()) {
        this.onDeleteRoom(roomId);
      }
    });
  }

  private onDeleteRoom(roomId: number) {
    this.deletingId.set(roomId);
    this.roomService.deleteRoom(roomId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.loadRooms();
      },
      error: (err) => {
        console.error('deleting failed:', err);
      },
      complete: () => {
        this.deletingId.set(null);
      }
    });
  }

  openEditModal(room: Room) {
    const modalOptions = {
      backdrop: 'static' as const,
      keyboard: false,
      initialState: {
        onEditMode: true,
        room: room!,
      }
    };
    this.modalRef = this.modalService.show(RoomDetailsComponent, modalOptions);
    this.modalRef.onHidden?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if(this.modalRef?.content.onSubmitChanges()) {
        this.onEditRoom(room.id, this.modalRef.content.updatedRoom());
      }
    });

  }

  private onEditRoom(roomId: number, room: RoomDto){
    console.log('indisde onedit: ', room)
    this.updatingId.set(roomId);
    this.roomService.updateRoom(roomId, room).subscribe({
      next: () => {
        this.loadRooms();
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

  openNewRoomModal() {
    const modalOptions = {
      backdrop: 'static' as const,
      keyboard: false,
      initialState: {
        onEditMode: false,
        guesthouseId: parseInt(this.guesthouseId!)
      }
    };
    this.modalRef = this.modalService.show(RoomDetailsComponent, modalOptions);
    this.modalRef.onHidden?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if(this.modalRef?.content.onSubmitNew()) {
        this.onAddRoom(this.modalRef.content.newRoom());
      }
    });
  }

  private onAddRoom(room: Room) {
    console.log('inside onAdd ', room)
    this.isLoading.set(true);
    this.roomService.createRoom(room).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.loadRooms();
    });
  }

  sortById() {
    const currentSort = this.idSort();
    this.roomService.sortById(this.filteredRooms, currentSort);
    this.idSort.set(currentSort === null ? 'desc' : (currentSort === 'asc' ? 'desc' : 'asc'));
    this.updateQueryParams();
  }

  sortByGuesthouseId() {
    const currentSort = this.guesthouseIdSort();
    this.roomService.sortByGuesthouseId(this.filteredRooms, currentSort);
    this.guesthouseIdSort.set(currentSort === null ? 'desc' : (currentSort === 'asc' ? 'desc' : 'asc'));
    this.updateQueryParams();
  }

  sortByName() {
    const currentSort = this.nameSort();
    this.roomService.sortByName(this.filteredRooms, currentSort);
    this.nameSort.set(currentSort === null ? 'asc' : (currentSort === 'asc' ? 'desc' : 'asc'));
    this.updateQueryParams();
  }


  sortByPrice() {
    const currentSort = this.priceSort();
    this.roomService.sortByPrice(this.filteredRooms, currentSort);
    this.priceSort.set(currentSort === null ? 'asc' : (currentSort === 'asc' ? 'desc' : 'asc'));
    this.updateQueryParams();
  }

  private updateQueryParams() { // update the query parameters in the URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        id: this.idSort(),
        name: this.nameSort(),
        price: this.priceSort(),
        guesthouse: this.guesthouseIdSort(),
      },
      queryParamsHandling: 'merge' // merge with existing params
    });
  }


}
