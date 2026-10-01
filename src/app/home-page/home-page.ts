import { Component } from '@angular/core';
import { RoomSelector } from '../../shared/components/room-selector/room-selector';
import { Topbar } from '../../shared/components/topbar/topbar';

@Component({
  imports: [RoomSelector, Topbar],
  selector: 'app-home-page',
  styleUrl: './home-page.css',
  templateUrl: './home-page.html',
})
export class HomePage {}
