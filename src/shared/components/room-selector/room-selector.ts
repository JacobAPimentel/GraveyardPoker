import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-room-selector',
  styleUrl: './room-selector.css',
  templateUrl: './room-selector.html',
})
export class RoomSelector 
{
  protected http = inject(HttpClient);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);

  /**
   * Generate a room code and navigate to the room page.
   */
  public onCreateRoom(): void 
{
    this.http.get<{ roomId: string }>('http://localhost:8787/generate-room-code').subscribe(
      {
        next: response => 
        {
          this.router.navigate(['./room'],{relativeTo: this.route, queryParams: {'id': response.roomId}});
        },
        error: error => 
        {
          console.error('Failed to generate room code:', error);
          return;
        }
      });
  }
}
