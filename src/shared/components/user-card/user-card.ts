import { Component, computed, inject, input, untracked } from '@angular/core';
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
  protected noVote = computed(() => 
  {
    const vote = this.user().vote;
    return vote === undefined || vote === null;
  });

  /**
   * The card should be hidden.
   */
  protected hideVote = computed(() => 
  {
    return !this.noVote()
           && !this.room.revealed() 
           && untracked(this.user).id !== untracked(this.room.userId);
  });

  /**
   * The user's label string, if they have anything.
   */
  protected label = computed(() => 
  {
    const userId = untracked(this.user).id;

    if(userId === this.room.userId())
    {
      if(this.room.isHost()) return '(You are the host)';
      return '(You)';
    }
    else if(userId === this.room.host())
    {
      return '(Host)';
    }
    return '';
  });
}
