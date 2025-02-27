import { Component, inject, Input, OnInit, signal} from '@angular/core';
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
export class GuesthouseDetailsComponent implements OnInit{

  private bsModalRef = inject(BsModalRef);
  @Input() onEditMode!: boolean;
  @Input() guesthouse!: GuestHouse;

  updatedGuesthouse = signal<GuestHouseDto>({name: '', description:''});
  newGuesthouse = signal<GuestHouseDto>({name: '', description:''});

  onSubmitChanges = signal<boolean>(false);
  onSubmitNew = signal<boolean>(false);
  submitErrorMsg = signal<boolean>(false);

  guesthouseForm = new FormGroup({
    id: new FormControl(),
    name: new FormControl('',{validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20)]}),
    description: new FormControl('',{validators: [Validators.required, Validators.minLength(10), Validators.maxLength(60)]}),
  });


  ngOnInit() {
    if (this.onEditMode && this.guesthouse) {
      this.guesthouseForm.setValue({
        id: this.guesthouse.id, //readonly
        name: this.guesthouse.name!,
        description: this.guesthouse.description!,
      });
    }
  }

  onSave(onSave: boolean){
    if(this.guesthouseForm.invalid){
      console.log('INVALID FORM: form has empty or invalid fields');
      this.submitErrorMsg.set(true);
      return;
    }
    if (JSON.stringify(this.guesthouseForm.getRawValue()) !== JSON.stringify(this.guesthouse)) {
      this.onSubmitChanges.set(onSave);
      this.updatedGuesthouse.set(this.guesthouseForm.getRawValue());
      // console.log('this form was submitted!: ',this.guesthouseForm.value);
      // console.log('data passed from form: ',this.guesthouse);
      this.onCloseModal();
    }
    else {
      console.log('no data was editted, closing modal without sending PUT request to backend!')
      this.onCloseModal();
    }
  }

  onSubmit(onNew: boolean) {
    if(this.guesthouseForm.invalid){
      console.log('INVALID FORM: form has empty or invalid fields');
      this.submitErrorMsg.set(true);
      return;
    }
    if(this.guesthouseForm.valid) {
      this.onSubmitNew.set(onNew);
      this.newGuesthouse.set(this.guesthouseForm.getRawValue());
    }
    // console.log('this form was submitted!: ',this.guesthouseForm.value);
    // console.log('data passed from form to new guesthouse: ',this.newGuesthouse);
    this.onCloseModal();
  }

  onCloseModal() {
    this.bsModalRef.hide();
    this.onEditMode = false;
    this.guesthouseForm.reset();
  }

}
