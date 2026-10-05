import { Component, effect, inject, OnDestroy } from '@angular/core';
import { Room } from '../../shared/services/room';
import { UserCard } from '../../shared/components/user-card/user-card';
import { Choices } from '../../shared/components/choices/choices';
import { Results } from '../../shared/components/results/results';
import { ActivatedRoute, Router } from '@angular/router';
import { SpiderWebsocket } from '../../shared/services/spider-websocket';
import { LoadingCircle } from '../../shared/components/loading-circle/loading-circle';
import { Settings } from '../../shared/services/settings';

@Component({
  imports: [UserCard, Choices, Results, LoadingCircle],
  selector: 'app-poker-page',
  styleUrl: './poker-page.css',
  providers: [SpiderWebsocket,Room],
  templateUrl: './poker-page.html',
})
export class PokerPage implements OnDestroy
{
  public settings = inject(Settings);
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
   * Determine if the page should automatically connect or not. If there is NOT a display name, then do not connect
   * until after the user sets their name.
   */
  private shouldIConnect = effect(() => 
  {
    if(!this.settings.displayName()) return;

    this.connectToServer();
    this.shouldIConnect.destroy();

    this.websocket.forceDisconnect$.subscribe(
    {
      complete: () => this.router.navigate(['.'], {state: {errorMsg: 'Lost connection to the host.'}})
    });

    this.websocket.websocketErrored$.subscribe(
    {
      complete: () => this.router.navigate(['graveyard'], {state: {errorCode: 503,errorMsg: 'Service Unavailable'}})
    });
  });

    /**
   * Connect to the server.
   * 
   * If there is no room code as part of the query, navigate back to the home page.
   */
  public connectToServer(): void
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
