import { Component, inject, input } from '@angular/core';
import { Settings } from '../../services/settings';

@Component({
  imports: [],
  selector: 'app-user-card',
  styleUrl: './user-card.css',
  templateUrl: './user-card.html',
})
export class UserCard 
{
  protected settings = inject(Settings);
  
  public name = input<string>('');
  public vote = input<number | null>(null);
}
