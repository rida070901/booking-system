import { Component, inject, Input, input } from '@angular/core';
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

  onViewClick() {
    this.router.navigate(['/guesthouse', this.guesthouse()!.id, 'rooms'], {
      queryParams: this.queryParams, // pass searchData in URL
    });
  }

}
