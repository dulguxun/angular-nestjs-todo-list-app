import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

    login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>('http://localhost:3000/auth/login', credentials)
    }

    register(user: User): Observable<any> {
    return this.http.post<any>('http://localhost:3000/users/register', user)
    }

}

interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    // Add more properties as needed
}