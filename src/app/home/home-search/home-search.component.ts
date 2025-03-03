import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-home-search',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BsDatepickerModule],
  templateUrl: './home-search.component.html',
  styleUrl: './home-search.component.css'
})
export class HomeSearchComponent implements OnInit{

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  darkMode = input(false);
  hideGuestsInputs = signal<boolean>(false);

  private searchParams = signal<{checkIn: string; checkOut: string; adults: number; children: number, rooms: number}>({ checkIn: '', checkOut: '', adults: 0, children: 0, rooms:0 });

  searchForm = new FormGroup({
    dateRange: new FormControl<Date[] | null>(null, { validators: [Validators.required] }),
    guests: new FormGroup({
      adults: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
      children: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.max(2)] }),
      rooms: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] })
    })
  });

  adultsOptions = [1, 2, 3, 4];
  childrenOptions = [0, 1, 2, 3];

  datePickerConfig: Partial<BsDatepickerConfig> = {
    rangeInputFormat: 'YYYY-MM-DD',
    minDate: new Date(),
    dateInputFormat: 'YYYY-MM-DD',
    containerClass: 'theme-default',
    showWeekNumbers: false
  };


  ngOnInit() {
    this.hideGuestsInputs.set(this.router.url.includes('/rooms'));
    // fill search-form after search-button-click (if query params exist)
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((queryParams) => {
      if (queryParams['checkIn'] && queryParams['checkOut']) {
        this.searchForm.patchValue({
          dateRange: [new Date(queryParams['checkIn'] ), new Date(queryParams['checkOut'])],
          guests: {
            adults: queryParams['adults'] ? +queryParams['adults'] : 1,
            children: queryParams['children'] ? +queryParams['children'] : 0,
            rooms: queryParams['rooms'] ? +queryParams['rooms'] : 1,
          }
        });
      }
    });
  }

  onSearch() {
    console.log('clicked onSearch() from home-search component');
    if (this.searchForm.valid) {
      const [checkIn, checkOut] = this.searchForm.value.dateRange as Date[];
      console.log('date-range clicked is: ', this.searchForm.value.dateRange)
      this.searchParams.set({
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        adults: this.searchForm.value.guests!.adults!,
        children: this.searchForm.value.guests!.children!,
        rooms: this.searchForm.value.guests!.rooms!,
      });
      // route dynamically based on current url
      if (this.router.url === '/home') { //from home -> guesthouse-list
        this.router.navigate(['/guesthouses/all'], { queryParams: this.searchParams() });
      }
      else { //same cmp -> stay same cmp & just update queryParams
        this.updateQueryParams(this.searchParams());
      }
    } else {
      console.log('Form is invalid');
    }
  }

  updateQueryParams(params: {checkIn: string; checkOut: string; adults: number; children: number}) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    })
  }
}
