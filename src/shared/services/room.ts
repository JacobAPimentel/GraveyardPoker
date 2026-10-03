import { Service, signal, WritableSignal } from '@angular/core';

type User = {
    name: string,
    vote: number | null
}

@Service()
export class Room 
{
    public users: Record<string,WritableSignal<User>> = {
        'Jacob': signal({name: 'Jacob', vote: null}),
        'Frank': signal({name: 'Frank', vote: 1}),
        'Todd': signal({name: 'Todd', vote: 13})
    };

    public choices = signal([1, 2, 3, 5, 8, 13]);
}
