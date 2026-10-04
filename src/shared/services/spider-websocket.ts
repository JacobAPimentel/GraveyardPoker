import { inject, Service } from '@angular/core';
import { Settings } from './settings';
import { Room } from './room';
import { ServerState, User } from '../types';

@Service()
export class SpiderWebsocket 
{
    private settings = inject(Settings);
    private room = inject(Room);
    
    private socket: WebSocket | null = null;

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
                case 'initialJoin': this.onInitialJoin(message.id,message.state); break;
                case 'connected': this.onConnect(message.user); break;
                case 'disconnected': this.onDisconnect(message.userId); break;
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

        this.room.flushService();
    }

    /**
     * On initial join, set up the state and user's id.
     * 
     * @param userId - The id of the user.
     * @param state - The current server's state.
     */
    public onInitialJoin(userId: string, state: ServerState): void
    {
        this.room.setUserId(userId);
        this.room.setState(state);
    }

     /**
     * A User has joined.
     * 
     * @param userId - The user who left.
     */
    public onConnect(user: User): void
    {
        this.room.addUser(user);
    }

    /**
     * User left.
     * 
     * @param userId - The user who left.
     */
    public onDisconnect(userId: string): void
    {
        this.room.removeUser(userId);
    }
}
