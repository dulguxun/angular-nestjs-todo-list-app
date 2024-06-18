import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; 
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async getUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async addUser(user: User): Promise<void> {
    // Hash the user's password before saving
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    await this.usersRepository.save(user);
  }
  async login(email: string, password: string): Promise<{ success: boolean; accessToken?: string; payload?: any }> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    //compare hashed passwords here
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    return { success: true, accessToken, payload };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email: username } });
    if (user && user.password === password) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}


// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';

// export interface User {
//   name: string;
//   email: string;
//   password: string;
// }

// @Injectable()
// export class AuthService {
//   private users: User[] = [];

//   constructor(private readonly jwtService: JwtService) {}

//   getUsers(): User[] {
//     return this.users;
//   }

//   addUser(user: User): void {
//     this.users.push(user);
//   }

//   login(email: string, password: string): { success: boolean, accessToken?: string, payload?: any } {
//     const user = this.users.find(u => u.email === email && u.password === password);
//     if (!user) {
//       throw new UnauthorizedException('Invalid email or password');
//     }
//     const payload = { email: user.email, sub: user.name };
//     const accessToken = this.jwtService.sign(payload);
//     return { success: true, accessToken, payload };
//   }

//   async validateUser(username: string, password: string): Promise<any> {
//     const user = this.users.find(u => u.email === username);
//     if (user && user.password === password) {
//       const { password, ...result } = user;
//       return result;
//     }
//     return null;
//   }
// }
