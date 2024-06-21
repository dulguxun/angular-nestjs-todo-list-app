import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TodoComponent } from './todo.component';
import { TodoRoutingModule } from './todo-routing.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatCardModule} from '@angular/material/card'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TodoFormModule } from '../form/todo-form.module';

import { CustomDatePipe } from '../../datepipe/custom-date.pipe';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    TodoComponent, 
    CustomDatePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TodoRoutingModule, 
    MatPaginatorModule, 
    MatSnackBarModule,  
    MatCardModule, 
    MatFormFieldModule,
    MatInputModule, 
    FormsModule,
    TodoFormModule,
    MatIconModule
    
  ],
  providers: [
  ],
})
export class TodoModule {}
