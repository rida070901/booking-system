import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirm-delete-modal',
  imports: [CommonModule ],
  templateUrl: './confirm-delete-modal.component.html',
  styleUrl: './confirm-delete-modal.component.css'
})
export class ConfirmDeleteModalComponent {

  private bsModalRef = inject(BsModalRef);
  name: string = '';
  confirm: boolean = false; //users choice -> confirm delete item

  onClose(userChoice: boolean) {
    this.confirm = userChoice;
    this.bsModalRef.hide();
  }

  // shouldShake = false;
  // onBackdropClick() {
  //   this.shouldShake = true;
  //   setTimeout(() => {
  //     this.shouldShake = false;
  //   }, 500);
  // }


}
