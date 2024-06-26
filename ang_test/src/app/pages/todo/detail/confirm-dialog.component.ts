import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h1 mat-dialog-title>Confirm Delete</h1>
    <div mat-dialog-content>
      <p>Are you sure you want to delete this task?</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>No</button>
      <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Yes</button>
    </div>
  `,
   styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {}
}
