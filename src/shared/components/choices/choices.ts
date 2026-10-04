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
   * 
   * @param choiceIdx - The index of the chosen card.
   */
  protected madeChoice(choiceIdx: number): void
  {
    this.room.voted(this.room.userId(),choiceIdx);
  }
}
