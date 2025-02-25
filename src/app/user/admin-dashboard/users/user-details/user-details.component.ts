import { Component, inject, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-user-details',
  imports: [],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent {

  private bsModalRef = inject(BsModalRef);
  @Input() user!: User;

  onCloseModal() {
    this.bsModalRef.hide();
  }

}
