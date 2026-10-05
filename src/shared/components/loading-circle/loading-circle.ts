import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Subscription, timer } from 'rxjs';

@Component({
  imports: [],
  selector: 'app-loading-circle',
  styleUrl: './loading-circle.css',
  templateUrl: './loading-circle.html',
})
export class LoadingCircle implements OnInit, OnDestroy
{
  private showLoadingTimer?: Subscription;
  protected visible = signal(false);

  /**
   * The loading circle will only appear after a few milliseconds have passed.
   */
  public ngOnInit(): void 
  {
    this.showLoadingTimer = timer(300).subscribe(() => this.visible.set(true));
  }

  /**
   * Unlisten to the timer if the loading circle gets destroyed.
   */
  public ngOnDestroy(): void 
  {
    this.showLoadingTimer?.unsubscribe();
  }
}
