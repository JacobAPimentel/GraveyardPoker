import { Service, signal, WritableSignal } from '@angular/core';
import { ServerState, User } from '../types';

@Service()
export class Room 
{
    public userId = signal<string>(''); // the id of the user.
    public host = signal<string>('');
    public revealed = signal<boolean>(false);

    // We can also have a proper User class with each signal as their own field,
    // which would be easier to modify a singel field rather than the entire User type.
    // Bit of an overkill for this small project, but writing it down as an alternative
    public users: Record<string,WritableSignal<User>> = {};
    public userSignalList = signal<WritableSignal<User>[]>([]);

    public choices = signal([1, 2, 3, 5, 8, 13]);

    /**
     * Reset the service back to default;
     */
    public flushService(): void
    {
        this.userId.set('');
        this.host.set('');
        this.revealed.set(false);

        this.userSignalList.set([]);
        this.users = {};
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
}
