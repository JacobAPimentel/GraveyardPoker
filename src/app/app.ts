import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Settings } from '../shared/services/settings';
import { Topbar } from '../shared/components/topbar/topbar';

@Component({
  imports: [RouterOutlet, Topbar],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App
{
  protected readonly title = signal('Graveyard Poker');

  protected settings = inject(Settings);
}
