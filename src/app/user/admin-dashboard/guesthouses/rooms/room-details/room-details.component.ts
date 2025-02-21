import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CommonModule } from '@angular/common';
import { Room } from '../../../../../shared/models/room.model';
import { RoomDto } from '../../../../../shared/models/dto/room.dto';
import { AmenitiesEnum } from '../../../../../shared/models/enums/amentities.enum';

@Component({
  selector: 'app-room-details',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './room-details.component.html',
  styleUrl: './room-details.component.css'
})
export class RoomDetailsComponent {

  private bsModalRef = inject(BsModalRef);

  onEdit: boolean = false;
  onNew: boolean = false;
  onSaveChanges: boolean = false;
  onSubmitNew: boolean = false;
  submitErrorMsg: boolean = false;

  roomName: string = '';
  guestHouseId: number = 0;
  room: Room = {id:0, name:'',description:'', image:'', price: 0 ,numberOfBeds:0, guestHouseId: 0, amenities: []};
  newRoom: RoomDto = {name:'',description:'', image:'', price: 0 ,numberOfBeds:0, guestHouseId: 0, amenities: []};
  imgHeader = 'data:image/jpeg;base64,';
  selectedImage: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  roomForm = new FormGroup({
    id: new FormControl(),
    name: new FormControl('',{validators: [Validators.required, Validators.maxLength(20)]}),
    description: new FormControl('',{validators: [Validators.required, Validators.maxLength(60)]}),
    image: new FormControl('',{validators: [Validators.required]}),
    price: new FormControl(0, {validators: [Validators.required]}),
    numberOfBeds: new FormControl(0, {validators: [Validators.required]}),
    amenities: new FormControl<number[]>([]),
  });

  amenitiesList = Object.entries(AmenitiesEnum)
  .filter(([key, value]) => !isNaN(Number(value))) // filters out reverse-mapped enum keys
  .map(([key, value]) => ({ label: key, value: value as number }));

  onAmenityChange(event: Event, amenityValue: number) {
    const checked = (event.target as HTMLInputElement).checked;
    const currentAmenities = this.roomForm.value.amenities || [];

    if (checked) {
      this.roomForm.patchValue({ amenities: [...currentAmenities, amenityValue] });
      // console.log('amenity ', amenityValue, ' was just checked')
      // console.log('in form there is: ', this.roomForm.controls.amenities.value)
    } else {
      this.roomForm.patchValue({ amenities: currentAmenities.filter(a => a !== amenityValue) });
      // console.log('in form after un-check there is: ', this.roomForm.controls.amenities.value)
    }
  }


  onSave(onSave: boolean){
    if(this.roomForm.invalid){
      console.log('INVALID FORM: form has empty or invalid fields');
      this.submitErrorMsg = true;
      return;
    }
    if (this.roomForm.dirty) {
      this.onSaveChanges = onSave;
      this.room = {
        id: this.roomForm.value.id,
        name: this.roomForm.value.name!,
        description: this.roomForm.value.description!,
        image: this.roomForm.value.image!,
        price: this.roomForm.value.price!,
        numberOfBeds: this.roomForm.value.numberOfBeds!,
        guestHouseId: this.guestHouseId,
        amenities: this.roomForm.value.amenities?.map(a => Number(a)) ?? [],
      };
      console.log('sending edited data: ', this.room)
      this.onCloseModal();
    }
    else if (this.roomForm.pristine) {
      //console.log('no data was editted, closing modal without sending PUT request to backend!')
      this.onCloseModal();
    }
  }

onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedImage = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string; //to show image preview on ui -> esht emri i file as Base64 result (bc its mock db that doesnt accept file)
      this.roomForm.patchValue({ image: this.imagePreview}); //kalo imagefile e zgjedhur ne form tek image: '.......' (as string)
      this.roomForm.get('image')?.markAsDirty(); //to trigger PUT request
    };
    reader.readAsDataURL(file);
  }
}

onSubmit(onSubmitNew: boolean){
  if(this.roomForm.invalid){
    console.log('INVALID FORM: form has empty or invalid fields');
    this.submitErrorMsg = true;
    return;
  }
  if(this.roomForm.valid) {
    this.onSubmitNew = onSubmitNew;
    //this.room = { ...this.room, ...this.roomForm.value } -need deep copy for emnities
    // if(this.roomForm.value.image!.startsWith(this.imgHeader)) {
    //   this.newRoom.image = this.roomForm.value.image!.slice(this.imgHeader.length);
    // }
    this.newRoom = {
      name: this.roomForm.value.name!,
      description: this.roomForm.value.description!,
      image: this.roomForm.value.image!.startsWith(this.imgHeader) ? this.roomForm.value.image!.slice(this.imgHeader.length) : this.roomForm.value.image!,
      // image: 'imgg',
      price: this.roomForm.value.price!,
      numberOfBeds: this.roomForm.value.numberOfBeds!,
      guestHouseId: this.guestHouseId,
      amenities: this.roomForm.value.amenities?.map(a => Number(a)) ?? [],
    };
    // console.log('sending data: ', this.newRoom)
    this.onCloseModal();
  }
}

onCloseModal() {
  this.bsModalRef.hide();
  this.onEdit = false;
  this.onNew = false;
  this.roomForm.reset();
}

// onGuesthouseSelected(selectedGuesthouse: {id: string, name: string}) {
//   if(selectedGuesthouse) {
//     this.roomForm.patchValue({
//       guesthouseId: selectedGuesthouse.id,
//       guesthouseName: selectedGuesthouse.name
//     });
//     console.log(this.roomForm.value.guesthouseId)
//   }
//   // this.roomForm.controls.guesthouseName.markAsTouched(); //styling purpose
//   // const selectedGuesthouse = this.guesthouses.find(g => g.name === selectedName);
//   // console.log(selectedGuesthouse)
//   // this.roomForm.patchValue({
//   //   guesthouseId: selectedGuesthouse?.id
//   // });
//   // console.log(this.roomForm.value.guesthouseId)
// }


}
