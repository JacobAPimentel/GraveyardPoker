import { Component, effect, inject } from '@angular/core';
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
export class PokerPage
{
  public settings = inject(Settings);
  public router = inject(Router);
  public route = inject(ActivatedRoute);
  public websocket = inject(SpiderWebsocket);

  protected room = inject(Room);

  /**
   * Determine if the page should automatically connect or not. If there is NOT a display name, then do not connect
   * until after the user sets their name.
   */
  private shouldIConnect = effect(() => 
  {
    if(!this.settings.displayName()) return;

    // Attempt to connect to the server.
    const roomId = this.route.snapshot.queryParamMap.get('id');
    if(!roomId || !/^[a-zA-Z0-9]{5}$/.test(roomId)) // invalid id
    {
        this.router.navigate(['graveyard'], {state: {errorCode: 400,errorMsg: 'Bad Request'}, skipLocationChange: true});
        return;
    }
    this.shouldIConnect.destroy();
    this.websocket.connect(roomId);

    // Listen for a forced disconnect. (Such as the host leaving.).
    this.websocket.forceDisconnect$.subscribe(
    {
      complete: () => this.router.navigate(['/'], {state: {errorMsg: 'Lost connection to the host.'}})
    });

    //Listen if the websocket errored when trying to createa it.
    this.websocket.websocketErrored$.subscribe(
    {
      complete: () => this.router.navigate(['graveyard'], {state: {errorCode: 503,errorMsg: 'Service Unavailable'},skipLocationChange: true})
    });
  });

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
