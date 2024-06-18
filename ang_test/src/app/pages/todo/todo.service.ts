import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'http://localhost:3000/task';

  constructor(private http: HttpClient) {}

  fetchTasks(token: string | null): Observable<any> {
    return this.http.get<any>(this.apiUrl, {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token
      })
    });
  }

  addTask(title: string, token: string | null): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, { title }, {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token
      })
    });
  }

  updateTask(id: number, title: string, token: string | null): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/update`, { id, title }, {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token
      })
    });
  }

  deleteTask(id: number, token: string | null): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/delete`, { id }, {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token
      })
    });
  }
}
