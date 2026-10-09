import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { Settings } from './settings';
import { CustomCodes, ServerState, User } from '../types';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

// How many attempts should the user take to try to reconnect?
const MAX_RECONNECT_ATTEMPTS = 1;

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
    
    private roomId?: string;
    private socket: WebSocket | null = null;

    //LISTENERS
    public forceDisconnect$ = new Subject<string>();
    public initialJoin$ = new Subject<{userId: string, state: ServerState}>();
    public userConnected$ = new Subject<User>();
    public userDisconnected$ = new Subject<string>();
    public userModified$ = new Subject<User>();
    public revealVotes$ = new Subject<void>();
    public resetRound$ = new Subject<void>();

    private pingId?: number;

    //Reconnection Status
    private disconnectReason: string | null = null;
    private reconnectAttempts = 0;

    /**
     * Connect to the room and bind event listeners.
     * 
     * @param roomId - The room that the user is attempting to join.
     */
    public connect(roomId: string): void 
    {
        const params = new URLSearchParams({
            name: this.settings.displayName(),
            accessId: this.settings.accessId()
        });

        this.socket = new WebSocket(`${environment.wsUrl}/room/${roomId}?${params}`);

        this.socket.addEventListener('open', () => 
        {
            this.log('Connected to room');
            this.disconnectReason = null;
            this.reconnectAttempts = 0;
            this.roomId = roomId;

            //Ping the server every 30 seconds to prevent autodisconnect
            this.pingId = setInterval(() =>  this.send({type: 'ping'}),30000);
            window.addEventListener('beforeunload',this.serviceUnloaded.bind(this));
        });

        this.socket.addEventListener('close', (closeEvent: CloseEvent) => 
        {
            this.log(`Disconnected ${closeEvent.wasClean ? 'cleanly' : 'abruptly'} (${closeEvent.code}): ${closeEvent.reason}`);

            // If it is still "connected", that means that a force connection occurred.
            // Or, if there is a disconnectReason, then we are trying to reconnect.
            if(this.connected() || this.disconnectReason)
            {
                if(!this.disconnectReason)
                {
                    this.disconnect();
                    this.disconnectReason = closeEvent.reason || 'Connection was lost.';
                }    

                // If it was clean, then it is an expected server event. No need to try to reconnect.
                if(closeEvent.wasClean || this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS)
                {
                    this.forceDisconnect$.next(this.disconnectReason);
                }
                else // Try to reconnect.
                {
                    this.log('Trying to reconnect...');
                    this.reconnectAttempts++;
                    this.connect(this.roomId!);
                }
            }
            else if(!this.roomId) // Not having a roomId means there was never a successful connect...
            {
               this.forceDisconnect$.next('Failed to connect. Please try again later.'); 
            }
        });

        this.socket.addEventListener('error', error => 
        {
            console.error('WebSocket error:', error);
        });

        // Main web socket messages
        this.socket.addEventListener('message', event => 
        {
            const message = JSON.parse(event.data);

            switch(message.type)
            {
                case 'initialJoin': this.initialJoin$.next(message);

                                    //Set the user ID if the user did not have one prior.
                                    if(!this.settings.accessId())
                                    {
                                        localStorage.setItem('accessId',message.accessId);
                                        this.settings.accessId.set(message.accessId);
                                    }

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
        this.connected.set(false);
        
        clearInterval(this.pingId);
        window.removeEventListener('beforeunload',this.serviceUnloaded.bind(this));
    }

    /**
     * Service unloaded, disconnect the socket.
     */
    public serviceUnloaded(): void
    {
        this.disconnect(CustomCodes.PAGE_UNLOADED, 'Page unloaded');
    }
    
    /**
     * The server (therefore, the page) was destroyed, disconnect the socket.
     */
    public ngOnDestroy(): void 
    {
        this.serviceUnloaded();
    }

    /**
     * Log a message with a timestamp.
     * 
     * @param message - The message you want to be outpatted
     */
    public log(message: string): void
    {
        console.log(`[${new Date().toLocaleString()}] ${message}`);
    }
}
