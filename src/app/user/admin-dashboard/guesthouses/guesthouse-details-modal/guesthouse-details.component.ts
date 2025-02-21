import { Component, inject} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CommonModule } from '@angular/common';
import { GuestHouse } from '../../../../shared/models/guesthouse.model';
import { GuestHouseDto } from '../../../../shared/models/dto/guesthouse.dto';

@Component({
  selector: 'app-guesthouse-details',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './guesthouse-details.component.html',
  styleUrl: './guesthouse-details.component.css'
})
export class GuesthouseDetailsComponent{

  private bsModalRef = inject(BsModalRef);

  onEdit: boolean = false;
  onNew: boolean = false;
  onSaveChanges: boolean = false;
  onSubmitNew: boolean = false;
  submitErrorMsg: boolean = false;

  guesthouseName: string = '';
  guesthouse: GuestHouse = {id:0, name:'',description:''};
  newGuesthouse: GuestHouseDto = {name: '', description:''}
  selectedImage: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  guesthouseForm = new FormGroup({
    id: new FormControl(),
    name: new FormControl('',{validators: [Validators.required, Validators.maxLength(20)]}),
    description: new FormControl('',{validators: [Validators.required, Validators.maxLength(60)]}),
  });

  onSave(onSave: boolean){
    if(this.guesthouseForm.invalid){
      console.log('INVALID FORM: form has empty or invalid fields');
      this.submitErrorMsg = true;
      return;
    }
    if (this.guesthouseForm.dirty) {
      this.onSaveChanges = onSave;
      this.guesthouse = structuredClone({ ...this.guesthouse, ...this.guesthouseForm.value });
      //console.log('form was submitted! ',this.guesthouseForm.value);
      //console.log('data passed from form: ',this.guesthouse);
      this.onCloseModal();
    }
    else if (this.guesthouseForm.pristine) {
      //console.log('no data was editted, closing modal without sending PUT request to backend!')
      this.onCloseModal();
    }
  }

  onSubmit(onSubmitNew: boolean) {
    if(this.guesthouseForm.invalid){
      console.log('INVALID FORM: form has empty or invalid fields');
      this.submitErrorMsg = true;
      return;
    }
    if(this.guesthouseForm.valid && this.guesthouseForm.controls.name.value!=null && this.guesthouseForm.controls.description.value!=null) {
      this.onSubmitNew = onSubmitNew;
      this.newGuesthouse = {
        name: this.guesthouseForm.value.name!,
        description: this.guesthouseForm.value.description!,
      };
    }
    this.onCloseModal();
    console.log('this form was submitted!: ',this.guesthouseForm.value);
    console.log('data passed from form to new guesthouse: ',this.newGuesthouse);
  }

  onCloseModal() {
    this.bsModalRef.hide();
    this.onEdit = false;
    this.onNew = false;
    this.guesthouseForm.reset();
  }

}
