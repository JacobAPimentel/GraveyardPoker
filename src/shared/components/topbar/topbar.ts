import { Component, viewChild } from '@angular/core';
import { NameModal } from '../name-modal/name-modal';

@Component({
  imports: [NameModal],
  selector: 'app-topbar',
  styleUrl: './topbar.css',
  templateUrl: './topbar.html',
})
export class Topbar 
{
  protected nameModal = viewChild.required(NameModal);

  /**
   * Upon up the name modal upon clicking settings.
   */
  public settingsClicked(): void
  {
    this.nameModal().open();
  }
}
