import { Component, inject, signal, viewChild } from '@angular/core';
import { NameModal } from '../name-modal/name-modal';
import { RouterLink } from '@angular/router';
import { TopbarService } from '../../services/topbar-service';

@Component({
  imports: [NameModal, RouterLink],
  selector: 'app-topbar',
  styleUrl: './topbar.css',
  templateUrl: './topbar.html',
})
export class Topbar 
{
  protected service = inject(TopbarService);
  protected nameModal = viewChild.required(NameModal);

  /**  Custom message to appear for the clipboard text. The text MUST be in quotations as it is a CSS literal! */
  protected clipboardMessage = signal('');

  /**
   * Upon up the name modal upon clicking settings.
   */
  public settingsClicked(): void
  {
    this.nameModal().open();
  }

  /**
   * Copy the link of the room to the clipboard.
   * 
   * Will also update the clipboard message to appear underneath the button.
   */
  public copyLinkToClipboard(): void
  {
    if(this.clipboardMessage()) return;

    navigator.clipboard.writeText(this.service.tools()['CopyLink'].link).then(
      () => this.clipboardMessage.set('"Copied!"'),
      () => this.clipboardMessage.set('"Failed to copy :("'),
    ).finally(async () =>
    {
      await new Promise(resolve => setTimeout(resolve, 2500));
      this.clipboardMessage.set('');
    });
  }
}
