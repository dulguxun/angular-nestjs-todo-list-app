import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TodoService } from './todo.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { start } from '@popperjs/core';

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

interface SearchFilter {
  searchTerm: string;
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
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
  startDate: string = '';
  endDate: string = '';

  totalItems = 0;
  pageSize = 6;
  currentPage = 0;
  dateFormat: string = 'yyyy LLL dd, HH:mm ';
  totalPages: number = 0;
  pagesArray: number[] = [];
  showToast: boolean = false;
  toastMessage: string = '';
  
  constructor(
    private formBuilder: FormBuilder,
    private todoService: TodoService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.formBuilder.group({
      startDate: [''],  // Initialize form controls
      endDate: ['']
    });
  }
  
  ngOnInit(): void {
    // this.searchTasks();
    this.form = this.formBuilder.group({
      title: '',   
      startDate: '',  // Initialize form controls
      endDate: ''   
    });
    
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['title'] || '';
      this.startDate = params['startDate'] || '';
      this.endDate = params['endDate'] || '';
      this.currentPage = +params['page'] - 1 || 0;
      
      if (params['title'] || params['page']
      ) {
        this.searchTasks();
      } else {
        this.fetchTasks(this.currentPage + 1, this.pageSize);
      }
    });
    
    this.form.get('title')?.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.searchTerm = this.form.get('title')?.value || '';
      this.currentPage = 0;
      this.searchTasks();
    });
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
    const filter: SearchFilter = {
      searchTerm: this.searchTerm,
      startDate: this.startDate,
      endDate: this.endDate,
      page: this.currentPage + 1,
      limit: this.pageSize,
    };
    
    console.log('Controller in search tasks:', filter);
    
    this.todoService.searchTasks(token, filter.searchTerm).subscribe(
      (response: { tasks: Task[], total: number }) => {
        this.tasks = response.tasks;
        this.totalItems = response.total;
        this.updatePagination();
        
        const queryParams = {
          title: filter.searchTerm,
          startDate: filter.startDate,
          endDate: filter.endDate,
          page: filter.page,
          limit: filter.limit,
        };
  
        this.router.navigate([], {
          queryParams,
          queryParamsHandling: 'merge',
        });
      },
      (error: any) => {
        console.error('Error searching tasks:', error);
      }
    );
  }  
  clearSearch(): void {
    this.searchTerm = '';
    this.startDate = '';
    this.endDate = '';
    this.router.navigate([], {
      queryParams: {
        title: null,
        page: 1,
      },
      queryParamsHandling: 'merge',
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
      this.router.navigate([], {
        queryParams: {
          title: this.searchTerm,
         
          page: this.currentPage + 1,
        },
        queryParamsHandling: 'merge',
      }).then(() => {
        this.searchTasks();
      });
    } else {
      this.router.navigate([], {
        queryParams: {
          page: this.currentPage + 1,
        },
        queryParamsHandling: 'merge',
      }).then(() => {
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
          this.fetchTasks(this.currentPage + 1, this.pageSize);
          this.showToastMessage('Task updated successfully');
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
          this.showToastMessage('Task added successfully');
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
        this.showToastMessage('Task deleted successfully');
      },
      (error: any) => {
        console.error('Error deleting task:', error);
      }
    );
  }

  navigateToEditTask(task: Task): void {
    this.selectedTask = task;
    this.router.navigate(['/todo/edit', task.id]);
  }

  navigateToTaskDetail(taskId: number): void {
    this.router.navigate(['/details', taskId]);
    console.log('Task ID:', taskId);
  }

  toggleFavorite(task: Task): void {
    const token = localStorage.getItem('token');
    this.todoService.favoriteTask(task.id, token).subscribe(
      (res: any) => {
        task.favoriteTask = !task.favoriteTask;
        this.showToastMessage('Task updated successfully');

        if (task.favoriteTask) {
          this.tasks = [task, ...this.tasks.filter(t => t.id !== task.id)];
        } else {
          this.tasks = this.tasks.filter(t => t.id !== task.id);
          this.fetchTasks(this.currentPage + 1, this.pageSize);
          this.updatePagination();
        }
      },
      (error: any) => {
        console.error('Error updating task:', error);
      }
    );
  }

  toggleDateFormat(): void {
    this.dateFormat = this.dateFormat.includes('HH') ? 'yyyy LLL dd, hh:mm a' : 'yyyy LLL dd, HH:mm';
  }

  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
