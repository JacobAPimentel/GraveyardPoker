import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-error-page',
  styleUrl: './error-page.css',
  templateUrl: './error-page.html',
})
export class ErrorPage 
{
  public errorCode = input(404);
  public errorMsg = input('Page Not Found');
}
