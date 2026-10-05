import { Component, inject } from '@angular/core';
import { RoomSelector } from '../../shared/components/room-selector/room-selector';
import { Settings } from '../../shared/services/settings';
import { Router } from '@angular/router';

@Component({
  imports: [RoomSelector],
  selector: 'app-home-page',
  styleUrl: './home-page.css',
  templateUrl: './home-page.html',
})
export class HomePage 
{
  protected router = inject(Router);
  protected settings = inject(Settings);

  //Check if there are any error loaded in.
  protected error = this.router.currentNavigation()?.extras.state?.['error'];
}
