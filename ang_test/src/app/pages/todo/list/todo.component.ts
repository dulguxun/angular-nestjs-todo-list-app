import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TodoService } from './todo.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { CustomDatePipe } from '../../datepipe/custom-date.pipe';

interface Task {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  favoriteTask: boolean;
  user: { id: number; username: string };
}

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
})
export class TodoComponent implements OnInit {
  form!: FormGroup;
  tasks: Task[] = [];
  selectedTask: Task | null = null;
  searchTerm: string = '';
  // favorite: boolean = false;
  // paginator
  totalItems = 0;
  pageSize = 5;
  currentPage = 0;

  constructor(
    private formBuilder: FormBuilder,
    private todoService: TodoService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      title: '',
    });

    this.fetchTasks(this.currentPage + 1, this.pageSize); // Adjust for zero-based index
  }

  // fetchTasks(page: number, pageSize: number): void {
  //   const token = localStorage.getItem('token');
  //   this.todoService.fetchTasks(token, page, pageSize).subscribe(
  //     (response: { tasks: Task[], total: number }) => {
  //       this.tasks = response.tasks;
  //       this.totalItems = response.total;
  //     },
  //     (error: any) => {
  //       console.error('Error fetching tasks:', error);
  //     }
  //   );
  // }
  fetchTasks(page: number, pageSize: number): void {
    const token = localStorage.getItem('token');
    this.todoService.fetchTasks(token, page, this.pageSize).subscribe(
      (res: any) => {
        this.tasks = res.tasks;
        this.totalItems = res.total;
      },
      (error: any) => {
        console.error('Error fetching tasks:', error);
      }
    );
  }
  

  searchTasks(): void {
    const token = localStorage.getItem('token');
    this.todoService.searchTasks(token, this.searchTerm, this.currentPage + 1, this.pageSize).subscribe(
      (response: { tasks: Task[], total: number }) => {
        this.tasks = response.tasks;
        this.totalItems = response.total;
      },
      (error: any) => {
        console.error('Error searching tasks:', error);
      }
    );
  }

  submitTodo(): void {
    const title = this.form.get('title')?.value;
    const token = localStorage.getItem('token');

    if (this.selectedTask) {
      this.todoService.updateTask(this.selectedTask.id, title, token).subscribe(
        (res: any) => {
          this.selectedTask = null;
          this.form.get('title')?.setValue('');
          this.fetchTasks(this.currentPage + 1, this.pageSize); // Adjust for zero-based index
          this.openSnackBar('Task updated successfully');
        },
        (error: any) => {
          console.error('Error updating task:', error);
        }
      );
    } else {
      this.todoService.addTask(title, token).subscribe(
        (res: any) => {
          this.form.get('title')?.setValue('');
          this.fetchTasks(this.currentPage + 1, this.pageSize); 
          this.openSnackBar('Task added successfully');
        },
        (error: any) => {
          console.error('Error adding task:', error);
        }
      );
    }
  }

  deleteTask(id: number): void {
    const token = localStorage.getItem('token');
    this.todoService.deleteTask(id, token).subscribe(
      (res: any) => {
        this.fetchTasks(this.currentPage + 1, this.pageSize); 
        this.openSnackBar('Task deleted successfully');
      },
      (error: any) => {
        console.error('Error deleting task:', error);
      }
    );
  }

  navigateToEditTask(task: Task): void {
    this.selectedTask = task;
    this.router.navigate(['/todo/edit', task.id]); // Assuming '/todo/edit/:id' is your edit route
  }

  toggleFavorite(task: Task): void {
    const token = localStorage.getItem('token');
    this.todoService.favoriteTask(task.id, token).subscribe(
      (res: any) => {
        task.favoriteTask = !task.favoriteTask;
        this.openSnackBar('Task updated successfully');
        this.fetchTasks(this.currentPage + 1, this.pageSize); // Fetch tasks to update the order
      },
      (error: any) => {
        console.error('Error updating task:', error);
      }
    );
  }
  
  

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchTasks(this.currentPage + 1, this.pageSize); // Adjust for zero-based index
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }
}
