import { Service, signal } from '@angular/core';

@Service()
export class Settings 
{
    public displayName = signal<string>(localStorage.getItem('displayName') ?? '');
}
