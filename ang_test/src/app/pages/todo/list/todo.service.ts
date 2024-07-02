import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { end } from '@popperjs/core';

export interface SearchFilter {
  searchTerm: string;
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
}


@Injectable({
  providedIn: 'root',
})
export class TodoService {
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

  searchTasks(
    token: string | null,
    filter: SearchFilter,
    page: number = 1,
    limit: number = 6
  ): Observable<any> {
   

    let params = new HttpParams()

    if (filter.searchTerm) {
      params = params.set('search', filter.searchTerm);
    }

    if(page.toString) (
      params = params.set('page', page.toString())
    )

    if (filter.startDate) {
      params = params.set('startDate', filter.startDate);
    }

    if (filter.endDate) {
      params = params.set('endDate', filter.endDate);
    }

    return this.http.get(`${this.apiUrl}/search`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      }),
      params: params,
    });
  }

  addTask(title: string, token: string | null): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/add`,
      { title },
      {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      }
    );
  }

  updateTask(id: number, title: string, token: string | null): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/update/${id}`, // Assuming '/update/:id' is your update route
      { title, },
      {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      }
    );
  }

  deleteTask(id: number, token: string | null): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/delete`,
      { id },
      {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      }
    );
  }

  favoriteTask(id: number, token: string | null): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/favorite`,
      { id },
      {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      }
    );
  }

  getTaskById(id: number, token: string | null): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log('Requesting task ID:', id, 'with headers:', headers);
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers });
  }
}
