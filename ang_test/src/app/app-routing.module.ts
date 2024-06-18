import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'user', loadChildren: () => import('./pages/user/user.module').then(m => m.UserModule)},
  // from example   {path: '**', component:ProductListComponent, pathMatch:'full', canActivate: [AuthGuard]}
  {path: 'todo', loadChildren: () => import('./pages/todo/todo.module').then(m => m.TodoModule), canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes),],
  exports: [RouterModule]
})
export class AppRoutingModule {
}