import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TodoService } from '../list/todo.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component'; // Import the dialog component

interface Task {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  user: { id: number; username: string };
}

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
  taskId!: number;
  task!: Task;
  dateFormat: string = 'yyyy LLL dd, HH:mm ';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private todoService: TodoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog // Inject MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.taskId = +params.get('id')!;
      this.fetchTaskDetails(this.taskId);
    });
  }

  fetchTaskDetails(id: number): void {
    const token = localStorage.getItem('token');
    this.todoService.getTaskById(id, token).subscribe(
      (task: Task) => {
        this.task = task;
      },
      (error: any) => {
        console.error('Error fetching task details:', error);
      }
    );
  }

  deleteTask(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px'
    }); // Open the dialog

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const token = localStorage.getItem('token');
        this.todoService.deleteTask(id, token).subscribe(
          () => {
            this.snackBar.open('Task deleted successfully', 'Close', {
              duration: 3000,
            });
            this.router.navigate(['/todo']);
          },
          (error: any) => {
            console.error('Error deleting task:', error);
          }
        );
      }
    });
  }

  toggleDateFormat(): void {
    this.dateFormat = this.dateFormat.includes('HH') ? 'yyyy LLL dd, hh:mm a' : 'yyyy LLL dd, HH:mm';
  }
}
