import { Component, inject, input } from '@angular/core';
import { Settings } from '../../services/settings';
import { User } from '../../types';
import { Room } from '../../services/room';

@Component({
  imports: [],
  selector: 'app-user-card',
  styleUrl: './user-card.css',
  templateUrl: './user-card.html',
})
export class UserCard 
{
  protected settings = inject(Settings);
  protected room = inject(Room);
  
  public user = input.required<User>();
}
