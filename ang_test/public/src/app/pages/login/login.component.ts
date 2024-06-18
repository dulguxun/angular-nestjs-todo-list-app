import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

//signup and login object
  isSignDivVisiable: boolean  = true;

  //signup ugugdul hadgalah object
  signUpObj: SignUpModel  = new SignUpModel();
  //login ugugdul hadgalah object
  loginObj: LoginModel  = new LoginModel();

  //constructor router hoorond ajillah
  constructor(private router: Router){}

  //burtguuleh uyd ashiglagdah method
  onRegister() {
    debugger;
    //herev user baigaa bol json parse hiine, signUpObj d hadgalna.
    const localUser = localStorage.getItem('loginusers');
    if(localUser != null) {
      const users =  JSON.parse(localUser);
      users.push(this.signUpObj);
      localStorage.setItem('loginusers', JSON.stringify(users))
    } else {
      const users = [];
      users.push(this.signUpObj);
      localStorage.setItem('loginusers', JSON.stringify(users))
    }
    alert('Registration Success')
  }
  //login hiih uyd ashiglagdah method
  onLogin() {
    debugger;
    //localstoragees user jagshaalt avah
    const localUsers =  localStorage.getItem('loginusers');
    if(localUsers != null) {
      const users =  JSON.parse(localUsers);

      const isUserPresent =  users.find( (user:SignUpModel)=> user.email == this.loginObj.email && user.password == this.loginObj.password);
      if(isUserPresent != undefined) {
        alert("Hereglegch oldloo...");
        localStorage.setItem('loggedUser', JSON.stringify(isUserPresent));
        this.router.navigateByUrl('/dashboard');
      } else {
        alert("Hereglegch oldsongui...")
      }
    }
  }

}
//signupclass
export class SignUpModel  {
  name: string;
  email: string;
  password: string;

  constructor() {
    this.email = "";
    this.name = "";
    this.password= ""
  }
}
//log class
export class LoginModel  { 
  email: string;
  password: string;

  constructor() {
    this.email = ""; 
    this.password= ""
  }
}