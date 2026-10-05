import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Message, ServerState, User } from '../types';
import { SpiderWebsocket } from './spider-websocket';

@Injectable()
export class Room 
{
    public socket = inject(SpiderWebsocket);

    public userId = signal<string>(''); // the id of the user.
    public host = signal<string>('');
    public revealed = signal<boolean>(false);

    // We can also have a proper User class with each signal as their own field,
    // which would be easier to modify a singel field rather than the entire User type.
    // Bit of an overkill for this small project, but writing it down as an alternative
    public users: Record<string,WritableSignal<User>> = {};
    public userSignalList = signal<WritableSignal<User>[]>([]);

    public choices = [1, 2, 3, 5, 8, 13, 21];

    /**
     * @returns 
     * Get the current user's state. May return nil if not yet loaded.
     */
    public getUserState = computed(() => this.users[this.userId()]?.());

    /**
     * Is the user a host?
     * 
     * @returns - True if the user is the host.
     */
    public isHost = computed(() => this.host() === this.userId());

    /**
     * Set up websocket listeners.
     */
    public constructor()
    {
        this.socket.initialJoin$.subscribe(this.onInitialJoin.bind(this));
        this.socket.userConnected$.subscribe(this.addUser.bind(this));
        this.socket.userDisconnected$.subscribe(this.removeUser.bind(this));
        this.socket.userModified$.subscribe(this.updateUser.bind(this));
        this.socket.revealVotes$.subscribe(this.revealVotes.bind(this));
        this.socket.resetRound$.subscribe(this.resetRound.bind(this));
    }

    /**
     * Sets the user id.
     * 
     * @param id - The id of the user.
     */
    public setUserId(id: string): void
    {
        this.userId.set(id);
    }

    /**
     * Assign all the signals associated with the state.
     * 
     * @param state - The Server State
     */
    public setState(state: ServerState): void
    {
        for (const user of Object.values(state.users)) 
        {
            this.addUser(user);
        }

        this.revealed.set(state.revealed);
        this.host.set(state.hostId);
    }

    /**
     * On initial join, set up the state and user's id.
     * 
     * @param userId - The id of the user.
     * @param state - The current server's state.
     */
    public onInitialJoin(joinState: {userId: string, state: ServerState}): void
    {
        this.setUserId(joinState.userId);
        this.setState(joinState.state);
    }
    
    /**
     * Add a user to the room.
     * 
     * @param user - The user who joined.
     */
    public addUser(user: User): void
    {
        this.users[user.id] = signal(user);

        //Update the array list.
        this.userSignalList.update((val: WritableSignal<User>[]) => 
        {
            const list = [...val];
            list.push(this.users[user.id]);
            list.sort((a: WritableSignal<User>,b: WritableSignal<User>) => 
            {
                return a().name.localeCompare(b().name);
            });
            return list;
        });
    }

    /**
     * Remove a user from the room.
     * 
     * @param id - The id of the user who left.
     */
    public removeUser(id: string): void
    {
        this.userSignalList.update((val: WritableSignal<User>[]) => 
        {
            const list = [...val];
            const index = list.indexOf(this.users[id]);
            if(index > -1) list.splice(index,1);
            return list;
        });
        delete this.users[id];
    }

    /**
     * Something changed with a user. Update their entire state.
     * 
     * @param user - The user new state
     */
    public updateUser(user: User): void
    {
        this.users[user.id].set(user);
    }

    /**
     * Send a message to the web socket server.
     * 
     * @param userId - The user idea that performed the action. Will fiter out any output made by another user.
     *                 This is used for actions that can be repeated by the first caller and then listeners afterwards, without causing a chain reaction.
     * @param message - The message that will be sent to the server.
     */
    public sendToSocket(userId: string | void, message: Message): void 
    {
        if(userId !== this.userId()) return;
        this.socket.send(message);
    }

    /**
     * A user has voted.
     * 
     * @param userId - The user who voted.
     * @param vote - The vote index
     */
    public voted(userId: string, vote: number): void
    {
        this.users[userId].update((val: User) => 
        {
             return {
                ...val,
                vote
            };
        });

        this.sendToSocket(userId,{
            type: 'voted',
            vote
        });
    }

    /**
     * Reveal the votes.
     */
    public revealVotes(userId: string | void): void
    {
        this.revealed.set(true);

        this.sendToSocket(userId,{
            type: 'reveal'
        });
    }

     /**
     * Reset the round. Will rely soley on the server response to do a full reset.
     */
    public resetRound(userId: string | void): void
    {
        this.revealed.set(false);

        for (const user of Object.values(this.users)) 
        {
            user.update((val: User) => 
            {
                return {
                    ...val,
                    vote: null
                };
            });
        }

        this.sendToSocket(userId,{
            type: 'reset'
        });
    }
}
