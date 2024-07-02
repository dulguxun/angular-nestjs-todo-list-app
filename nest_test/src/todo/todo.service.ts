import { Injectable } from '@nestjs/common';
import { Todotablee } from './todo.entity';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { SearchTaskDto } from './dto/search-task.dto';

dotenv.config();

@Injectable()
export class TodoService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USERNAME,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT, 10),
    });
  }

  async getTasksByUser(userId: number, page: number = 1, limit: number = 10): Promise<{ tasks: Todotablee[], total: number }> {
    const client = await this.pool.connect();
    try {
      const offset = (page - 1) * limit;
      const tasksQuery = `
        SELECT * FROM todotable
        WHERE "userId" = $1
        ORDER BY "updatedAt" DESC
        LIMIT $2 OFFSET $3
      `;
      const countQuery = `
        SELECT COUNT(*) FROM todotable
        WHERE "userId" = $1
      `;
      
      const tasksResult = await client.query(tasksQuery, [userId, limit, offset]);
      const countResult = await client.query(countQuery, [userId]);
      
      const tasks = tasksResult.rows;
      const total = parseInt(countResult.rows[0].count, 10);
      
      return { tasks, total };
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error('Could not get tasks');
    } finally {
      client.release();
    }
  }

  async addTask(task: Todotablee): Promise<void> {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO public.todotable (title, description, "createdAt", "updatedAt", "userId")
        VALUES ($1, $2, $3, $4, $5)
      `;
      const values = [task.title, task.description, task.createdAt, task.updatedAt, task.user.id];
      await client.query(query, values);
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error('Could not add task');
    } finally {
      client.release();
    }
  }
  
//detail bolon update uyd
  async findTaskById(id: number): Promise<Todotablee> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT * FROM public.todotable
        WHERE id = $1
      `;
      const result = await client.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error('Could not find task');
    } finally {
      client.release();
    }
  }

  async updateTask(task: Todotablee): Promise<void> {
    const client = await this.pool.connect();
    try {
      const query = `
        UPDATE public.todotable
        SET title = $1, description = $2, "updatedAt" = $3
        WHERE id = $4
      `;
      const values = [task.title, task.description, task.updatedAt, task.id];
      await client.query(query, values);
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error('Could not update task');
    } finally {
      client.release();
    }
  }

  async deleteTask(id: number): Promise<void> {
    const client = await this.pool.connect();
    try {
      const query = `
        DELETE FROM public.todotable
        WHERE id = $1
      `;
      await client.query(query, [id]);
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error('Could not delete task');
    } finally {
      client.release();
    }
  }

  async searchTasksByTitle(
    userId: number,
    searchTerm: string,
    startDate: string | null,
    endDate: string | null,
    page: number = 1,
    limit: number = 10
  ): Promise<{ tasks: Todotablee[], total: number }> {
    const client = await this.pool.connect();
    try {
      const offset = (page - 1) * limit;
      let searchQuery = `
        SELECT * FROM todotable
        WHERE "userId" = $1 AND title ILIKE $2
      `;
      let countQuery = `
        SELECT COUNT(*) FROM todotable
        WHERE "userId" = $1 AND title ILIKE $2
      `;
      const searchParams = [userId, `%${searchTerm}%`];
      const countParams = [userId, `%${searchTerm}%`];
      
      let paramIndex = 3;

      if (startDate) {
        searchQuery += ` AND "createdAt" >= $${paramIndex}`;
        countQuery += ` AND "createdAt" >= $${paramIndex}`;
        searchParams.push(startDate);
        countParams.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        searchQuery += ` AND "createdAt" <= $${paramIndex}`;
        countQuery += ` AND "createdAt" <= $${paramIndex}`;
        searchParams.push(endDate);
        countParams.push(endDate);
        paramIndex++;
      }

      searchQuery += ` ORDER BY "updatedAt" DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      searchParams.push(limit, offset);

      const searchResult = await client.query(searchQuery, searchParams);
      const countResult = await client.query(countQuery, countParams);

      const tasks = searchResult.rows;
      const total = parseInt(countResult.rows[0].count, 10);

      return { tasks, total };
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error('Could not search tasks');
    } finally {
      client.release();
    }
  }
  async toggleFavoriteTaskById(userId: number, taskId: number): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      const taskQuery = `
        SELECT "favoriteTask" FROM public.todotable
        WHERE id = $1 AND "userId" = $2
      `;
      const taskResult = await client.query(taskQuery, [taskId, userId]);
      
      if (taskResult.rowCount === 0) {
        throw new Error('Task not found or you do not have permission to update this task');
      }
  
      const { favoriteTask } = taskResult.rows[0];
      const newFavoriteStatus = !favoriteTask;
  
      let updateQuery;
      let values;
      
      if (newFavoriteStatus) {
        updateQuery = `
          UPDATE public.todotable
          SET "favoriteTask" = $1, "updatedAt" = NOW()
          WHERE id = $2 AND "userId" = $3
        `;
        values = [newFavoriteStatus, taskId, userId];
      } else {
        updateQuery = `
          UPDATE public.todotable
          SET "favoriteTask" = $1, "updatedAt" = NOW(), "createdAt" = NOW()
          WHERE id = $2 AND "userId" = $3
        `;
        values = [newFavoriteStatus, taskId, userId];
      }
  
      await client.query(updateQuery, values);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error toggling favorite task:', error);
      throw new Error('Could not toggle favorite task');
    } finally {
      client.release();
    }
  }
    
}  