import { inject, Injectable, signal } from '@angular/core';
import { Settings } from './settings';
import { ServerState, User } from '../types';
import { Subject } from 'rxjs';

@Injectable()
export class SpiderWebsocket 
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

    public initialJoin$ = new Subject<{userId: string, state: ServerState}>();
    public userConnected$ = new Subject<User>();
    public userDisconnected$ = new Subject<string>();
    public userModified$ = new Subject<User>();
    public revealVotes$ = new Subject<void>();
    public resetRound$ = new Subject<void>();

    /**
     * Connect to the room and bind event listeners.
     * 
     * @param roomId - The room that the user is attempting to join.
     */
    public connect(roomId: string): void 
    {
        this.socket = new WebSocket(`ws://localhost:8787/room/${roomId}?name=${this.settings.displayName()}`);

        this.socket.addEventListener('open', () => 
        {
            console.log('Connected to room');
        });

        this.socket.addEventListener('close', () => 
        {
            console.log('Disconnected from room');

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
    public disconnect(): void
    {
        this.socket?.close();
        this.socket = null;
        this.connected.set(false);
    }
}
