import { Component, computed, inject, input } from '@angular/core';
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

  /**
   * User has not voted.
   */
  public noVote = computed(() => 
  {
    const vote = this.user().vote;
    return vote === undefined || vote === null;
  });

  /**
   * The card should be hidden.
   */
  public hideVote = computed(() => 
  {
    return !this.noVote()
           && !this.room.revealed() 
           && this.user().id !== this.room.userId();
  });
}
