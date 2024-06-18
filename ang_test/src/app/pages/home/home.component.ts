// src/app/pages/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  message = '';
  loggedUser: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get('http://localhost:3000/users/profile', {
        headers: new HttpHeaders({
          'Authorization': 'Bearer ' + token
        })
      }).subscribe(
        (res: any) => {
          this.loggedUser = res.user;
          this.message = `Hi ${res.user.email}`;
          this.authService.setAuthState(true);
          this.authService.setUserState(this.loggedUser);
          localStorage.setItem('loggedUser', JSON.stringify(this.loggedUser));
        },
        err => {
          this.message = 'You are not logged in';
        }
      );
    }
  }

  goToProfile(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get('http://localhost:3000/task', {
        headers: new HttpHeaders({
          'Authorization': 'Bearer ' + token
        })
      }).subscribe(
        (res: any) => {
          console.log('Profile response:', res);
          this.message = res;
          this.router.navigate(['/todo']);
        },
        (error) => {
          console.error('Error while fetching profile:', error);
        }
      );
    }
  }
}



// // home.component.ts
// import { Component, OnInit } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-home',
//   templateUrl: './home.component.html',
//   styleUrls: ['./home.component.css']
// })
// export class HomeComponent implements OnInit {
//   message = '';
//   loggedUser: any;

//   constructor(
//     private http: HttpClient,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.loggedUser = JSON.parse(localStorage.getItem('loggedUser') || '{}');
//     const token = localStorage.getItem('token');
//     if (token) {
//       this.http.get('http://localhost:3000/users/profile', {
//         headers: new HttpHeaders({
//           'Authorization': 'Bearer ' + token
//         })
//       }).subscribe(
//         (res: any) => {
//           this.message = `Hi ${res.user.email}`;
//         },
//         err => {
//           this.message = 'You are not logged in';
//         }
//       );
//     }
//   }

//   goToProfile(): void {
//     const token = localStorage.getItem('token');
//     if (token) {
//       this.http.get('http://localhost:3000/task', {
//         headers: new HttpHeaders({
//           'Authorization': 'Bearer ' + token
//         })
//       }).subscribe(
//         (res: any) => {
//           console.log('Profile response:', res);
//           this.message = res;
//           this.router.navigate(['/todo']);
//         },
//         (error) => {
//           console.error('Error while fetching profile:', error);
//         }
//       );
//     }
//   }
// }
