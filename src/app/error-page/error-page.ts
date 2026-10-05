import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-error-page',
  styleUrl: './error-page.css',
  templateUrl: './error-page.html',
})
export class ErrorPage 
{
  private router = inject(Router);
  
  public errorCode = this.router.currentNavigation()?.extras.state?.['errorCode'] ?? 404;
  public errorMsg = this.router.currentNavigation()?.extras.state?.['errorMsg'] ?? 'Page Not Found';
}
