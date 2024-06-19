import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TodoService } from './todo.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

interface Task {
  id: number;
  title: string;
  user: { id: number; username: string };
}

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {
  form!: FormGroup;
  searchForm!: FormGroup;
  tasks: Task[] = [];
  name: string | null = null;
  selectedTask: Task | null = null;
  totalTasks: number = 0;
  pageSize: number = 5;
  currentPage: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private formBuilder: FormBuilder,
    private todoService: TodoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      title: '',
    });

    this.searchForm = this.formBuilder.group({
      search: '',
    });

    this.fetchTasks();
  }

  fetchTasks(pageIndex: number = 0, pageSize: number = 10): void {
    const token = localStorage.getItem('token');
    this.todoService.fetchTasks(token, pageIndex + 1, pageSize).subscribe(
      (response: { tasks: Task[], total: number }) => {
        this.tasks = response.tasks;
        this.totalTasks = response.total;
        this.paginator.pageIndex = pageIndex;
      },
      (error: any) => {
        console.error("Error fetching tasks:", error);
      }
    );
  }

  submitTodo(): void {
    const title = this.form.get('title')?.value;
    const token = localStorage.getItem('token');

    if (this.selectedTask) {
      // Update task
      this.todoService.updateTask(this.selectedTask.id, title, token).subscribe(
        (res: any) => {
          console.log("Task update successful:", res);
          this.selectedTask = null;
          this.form.get('title')?.setValue('');
          this.fetchTasks(this.currentPage, this.pageSize);
        },
        (error: any) => {
          console.error("Error updating task:", error);
        }
      );
    } else {
      this.todoService.addTask(title, token).subscribe(
        (res: any) => {
          console.log("Task addition successful:", res);
          this.form.get('title')?.setValue('');
          this.fetchTasks(this.currentPage, this.pageSize);
        },
        (error: any) => {
          console.error("Error adding task:", error);
        }
      );
    }
  }

  deleteTask(id: number): void {
    const token = localStorage.getItem('token');
    this.todoService.deleteTask(id, token).subscribe(
      (res: any) => {
        console.log("Task deletion successful:", res);
        this.fetchTasks(this.currentPage, this.pageSize);
      },
      (error: any) => {
        console.error("Error deleting task:", error);
      }
    );
  }

  selectTask(task: Task): void {
    this.selectedTask = task;
    this.form.get('title')?.setValue(task.title);
  }

  searchTasks(): void {
    const query = this.searchForm.get('search')?.value;
    const token = localStorage.getItem('token');

    this.todoService.searchTasks(query, token).subscribe(
      (tasks: Task[]) => {
        this.tasks = tasks;
      },
      (error: any) => {
        console.error("Error searching tasks:", error);
      }
    );
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchTasks(this.currentPage, this.pageSize);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
