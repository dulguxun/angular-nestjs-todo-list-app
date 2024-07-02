import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TodoFormService } from './todo-form.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-todo-form',
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.css'],
})
export class TodoFormComponent implements OnInit {
  form!: FormGroup;
  selectedTaskId: number | null = null;
  showToast: boolean = false;
  toastMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private todoFormService: TodoFormService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      title: ['', Validators.required],
      description: [''],
    });

    this.route.paramMap.subscribe(params => {
      const taskId = params.get('id');
      if (taskId) {
        this.selectedTaskId = +taskId;
        // Optionally, fetch the task details using the taskId to pre-fill the form
        this.fetchTaskDetails(this.selectedTaskId);
      }
    });
  }

  fetchTaskDetails(id: number): void {
    const token = localStorage.getItem('token');
    this.todoFormService.fetchTasks(token).subscribe(
      response => {
        const task = response.tasks.find((task: any) => task.id === id);
        if (task) {
          this.form.get('title')?.setValue(task.title);
          this.form.get('description')?.setValue(task.description);
        }
      },
      error => {
        console.error('Error fetching task details:', error);
      }
    );
  }

  submitTodo(): void {
    const title = this.form.get('title')?.value;
    const description = this.form.get('description')?.value;
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return; // Or handle this case as needed
    }
  
    if (this.selectedTaskId !== null) {
      // Update task
      this.todoFormService.updateTask(this.selectedTaskId, title, description, token).subscribe(
        () => {
          this.showToastMessage('Task updated successfully');
          this.router.navigate(['/todo']);
        },
        error => {
          console.error('Error updating task:', error);
        }
      );
    } else {
      // Add task
      this.todoFormService.addTask(title, description, token).subscribe(
        () => {
          this.showToastMessage('Task added successfully');
          this.router.navigate(['/todo']);
        },
        error => {
          console.error('Error adding task:', error);
        }
      );
    }
  }
  

  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000); // Hide toast after 3 seconds
  }
}
