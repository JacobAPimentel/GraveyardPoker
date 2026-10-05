import { Component, inject } from '@angular/core';
import { Room } from '../../services/room';

@Component({
  imports: [],
  selector: 'app-results',
  styleUrl: './results.css',
  templateUrl: './results.html',
})
export class Results 
{
  protected room = inject(Room);

  /**
   * Get the average color. The closer it is to 0, the greener it will be.
   * Further it is, the redder it would be.
   * 
   * @param alpha - 0 to 1, with 0 being green and 1 being red.
   * @returns The color string of the average
   */
  public getAverageColor(alpha: number): string
  {
    const r = Math.round(255 * alpha);
    const g = Math.round(200 * (1 - alpha));

    return `rgb(${r}, ${g}, 0)`;
  }
}
