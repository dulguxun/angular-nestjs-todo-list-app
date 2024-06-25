import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  authenticated = false;
  loggedUser: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authService.authState$.subscribe(
      (auth: boolean) => {
        this.authenticated = auth;
        if (auth) {
          this.loggedUser = this.authService.getUserState();
        }
      }
    );

    // Initialize the authentication state and user state from localStorage
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('loggedUser');

    if (token && user) {
      this.authService.setAuthState(true);
      this.authService.setUserState(JSON.parse(user));
    } else {
      this.authService.setAuthState(false);
      this.authService.setUserState(null);
    }
  }

  logout(): void {
    localStorage.removeItem('loggedUser');
    localStorage.removeItem('token');
    this.authService.setAuthState(false);
    this.authService.setUserState(null);
    this.router.navigate(['/']);
  }
}