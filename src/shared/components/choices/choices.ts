import { Component, inject } from '@angular/core';
import { Room } from '../../services/room';

@Component({
  imports: [],
  selector: 'app-choices',
  styleUrl: './choices.css',
  templateUrl: './choices.html',
})
export class Choices 
{
  protected room = inject(Room);

  /**
   * User made a choice. Select it.
   * If the user selected the same card, it will unselect it.
   * 
   * @param choiceIdx - The index of the chosen card.
   */
  protected madeChoice(choiceIdx: number): void
  {
    const vote = this.isSelected(choiceIdx) ? null : choiceIdx;
    
    this.room.voted(this.room.userId(),vote);
  }

  /**
   * Determine if the choice is currently selected
   * 
   * @param choiceIdx - The choice we are validating
   * @returns - True if it is selected.
   */
  protected isSelected(choiceIdx: number): boolean
  {
    return this.room.getUserState().vote === choiceIdx;
  }
}
