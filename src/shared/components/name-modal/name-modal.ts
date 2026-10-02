import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { form, maxLength, minLength, required, FormField } from '@angular/forms/signals';
import { Settings } from '../../services/settings';

@Component({
  imports: [FormField],
  selector: 'app-name-modal',
  styleUrl: './name-modal.css',
  templateUrl: './name-modal.html',
})
export class NameModal implements AfterViewInit
{
  private settings = inject(Settings);
  private dialog = viewChild.required<ElementRef<HTMLDialogElement>>('nameDialog');


  protected nameModel = signal<string>('');
  protected configForm = form(this.nameModel, (schemaPath) => 
  {
    required(schemaPath, {message: 'Name cannot be empty.'});
    minLength(schemaPath,1);
    maxLength(schemaPath,30);
  });

  ngAfterViewInit(): void 
  {
    if(this.settings.displayName() === '')
    {
      this.open();
    }
  }

  public open(): void
  {
    this.dialog().nativeElement.showModal();
  }

  /**
  * Generates the guesses.
  * 
  * @param event - The submit event
  */
  protected onConfirm(event: SubmitEvent): void
  {
    event.preventDefault();
    if(this.configForm().invalid()) return;

    this.settings.displayName.set(this.nameModel());
    localStorage.setItem('displayName',this.nameModel());
    
    this.dialog().nativeElement.close();
  }
}
