import { Component, inject, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BookDto } from '../shared/models/dto/book.dto';

@Component({
  selector: 'app-book-room-modal',
  imports: [BsDatepickerModule],
  templateUrl: './book-room-modal.component.html',
})
export class BookRoomModalComponent {

  bsModalRef = inject(BsModalRef);

  @Input() roomId!: number;
  @Input() roomName!: string;
  @Input() bookedDates!: { bookFrom: string, bookTo: string }[];

  book: BookDto = { roomId: 0, bookFrom: '', bookTo: '' };
  onBook: boolean = false;
  datesDisabled: Date[] = []; //convert to Dates[] for disabled booked dates

  selectedRange: Date[] = [];
  dateError: boolean = false;
  showError: boolean = false;
  daysOfStay: number = 0;

  datePickerConfig: Partial<BsDatepickerConfig> = {
    rangeInputFormat: 'YYYY-MM-DD',
    minDate: new Date(),
    dateInputFormat: 'YYYY-MM-DD',
    containerClass: 'theme-default',
    showWeekNumbers: false
  };

  ngOnInit() {
    this.datesDisabled = this.bookedDates.flatMap(({ bookFrom, bookTo }) =>
      this.getDateRange(new Date(bookFrom), this.subtractOneDay(new Date(bookTo)))
    );
  }

  onDateChange(selected: (Date | undefined)[] | undefined) {
    this.showError = false;

    if (!selected || selected.length !== 2 || selected.includes(undefined)) {
      this.selectedRange = [];
      this.daysOfStay = 0;
      return;
    }

    this.selectedRange = selected.filter(date => date !== undefined) as Date[];
    const [start, end] = this.selectedRange;

    this.daysOfStay = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    this.dateError = this.datesDisabled.some(
      (booked) => booked >= start && booked <= end
    );

    if (this.dateError) {
      this.showError = true;
      this.daysOfStay = 0;
    }
  }

  onBookRoom() {
    if (!this.dateError && this.selectedRange.length === 2) {
      this.onBook = true;
      const [bookFrom, bookTo] = this.selectedRange;
      this.book = {
        roomId: this.roomId,
        bookFrom: bookFrom.toISOString(),
        bookTo: bookTo.toISOString()
      }
      this.onCloseModal();
    }
  }

  onCloseModal() {
    this.bsModalRef.hide();
  }

  // ---- helper functions for dealing with dates ---- //

  private getDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate)); // push a new Date instance
      currentDate.setDate(currentDate.getDate() + 1); // move to the next day
    }
    return dates;
  }

  subtractOneDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    return newDate;
  }


}
