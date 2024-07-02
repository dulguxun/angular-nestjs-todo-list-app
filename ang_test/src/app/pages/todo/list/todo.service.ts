import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { end } from '@popperjs/core';


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
    searchTerm: string,
    startDate: string | null = null,
    endDate: string | null = null,
    page: number = 1,
    limit: number = 6
  ): Observable<any> {
    console.log('service-n searchtasks:', {
      search: searchTerm,
      startDate: startDate,
      endDate: endDate,
      page: page.toString(),
      limit: limit.toString(),
    });

    let params = new HttpParams()

    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    if(page.toString) (
      params = params.set('page', page.toString())
    )

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
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
