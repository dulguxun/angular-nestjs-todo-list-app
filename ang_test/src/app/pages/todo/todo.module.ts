import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TodoComponent } from './todo.component';
import { TodoRoutingModule } from './todo-routing.module';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [TodoComponent],
  imports: [CommonModule,ReactiveFormsModule,TodoRoutingModule, MatPaginatorModule
  ],
  providers: [
  ],
})
export class TodoModule {}
