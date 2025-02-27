import { Component, inject, Input, signal } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BookDto, BookedDate } from '../shared/models/dto/book.dto';

@Component({
  selector: 'app-book-room-modal',
  imports: [BsDatepickerModule],
  templateUrl: './book-room-modal.component.html',
})
export class BookRoomModalComponent {
  private bsModalRef = inject(BsModalRef);

  @Input() roomId!: number;
  @Input() roomName!: string;
  @Input() bookedDates!: BookedDate[];

  book = signal<BookDto>({ roomId: 0, bookFrom: '', bookTo: '' });
  onBook = signal<boolean>(false);

  datesDisabled = signal<Date[]>([]);
  selectedRange = signal<Date[]>([]);
  dateError = signal<boolean>(false);
  daysOfStay = signal<number>(0);

  datePickerConfig: Partial<BsDatepickerConfig> = {
    rangeInputFormat: 'YYYY-MM-DD',
    minDate: new Date(),
    dateInputFormat: 'YYYY-MM-DD',
    containerClass: 'theme-default',
    showWeekNumbers: false,
  };

  ngOnInit() {
    this.datesDisabled.set(this.bookedDates.flatMap(({ bookFrom, bookTo }) =>
      this.getDateRange(new Date(bookFrom), new Date(bookTo))
    ));
  }

  onDateChange(selected?: (Date | undefined)[]) {
    this.dateError.set(false);

    if (!selected || selected.length !== 2 || selected.some((d) => !d) || selected[0]!.getTime() === selected[1]!.getTime()) {
      this.selectedRange.set([]);
      this.daysOfStay.set(0);
      this.dateError.set(true);
      return;
    }

    const [start, end] = selected as [Date, Date];
    this.selectedRange.set([start, end]);

    this.daysOfStay.set(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    this.dateError.set(this.datesDisabled().some((disabledDate) => disabledDate >= start && disabledDate <= end));
  }

  onBookRoom() {
    if (!this.dateError() && this.selectedRange().length === 2) {
      this.onBook.set(true);
      const [bookFrom, bookTo] = this.selectedRange();
      this.book.set({
        roomId: this.roomId,
        bookFrom: this.formatDate(bookFrom),
        bookTo: this.formatDate(bookTo),
      });
      this.onCloseModal();
    }
  }

  onCloseModal() {
    this.bsModalRef.hide();
  }

  // ---- helper functions for dealing with dates ---- //

  private getDateRange(startDate: Date, endDate: Date): Date[] {
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() - 1);
    const daysCount = Math.ceil((adjustedEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Array.from({ length: daysCount }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return date;
    });
  }

  private formatDate(date: Date): string { //backend receives string - exact selected dates without time/timezone considerations
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

}
