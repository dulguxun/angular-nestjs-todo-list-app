// login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: '',
      password: ''
    });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.userService.login(this.form.value).subscribe(
      (res: any) => {
        console.log('login res', res);
        localStorage.setItem("token", res.accessToken);
        localStorage.setItem("loggedUser", JSON.stringify(res.payload));
        this.router.navigate(['/']);
      },
      (error) => {
        console.error('Login failed', error);
        // Handle login error here
      }
    );
  }
}
