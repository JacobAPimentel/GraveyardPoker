import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Room } from '../../shared/services/room';
import { UserCard } from '../../shared/components/user-card/user-card';
import { Choices } from '../../shared/components/choices/choices';
import { Results } from '../../shared/components/results/results';
import { ActivatedRoute, Router } from '@angular/router';
import { SpiderWebsocket } from '../../shared/services/spider-websocket';
import { LoadingCircle } from '../../shared/components/loading-circle/loading-circle';

@Component({
  imports: [UserCard, Choices, Results, LoadingCircle],
  selector: 'app-poker-page',
  styleUrl: './poker-page.css',
  providers: [SpiderWebsocket,Room],
  templateUrl: './poker-page.html',
})
export class PokerPage implements OnInit, OnDestroy
{
  public router = inject(Router);
  public route = inject(ActivatedRoute);
  public websocket = inject(SpiderWebsocket);

  protected room = inject(Room);

  // Fallback function to disconnect the socket if it page were to unload.
  private unloadListener = (): void =>
  {
      this.websocket.disconnect();
  };

  /**
   * Connect to the server.
   */
  public ngOnInit(): void 
  {
    const roomId = this.route.snapshot.queryParamMap.get('id');
    if(roomId)
    {
      this.websocket.connect(roomId);

      // Force disconnect if the page unloads.
      window.addEventListener('beforeunload', this.unloadListener);
    }
    else //No id, go back to home page.
    {
      this.router.navigate(['.']);
    }
  }

  /**
   * Disconnects the websocket on exiting the page (just in case.)
   */
  public ngOnDestroy(): void 
  {
    this.websocket.disconnect();
    window.removeEventListener('beforeunload',this.unloadListener);
  }

  /**
   * The main button was clicked. Decide between flushing or revealing votes.
   */
  public onMainButtonClick(): void
  {
    if(this.room.revealed())
    {
      this.room.resetRound(this.room.userId());
    }
    else
    {
      this.room.revealVotes(this.room.userId());
    }
  }
}
