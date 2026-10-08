import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { Settings } from './settings';
import { ServerState, User } from '../types';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class SpiderWebsocket implements OnDestroy
{
    /** 
     * Determine if the socket is connected. 
     * This will get set on initialJoin rather than "connected" afterwards, so we know
     * that everything is already loaded.
    */
    public connected = signal(false);
    private settings = inject(Settings);
    
    private socket: WebSocket | null = null;

    //LISTENERS
    public forceDisconnect$ = new Subject<void>();
    public websocketErrored$ = new Subject<void>();

    public initialJoin$ = new Subject<{userId: string, state: ServerState}>();
    public userConnected$ = new Subject<User>();
    public userDisconnected$ = new Subject<string>();
    public userModified$ = new Subject<User>();
    public revealVotes$ = new Subject<void>();
    public resetRound$ = new Subject<void>();

    private pingId?: number;

    /**
     * Connect to the room and bind event listeners.
     * 
     * @param roomId - The room that the user is attempting to join.
     */
    public connect(roomId: string): void 
    {
        this.socket = new WebSocket(`${environment.wsUrl}/room/${roomId}?name=${this.settings.displayName()}`);

        this.socket.addEventListener('open', () => 
        {
            console.log('Connected to room');

            //Ping the server every 30 seconds to prevent autodisconnect
            this.pingId = setInterval(() =>  this.send({type: 'ping'}),30000);
            window.addEventListener('beforeunload',this.serviceUnloaded.bind(this));
        });

        this.socket.addEventListener('close', (closeEvent: CloseEvent) => 
        {
            console.log(`Disconnected ${closeEvent.wasClean ? 'cleanly' : 'abruptly'} (${closeEvent.code}): ${closeEvent.reason}`);

            // If it is still "connected", that means that a force connection occurred.
            if(this.connected())
            {
                this.forceDisconnect$.complete();
                this.disconnect();
            }
        });

        this.socket.addEventListener('error', error => 
        {
            console.error('WebSocket error:', error);

            this.websocketErrored$.complete();
        });

        // Main web socket messages
        this.socket.addEventListener('message', event => 
        {
            const message = JSON.parse(event.data);

            switch(message.type)
            {
                case 'initialJoin': this.initialJoin$.next(message);
                                    this.connected.set(true);
                                    break;
                case 'connected': this.userConnected$.next(message.user); break;
                case 'disconnected': this.userDisconnected$.next(message.userId); break;
                case 'user-modified': this.userModified$.next(message.user); break;
                case 'reveal': this.revealVotes$.next(); break;
                case 'reset': this.resetRound$.next(); break;
            }
        });
    }

    /**
     * Send a message to the server.
     * 
     * @param message - The message that will be sent to the server.
     */
    public send(message: unknown): void 
    {
        if (this.socket?.readyState !== WebSocket.OPEN) return;

        this.socket.send(JSON.stringify(message));
    }

    /**
     * Disconnects from the socket.
     */
    public disconnect(code?: number, reason?: string): void
    {
        this.socket?.close(code, reason);
        this.socket = null;
        clearInterval(this.pingId);
        this.connected.set(false);

        window.removeEventListener('beforeunload',this.serviceUnloaded.bind(this));
    }

    /**
     * Service unloaded, disconnect the socket.
     */
    public serviceUnloaded(): void
    {
        this.disconnect(1000, 'Page unloaded');
    }
    
    /**
     * The server (therefore, the page) was destroyed, disconnect the socket.
     */
    public ngOnDestroy(): void 
    {
        this.serviceUnloaded();
    }
}
