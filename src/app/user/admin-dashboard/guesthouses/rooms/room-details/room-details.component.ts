import { Component, inject, Input, OnInit, signal } from '@angular/core';
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
export class RoomDetailsComponent implements OnInit{

  private bsModalRef = inject(BsModalRef);
  @Input() onEditMode!: boolean;
  @Input() room!: Room;
  @Input() guesthouseId!: number;

  updatedRoom = signal<RoomDto>({name:'',description:'', image:'', price: 0 ,numberOfBeds:0, guestHouseId: 0, amenities: []});
  newRoom = signal<RoomDto>({name:'',description:'', image:'', price: 0 ,numberOfBeds:0, guestHouseId: 0, amenities: []});

  onSubmitChanges = signal<boolean>(false);
  onSubmitNew = signal<boolean>(false);
  submitErrorMsg = signal<boolean>(false);

  imgHeader = 'data:image/jpeg;base64,';
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  amenitiesList = Object.entries(AmenitiesEnum)
  .filter(([key, value]) => !isNaN(Number(value))) // filters out reverse-mapped enum keys
  .map(([key, value]) => ({ label: key, value: value as number }));

  roomForm = new FormGroup({
    id: new FormControl(),
    name: new FormControl('',{validators: [Validators.required, Validators.minLength(5), Validators.maxLength(20)]}),
    description: new FormControl('',{validators: [Validators.required, Validators.minLength(10), Validators.maxLength(60)]}),
    image: new FormControl('',{validators: [Validators.required]}),
    price: new FormControl(0, {validators: [Validators.required, Validators.min(0.01)]}),
    numberOfBeds: new FormControl(0, {validators: [Validators.required, Validators.min(1), Validators.max(10), Validators.pattern('^[1-9][0-9]*$')]}),
    amenities: new FormControl<number[]>([]),
  });

  ngOnInit() {
    if (this.onEditMode && this.room) {
      this.roomForm.patchValue({
        id: this.room.id, //readonly
        name: this.room.name,
        description: this.room.description,
        image: this.room.image,
        price: this.room.price,
        numberOfBeds: this.room.numberOfBeds,
        amenities: this.room.amenities,
      });
      this.imagePreview.set(this.room.image);
    }
  }

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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage.set(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string); //to show image preview on ui -> esht emri i file as Base64 result (bc its mock db that doesnt accept file)
        this.roomForm.patchValue({ image: this.imagePreview()}); //kalo imagefile e zgjedhur ne form tek image: '.......' (as string)
        this.roomForm.get('image')?.markAsDirty(); //to trigger PUT request
      };
      reader.readAsDataURL(file);
    }
  }

  onSave(onSave: boolean){
    if(this.roomForm.invalid){
      console.log('INVALID FORM: form has empty or invalid fields');
      this.submitErrorMsg.set(true);
      return;
    }
    if (JSON.stringify(this.roomForm.getRawValue()) !== JSON.stringify(this.room)) {
      this.onSubmitChanges.set(onSave);
      this.updatedRoom.set({
        name: this.roomForm.value.name!,
        description: this.roomForm.value.description!,
        image: this.roomForm.value.image!.startsWith(this.imgHeader)
          ? this.roomForm.value.image!.slice(this.imgHeader.length)
          : this.roomForm.value.image!,
        price: this.roomForm.value.price!,
        numberOfBeds: this.roomForm.value.numberOfBeds!,
        guestHouseId: this.room.guestHouseId,
        amenities: this.roomForm.value.amenities?.map(a => Number(a)) ?? [],
      });
      console.log('updated room: ', this.updatedRoom())
      this.onCloseModal();
    }
    else {
      this.onCloseModal();
    }
  }

  onSubmit(onNew: boolean){
    if(this.roomForm.invalid){
      console.log('INVALID FORM: form has empty or invalid fields');
      this.roomForm?.markAllAsTouched();
      this.submitErrorMsg.set(true);
      return;
    }
    if(this.roomForm.valid) {
      this.onSubmitNew.set(onNew);
      //this.room = { ...this.room, ...this.roomForm.value } -need deep copy for amenities?
      // if(this.roomForm.value.image!.startsWith(this.imgHeader)) {
      //   this.newRoom.image = this.roomForm.value.image!.slice(this.imgHeader.length);
      // }
      try {
        this.newRoom.set({
          name: this.roomForm.value.name!,
          description: this.roomForm.value.description!,
          image: this.roomForm.value.image!.startsWith(this.imgHeader)
            ? this.roomForm.value.image!.slice(this.imgHeader.length)
            : this.roomForm.value.image!,
          price: this.roomForm.value.price!,
          numberOfBeds: this.roomForm.value.numberOfBeds!,
          guestHouseId: this.guesthouseId,
          amenities: this.roomForm.value.amenities?.map(a => Number(a)) ?? [],
        });
        console.log('newRoom created:', this.newRoom());
      } catch (error) {
        console.error('error while creating newRoom:', error);
      }
      this.onCloseModal();
    }
  }

  onCloseModal() {
    this.bsModalRef.hide();
    this.onEditMode = false;
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
