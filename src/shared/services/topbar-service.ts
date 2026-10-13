import { inject, Service, signal, WritableSignal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';

// Copy Link button
type CopyLink = {
    link: string,
    display: string
}
type Tool = CopyLink;

// Gives option for pages to customize the topbar.
@Service()
export class TopbarService 
{
    private router = inject(Router);
    public tools: WritableSignal<Record<string,Tool>> = signal({});
    
    /**
     * Listens to route changes. On a new route, the topbar will reset all its tools.
     * 
     * It is up to the page themselves to set the tool after the fact.
     */
    public constructor()
    {
        this.router.events.pipe(
            filter(event => event instanceof NavigationStart)
        ).subscribe(() => this.setTools(null));
    }

    /**
     * Set the toolbar.
     * 
     * @returns - Tools options OR null if tools should not appear.
     */
    public setTools(tools: Record<string,Tool> | null): void
    {
        this.tools.set(tools || {});
    }
}