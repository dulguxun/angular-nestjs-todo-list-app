import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TodoFormService {
  private apiUrl = 'http://localhost:3000/task';

  constructor(private http: HttpClient) {}

  fetchTasks(token: string | null, page: number = 1, limit: number = 1000): Observable<any> {
    return this.http.get(this.apiUrl, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      }),
      params: {
        page: page.toString(),
        limit: limit.toString(),
      },
    });
  }

  addTask(title: string, description: string, token: string | null): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/add`,
      { title, description },
      {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      }
    );
  }

  updateTask(id: number, title: string, description: string, token: string | null): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/update`,
      { id, title, description },
      {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      }
    );
  }
}
