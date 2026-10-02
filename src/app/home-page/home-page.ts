import { Component, inject } from '@angular/core';
import { RoomSelector } from '../../shared/components/room-selector/room-selector';
import { Settings } from '../../shared/services/settings';

@Component({
  imports: [RoomSelector],
  selector: 'app-home-page',
  styleUrl: './home-page.css',
  templateUrl: './home-page.html',
})
export class HomePage 
{
  protected settings = inject(Settings);
}
