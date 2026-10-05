import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { PokerPage } from './poker-page/poker-page';
import { ErrorPage } from './error-page/error-page';

export const routes: Routes = [
    {path: '', title: 'Home - Graveyard Poker', component: HomePage},
    {path: 'room', title: 'Room - Graveyard Poker', component: PokerPage},
    { path: '**', title: 'Error - Graveyard Poker', component: ErrorPage }
];
