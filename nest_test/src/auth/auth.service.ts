import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  private pool: Pool;

  constructor(private readonly jwtService: JwtService) {
    this.pool = new Pool({
      user: process.env.DB_USERNAME,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT, 10),
    });
  }

  async getUsers(): Promise<User[]> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM public."user"';
      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Could not fetch users');
    } finally {
      client.release();
    }
  }
  

  async addUser(user: User): Promise<void> {
    const client = await this.pool.connect();
    try {
      let newId = (await this.getUsersCount()) + 1;
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const query = `
        INSERT INTO public."user"(id, username, email, password)
        VALUES ($1, $2, $3, $4)
      `;
      const values = [newId, user.username, user.email, hashedPassword];
      await client.query(query, values);
    } catch (error) {
      console.error('Error adding user:', error);
      throw new Error('Could not add user');
    } finally {
      client.release();
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; accessToken?: string; payload?: any }> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM public."user" WHERE email = $1';
      const result = await client.query(query, [email]);
      const user = result.rows[0];
      
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const payload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(payload);
      return { success: true, accessToken, payload };
    } catch (error) {
      console.error('Error logging in:', error);
      throw new UnauthorizedException('Invalid email or password');
    } finally {
      client.release();
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM user WHERE email = $1';
      const result = await client.query(query, [email]);
      const user = result.rows[0];

      if (user && await bcrypt.compare(password, user.password)) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    } finally {
      client.release();
    }
  }

  async getUsersCount(): Promise<number> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT COUNT(*) AS user_count FROM public."user"';
      const result = await client.query(query);
      const rowCount = parseInt(result.rows[0].user_count, 10);
      return rowCount;
    } catch (error) {
      console.error('Error fetching user count:', error);
      throw new Error('Could not fetch user count');
    } finally {
      client.release();
    }
  }

}
