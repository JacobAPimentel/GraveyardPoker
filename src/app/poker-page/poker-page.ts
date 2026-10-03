import { Component, inject } from '@angular/core';
import { Room } from '../../shared/services/room';
import { KeyValuePipe } from '@angular/common';
import { UserCard } from '../../shared/components/user-card/user-card';
import { Choices } from '../../shared/components/choices/choices';

@Component({
  imports: [KeyValuePipe, UserCard, Choices],
  selector: 'app-poker-page',
  styleUrl: './poker-page.css',
  templateUrl: './poker-page.html',
})
export class PokerPage 
{
  protected room = inject(Room);
}
