// src/app/pages/nav/nav.component.ts
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
    this.authService.authState$.subscribe(
      (auth: boolean) => {
        this.authenticated = auth;
        if (auth) {
          this.loggedUser = this.authService.getUserState();
        }
      }
    );
  }

  logout(): void {
    localStorage.removeItem('loggedUser');
    localStorage.removeItem('token');
    this.authService.setAuthState(false);
    this.authService.setUserState(null);
    this.router.navigate(['/']);
  }
}



// import { Component, OnInit } from '@angular/core';
// import { Emitters } from '../emitters/emitters';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router'; 

// @Component({
//   selector: 'app-nav',
//   templateUrl: './nav.component.html',
//   styleUrls: ['./nav.component.css']
// })
// export class NavComponent implements OnInit {
//   authenticated = false;

//   constructor(private http: HttpClient, private router: Router) {} // Inject Router

//   ngOnInit(): void {
//     Emitters.authEmitter.subscribe(
//       (auth: boolean) => {
//         this.authenticated = auth;
//       }
//     );
//   }

//   logout(): void {
//     localStorage.removeItem('loggedUser');
//     this.authenticated = false;
//     this.router.navigate(['/']);
//   }
// }
