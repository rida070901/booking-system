import { Component, inject } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-user-details',
  imports: [ReactiveFormsModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent {

  private bsModalRef = inject(BsModalRef);

  onSaveChanges: boolean = false;
  name: string = '';
  user: User = { id: '', email: '', firstName: '', lastName: '', phoneNumber: '', role: '' };
  selectedImage: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  onCloseModal() {
    this.bsModalRef.hide();
  }

}
