import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TodoService } from './todo.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';

interface Task {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  favoriteTask: boolean;
  description: string;
  user: { id: number; username: string };
  originalPosition: number; // Add this field
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
  totalItems = 0;
  pageSize = 6;
  currentPage = 0;
  dateFormat: string = 'yyyy LLL dd, HH:mm ';
  totalPages: number = 0;
  pagesArray: number[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private todoService: TodoService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      title: ''
    });

    // Subscribe to query parameters and perform the search based on them
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['title'] || '';
      this.currentPage = +params['page'] - 1 || 0;
      
      if (params['title'] || params['page']) {
        // Perform search if there are query parameters
        this.searchTasks();
      } else {
        // Fetch all tasks if no query parameters
        this.fetchTasks(this.currentPage + 1, this.pageSize);
      }
    });
    this.form.get('title')?.valueChanges
    .pipe(debounceTime(400)) // Debounce for 400 milliseconds
    .subscribe(() => {
      this.searchTerm = this.form.get('title')?.value || ''; // Update searchTerm
      this.currentPage = 0; // Reset to first page on new search
      this.searchTasks(); // Perform the search
    });

    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.pagesArray = Array(this.totalPages).fill(0).map((x, i) => i);
  }

  fetchTasks(page: number, pageSize: number): void {
    const token = localStorage.getItem('token');
    this.todoService.fetchTasks(token, page, pageSize).subscribe(
      (res: any) => {
        this.tasks = res.tasks;
        this.totalItems = res.total;
        this.updatePagination();
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
        this.updatePagination();

        this.router.navigate([], {
          queryParams: {
            title: this.searchTerm,
            page: this.currentPage + 1, //always reset to first page on new search
          },
        });

      },
      (error: any) => {
        console.error('Error searching tasks:', error);
      }
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.router.navigate([], {
      queryParams: {
        title: null,
        page: 1, // Reset to the first page
      },
      queryParamsHandling: 'merge', // keeps any existing query parameters
    }).then(() => {
      this.fetchTasks(1, this.pageSize);
    });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) {
      return;
    }
    this.currentPage = page;

    if (this.searchTerm) {
      // If there is a search term, update URL with both search term and pagination
      this.router.navigate([], {
        queryParams: {
          title: this.searchTerm,
          page: this.currentPage + 1, // currentPage is zero-based, but query param expects 1-based index
        },
        queryParamsHandling: 'merge', // keeps any existing query parameters
      }).then(() => {
        // Perform the search after the URL is updated
        this.searchTasks();
      });
    } else {
      // If there is no search term, update URL with only pagination
      this.router.navigate([], {
        queryParams: {
          page: this.currentPage + 1, // currentPage is zero-based, but query param expects 1-based index
        },
        queryParamsHandling: 'merge', // keeps any existing query parameters
      }).then(() => {
        // Fetch tasks for the new page
        this.fetchTasks(this.currentPage + 1, this.pageSize);
      });
    }
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

  navigateToTaskDetail(taskId: number): void {
    this.router.navigate(['/details', taskId]); // Assuming '/details/:id' is your detail route
    console.log('Task ID:', taskId);
  }

  toggleFavorite(task: Task): void {
    const token = localStorage.getItem('token');
    this.todoService.favoriteTask(task.id, token).subscribe(
      (res: any) => {
        task.favoriteTask = !task.favoriteTask;
        this.openSnackBar('Task updated successfully');
        
        // Update task list to reflect the new order
        if (task.favoriteTask) {
          this.tasks = [task, ...this.tasks.filter(t => t.id !== task.id)];
        } else {
          this.tasks = this.tasks.filter(t => t.id !== task.id);
          this.fetchTasks(this.currentPage + 1, this.pageSize); // Fetch tasks to update the order
        }
      },
      (error: any) => {
        console.error('Error updating task:', error);
      }
    );
  }
  
  

  toggleDateFormat(): void {
    // Toggle between 12-hour and 24-hour format
    this.dateFormat = this.dateFormat.includes('HH') ? 'yyyy LLL dd, hh:mm a' : 'yyyy LLL dd, HH:mm';
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }
}
