import { inject, Service } from '@angular/core';
import { Settings } from './settings';

@Service()
export class SpiderWebsocket 
{
    private settings = inject(Settings);
    
    private socket: WebSocket | null = null;

    /**
     * Connect to the room and bind event listeners.
     * 
     * @param roomId - The room that the user is attempting to join.
     */
    public connect(roomId: string): void 
    {
        this.socket = new WebSocket(
            `ws://localhost:8787/room/${roomId}?name=${this.settings.displayName()}`
        );

        this.socket.addEventListener('open', () => 
        {
            console.log('Connected to room');
        });

        this.socket.addEventListener('message', event => 
        {
            const message = JSON.parse(event.data);

            console.log('Server message:', message);
        });

        this.socket.addEventListener('close', () => 
        {
            console.log('Disconnected from room');
        });

        this.socket.addEventListener('error', error => 
        {
            console.error('WebSocket error:', error);
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
    }
}
