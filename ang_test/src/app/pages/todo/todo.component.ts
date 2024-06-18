import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TodoService } from './todo.service';

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
  tasks: Task[] = [];
  name: string | null = null;
  selectedTask: Task | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private todoService: TodoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      title: '',
    });

    // Fetch tasks when component initializes
    this.fetchTasks();
  }

  fetchTasks(): void {
    const token = localStorage.getItem('token');
    this.todoService.fetchTasks(token).subscribe(
      (tasks) => {
        this.tasks = tasks;
      },
      (error) => {
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
        (res) => {
          console.log("Task update successful:", res);
          this.selectedTask = null;
          this.form.get('title')?.setValue('');
          this.fetchTasks();
        },
        (error) => {
          console.error("Error updating task:", error);
        }
      );
    } else {
      this.todoService.addTask(title, token).subscribe(
        (res) => {
          console.log("Task addition successful:", res);
          this.form.get('title')?.setValue('');
          this.fetchTasks();
        },
        (error) => {
          console.error("Error adding task:", error);
        }
      );
    }
  }

  deleteTask(id: number): void {
    const token = localStorage.getItem('token');
    this.todoService.deleteTask(id, token).subscribe(
      (res) => {
        console.log("Task deletion successful:", res);
        this.fetchTasks();
      },
      (error) => {
        console.error("Error deleting task:", error);
      }
    );
  }

  selectTask(task: Task): void {
    this.selectedTask = task;
    this.form.get('title')?.setValue(task.title);
  }
}
