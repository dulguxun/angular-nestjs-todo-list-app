import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TodoService, SearchFilter } from './todo.service';
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
  originalPosition: number;
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
  currentPage = 0; // Initialize currentPage to 0
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
      title: '',
      startDate: '',
      endDate: ''
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log(params);
      this.searchTerm = params['title'] || '';
      this.startDate = params['startDate'] || '';
      this.endDate = params['endDate'] || '';
      this.currentPage = +params['page'] - 1 || 0; // Set currentPage from queryParams

      // this.form.get('title')?.setValue(this.searchTerm);
      // this.form.get('startDate')?.setValue(this.startDate);
      // this.form.get('endDate')?.setValue(this.endDate);

      if (params['title'] || params['startDate'] || params['endDate'] || params['page']) {
        this.searchTasks();
      } else {
        this.fetchTasks(this.currentPage + 1, this.pageSize); // Fetch tasks with currentPage
      }
    });

    this.form.get('title')?.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.searchTerm = this.form.get('title')?.value || '';
      this.searchTasks();
    });

    this.form.get('startDate')?.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.startDate = this.form.get('startDate')?.value || '';
      this.searchTasks();
    });

    this.form.get('endDate')?.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.endDate = this.form.get('endDate')?.value || '';
      this.searchTasks();
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.pagesArray = Array(this.totalPages).fill(0).map((x, i) => i);
  }

  fetchTasks(page: number, pageSize: number): void {
    console.log('Fetching tasks for page:', page);
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
      page: this.currentPage + 1, // Use currentPage + 1 in the filter
      limit: this.pageSize,
    };

    this.todoService.searchTasks(token, filter).subscribe(
      
      (response: { tasks: Task[], total: number }) => {
        console.log(response);
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
        startDate: null,
        endDate: null,
        page: 1,
      },
      queryParamsHandling: 'merge',
    }).then(() => {
      this.currentPage = 0; // Reset currentPage to 0 when clearing search
      this.fetchTasks(1, this.pageSize); // Fetch tasks for the first page
    });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) {
      return;
    }
    this.currentPage = page;

    const queryParams: any = {
      page: this.currentPage + 1, // Adjust currentPage for navigation
    };

    if (this.searchTerm) {
      queryParams['title'] = this.searchTerm;
    }

    if (this.startDate) {
      queryParams['startDate'] = this.startDate;
    }

    if (this.endDate) {
      queryParams['endDate'] = this.endDate;
    }

    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
    }).then(() => {
      if (this.searchTerm || this.startDate || this.endDate) {
        this.searchTasks();
      } else {
        this.fetchTasks(this.currentPage + 1, this.pageSize); // Fetch tasks for currentPage
      }
    });
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

  private showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
}
