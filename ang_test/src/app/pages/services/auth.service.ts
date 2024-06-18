// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<boolean>(false);
  authState$ = this.authState.asObservable();

  private userState = new BehaviorSubject<any>(null);
  userState$ = this.userState.asObservable();

  setAuthState(isAuthenticated: boolean) {
    this.authState.next(isAuthenticated);
  }

  setUserState(user: any) {
    this.userState.next(user);
  }

  getUserState() {
    return this.userState.value;
  }
}
