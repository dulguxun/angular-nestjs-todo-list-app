import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../strategies/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() user: CreateUserDto): Promise<{ message: string }> {
    await this.usersService.register(user);
    return { message: 'User registered successfully' };
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProtectedResource(@Request() req) {
    return { message: 'User Profile', user: req.user };
  }
}
