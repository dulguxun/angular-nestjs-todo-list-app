import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { Todotablee } from '../todo/todo.entity';

@Injectable()
export class UsersService {
  constructor(private readonly authService: AuthService) {}

  async register(createUserDto: CreateUserDto): Promise<{ message: string }> {
    console.log("user", createUserDto);

    // Check if the user already exists
    const existingUser = (await this.authService.getUsers()).find(u => u.email === createUserDto.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    

    // Create a new User entity
    const newUser: User = {
      id: Date.now(),  // You can use your database's auto-increment id instead
      username: createUserDto.username,
      email: createUserDto.email,
      password: createUserDto.password,
      tasks: createUserDto.tasks.map(t => ({
        id: 0, // You can use your database's auto-increment id instead
        title: t.title,
        description: t.description,
        createdAt: new Date(),
        updatedAt: new Date(),
        favoriteTask: false,
        originalPosition: 0,
        user: newUser,
      })),
    };

    // Save the new user
    await this.authService.addUser(newUser);
    return { message: 'User registered successfully' };
  }
}
