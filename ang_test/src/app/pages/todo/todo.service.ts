import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Task {
  id: number;
  title: string;
  user: { id: number; username: string };
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  constructor(private http: HttpClient) {}

  fetchTasks(token: string | null, page: number, pageSize: number): Observable<{ tasks: Task[], total: number }> {
    return this.http.get<{ tasks: Task[], total: number }>('http://localhost:3000/task', {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      }),
      params: {
        page: page.toString(),
        pageSize: pageSize.toString()
      }
    });
  }

  // searchTasks(token: string | null, search: string): Observable<{ tasks: Task[], total: number }> {
  //   return this.http.get<{ tasks: Task[], total: number }>('http://localhost:3000/task/search', {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${token}`
  //     }),
  //     params: {
  //       search: search
  //     }
  //   });
  // }


  addTask(title: string, token: string | null): Observable<{ message: string; tasks: Task[] }> {
    return this.http.post<{ message: string; tasks: Task[] }>('http://localhost:3000/task/add', { title }, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    });
  }

  updateTask(id: number, title: string, token: string | null): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('http://localhost:3000/task/update', { id, title }, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    });
  }

  deleteTask(id: number, token: string | null): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('http://localhost:3000/task/delete', { id }, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    });
  }
  searchTasks(query: string, token: string | null): Observable<Task[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Task[]>(`http://localhost:3000/task/search?search=${query}`, { headers });
  }
}
