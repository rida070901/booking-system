import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { GuestHouse } from '../shared/models/guesthouse.model';
import { GuesthouseService } from '../shared/services/guesthouse.service';
import { HomeSearchComponent } from "./home-search/home-search.component";
import { AmenitiesEnum } from '../shared/models/enums/amentities.enum';
import { GuesthouseCardComponent } from "../shared/guesthouse-card/guesthouse-card.component";
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, HomeSearchComponent, FooterComponent, GuesthouseCardComponent, CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{

  private guesthouseService = inject(GuesthouseService);
  private destroyRef = inject(DestroyRef);

  isLoading = signal<boolean>(false);

  guesthouses: GuestHouse[] = [];
  amenities = Object.values(AmenitiesEnum).filter(key => isNaN(Number(key)));
  bgImages = [
    '/assets/images/guesthouse10.PNG',
    '/assets/images/guesthouse11.PNG',
    '/assets/images/guesthouse9.PNG',
    '/assets/images/guesthouse12.PNG',
  ];
  selectedImage = this.bgImages[0]; // default bg image

  ngOnInit() {
    this.loadTop5Guesthouses();
  }

  private loadTop5Guesthouses (){
    this.isLoading.set(true);
    this.guesthouseService.getTopFiveGuestHouses().pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        this.guesthouses = data;
      },
      error: (err: Error) => {
        console.log(err);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

}
