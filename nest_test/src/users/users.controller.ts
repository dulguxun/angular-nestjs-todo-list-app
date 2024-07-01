import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../strategies/jwt-auth.guard';
import { User } from '../users/user.entity'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() user: User): Promise<{ message: string }> {
    // console.log(user);
    await this.usersService.register(user);
    return { message: 'User registered successfully' };
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProtectedResource(@Request() req) {
    return { message: 'User Profile', user: req.user };
  }
  
}
