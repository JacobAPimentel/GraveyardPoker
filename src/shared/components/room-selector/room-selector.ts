import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, maxLength, minLength, pattern, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  imports: [FormField],
  selector: 'app-room-selector',
  styleUrl: './room-selector.css',
  templateUrl: './room-selector.html',
})
export class RoomSelector 
{
  protected http = inject(HttpClient);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);

  protected codeModel = signal<string>('');
  protected configForm = form(this.codeModel, (schemaPath) => 
  {
    required(schemaPath, {message: 'Code cannot be empty.'});
    pattern(schemaPath,/^[a-zA-Z0-9]{5}$/,{message: 'Invalid code'});
    minLength(schemaPath,5);
    maxLength(schemaPath,5);
  });

  /**
   * Generate a room code and navigate to the room page.
   */
  protected onCreateRoom(): void 
  {
    this.http.get<{ roomId: string }>('http://localhost:8787/generate-room-code').subscribe(
      {
        next: response => 
        {
          this.joinRoom(response.roomId);
        },
        error: error => 
        {
          console.error('Failed to generate room code:', error);
          return;
        }
      });
  }

  /**
   * Join room with code.
   */
  protected onJoinRoom(event: SubmitEvent): void
  {
    event.preventDefault();
    if(this.configForm().invalid()) return;

    // Upper case it to match the server (which always uppercase)
    this.codeModel.update(val => val.toUpperCase());

    this.joinRoom(this.codeModel());
  }

  /**
   * Redirects the user to the room page.
   * 
   * @param code - The code of the room to join.
   */
  private joinRoom(code: string): void
  {
    this.router.navigate(['./room'],{relativeTo: this.route, queryParams: {'id': code}});
  }
}
