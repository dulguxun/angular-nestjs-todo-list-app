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
  showToast: boolean = false;
  toastMessage: string = '';

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
      // width: '350px'
    }); // Open the dialog

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const token = localStorage.getItem('token');
        this.todoService.deleteTask(id, token).subscribe(
          () => {
            this.showToastMessage('Task deleted successfully');
            this.router.navigate(['/todo']);
          },
          (error: any) => {
            console.error('Error deleting task:', error);
          }
        );
      }
    });
  }

  navigateToEditTask(task: Task): void {
    this.router.navigate(['/todo/edit', this.taskId]);
  }

  toggleDateFormat(): void {
    this.dateFormat = this.dateFormat.includes('HH') ? 'yyyy LLL dd, hh:mm a' : 'yyyy LLL dd, HH:mm';
  }

  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000); // Hide toast after 3 seconds
  }

}
