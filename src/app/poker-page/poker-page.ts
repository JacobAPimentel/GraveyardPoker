import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { Room } from '../../shared/services/room';
import { KeyValuePipe } from '@angular/common';
import { UserCard } from '../../shared/components/user-card/user-card';
import { Choices } from '../../shared/components/choices/choices';
import { Results } from '../../shared/components/results/results';
import { ActivatedRoute, Router } from '@angular/router';
import { SpiderWebsocket } from '../../shared/services/spider-websocket';

@Component({
  imports: [KeyValuePipe, UserCard, Choices, Results],
  selector: 'app-poker-page',
  styleUrl: './poker-page.css',
  templateUrl: './poker-page.html',
})
export class PokerPage implements AfterViewInit, OnDestroy
{
  public router = inject(Router);
  public route = inject(ActivatedRoute);
  public websocket = inject(SpiderWebsocket);

  protected room = inject(Room);

  /**
   * Connect to the server.
   */
  public ngAfterViewInit(): void 
  {
    const roomId = this.route.snapshot.queryParamMap.get('id');
    if(roomId)
    {
      this.websocket.connect(roomId);
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
  }
}
