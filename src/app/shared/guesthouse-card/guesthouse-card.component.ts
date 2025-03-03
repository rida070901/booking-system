import { Component, inject, Input, input, signal } from '@angular/core';
import { GuestHouseDto, GuestHouseParamsDto } from '../models/dto/guesthouse.dto';
import { GuestHouse } from '../models/guesthouse.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-guesthouse-card',
  imports: [],
  templateUrl: './guesthouse-card.component.html',
  styleUrl: './guesthouse-card.component.css'
})
export class GuesthouseCardComponent {

  private router = inject(Router);

  guesthouse = input.required<GuestHouse | undefined | null>();
  @Input() queryParams: GuestHouseParamsDto | undefined;

  coverImages = signal([
    '/assets/images/guesthouse-cover-0.PNG',
    '/assets/images/guesthouse-cover-1.jpg',
    '/assets/images/guesthouse-cover-4.jpg',
    '/assets/images/guesthouse-cover-5.jpg',
    '/assets/images/guesthouse-cover-6.jpg',
  ]);

  randomImage = signal(this.coverImages()[Math.floor(Math.random() * this.coverImages().length)]);

  onViewClick() {
    this.router.navigate(['/guesthouse', this.guesthouse()!.id, 'rooms'], {
      queryParams: this.queryParams, // pass searchData in URL
      queryParamsHandling: 'preserve'
    });
  }

}
