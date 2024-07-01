import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { User } from '../users/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly authService: AuthService) {}

  async register(user: User): Promise<{ message: string }> {
    console.log("user", user);
    const existingUser = (await this.authService.getUsers()).find(u => u.email === user.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    await this.authService.addUser(user);
    return { message: 'User registered successfully' };
  }
}


