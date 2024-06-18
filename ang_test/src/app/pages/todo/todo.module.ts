import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TodoComponent } from './todo.component';
import { TodoRoutingModule } from './todo-routing.module';
import { PaginationComponent } from '../../pagination/pagination.component';

@NgModule({
  declarations: [TodoComponent, PaginationComponent],
  imports: [CommonModule,ReactiveFormsModule,TodoRoutingModule
  ],
  providers: [
  ],
})
export class TodoModule {}
