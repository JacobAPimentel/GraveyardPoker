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
}
