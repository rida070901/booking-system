import { CommonModule } from '@angular/common';
import { Component, inject, Input, input, signal } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirm-delete-modal',
  imports: [CommonModule ],
  templateUrl: './confirm-delete-modal.component.html',
  styleUrl: './confirm-delete-modal.component.css'
})
export class ConfirmDeleteModalComponent {

  @Input() name!: string;
  private bsModalRef = inject(BsModalRef);
  confirm = signal<boolean>(false); //users choice -> confirm delete item

  onClose(userChoice: boolean) {
    this.confirm.set(userChoice);
    this.bsModalRef.hide();
  }


}
