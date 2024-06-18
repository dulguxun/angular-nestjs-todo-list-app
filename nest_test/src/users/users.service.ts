import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly authService: AuthService) {}

  async register(user: User): Promise<{ message: string; }> {
    const existingUser = (await this.authService.getUsers()).find(u => u.email === user.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    this.authService.addUser(user);
    return { message: 'User registered successfully'};
  }
  
}

