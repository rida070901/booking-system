import { Component, input, output } from '@angular/core';
import { Room } from '../models/room.model';
import { AmenitiesEnum } from '../models/enums/amentities.enum';


@Component({
  selector: 'app-room-card',
  imports: [],
  templateUrl: './room-card.component.html',
  styleUrl: './room-card.component.css'
})
export class RoomCardComponent{

  room = input.required<Room>();
  openBookModalEvent = output<void>();

  getAmenities(): string[] {
    return this.room().amenities?.map(amenity => AmenitiesEnum[amenity]) ?? [];
  }

  onBook() {
    //console.log('clicked in child: room-card');
    this.openBookModalEvent.emit();
  }

}
