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

  private searchParams: {checkIn: string; checkOut: string; adults: number; children: number} = { checkIn: '', checkOut: '', adults: 0, children: 0 };

  searchForm = new FormGroup({
    dateRange: new FormControl<Date[] | null>(null, { validators: [Validators.required] }),
    adults: new FormControl(1, { validators: [Validators.required, Validators.min(1)] }),
    children: new FormControl(0, { validators: [Validators.required, Validators.min(0)] })
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
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (params['checkIn'] && params['checkOut']) {
        this.searchForm.patchValue({
          dateRange: [new Date(params['checkIn'] ), new Date(params['checkOut'])],
          adults: params['adults'] ? +params['adults'] : 1,
          children: params['children'] ? +params['children'] : 0,
        });
      }
    });
  }

  onSearch() {
    console.log('clicked onSearch()');
    if (this.searchForm.valid) {
      const [checkIn, checkOut] = this.searchForm.value.dateRange as Date[];
      console.log('date-range clicked is: ', this.searchForm.value.dateRange)
      this.searchParams = {
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        adults: this.searchForm.value.adults!,
        children: this.searchForm.value.children!
      };
      // route dynamically based on current url
      if (this.router.url === '/home') { //from home -> guesthouse-list
        this.router.navigate(['/guesthouses/all'], { queryParams: this.searchParams });
      } else if (this.router.url.startsWith('/guesthouses/all')) {
        this.router.navigate([], { //in guesthouse-list -> just reload the list
          relativeTo: this.route,
          queryParams: this.searchParams,
          queryParamsHandling: 'merge', //merge new params without reloading cpm
          replaceUrl: true
        });
      } else if (this.router.url.includes('/rooms')) { //in room-list -> just reload with new search data
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: this.searchParams,
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    } else {
      console.log('Form is invalid');
    }
  }
}
