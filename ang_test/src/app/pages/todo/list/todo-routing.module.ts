import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TodoComponent } from './todo.component';

const routes: Routes = [
  { path: '', component: TodoComponent },
  { path: 'add', loadChildren: () => import('../form/todo-form.module').then(m => m.TodoFormModule) },
  { path: 'edit/:id', loadChildren: () => import('../form/todo-form.module').then(m => m.TodoFormModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TodoRoutingModule { }
