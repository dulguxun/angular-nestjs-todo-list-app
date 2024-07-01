import { Injectable } from '@nestjs/common';
import { Todotablee } from './todo.entity';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

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
        INSERT INTO public.todotable (title, description, "createdAt", "updatedAt", "userId", "originalPosition")
        VALUES ($1, $2, $3, $4, $5, (SELECT COUNT(*) FROM public.todotable WHERE "userId" = $5) + 1)
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

  async searchTasksByTitle(userId: number, searchTerm: string, page: number = 1, limit: number = 10): Promise<{ tasks: Todotablee[], total: number }> {
    const client = await this.pool.connect();
    try {
      const offset = (page - 1) * limit;
      const searchQuery = `
        SELECT * FROM todotable
        WHERE "userId" = $1 AND title ILIKE $2
        ORDER BY "updatedAt" DESC
        LIMIT $3 OFFSET $4
      `;
      const countQuery = `
        SELECT COUNT(*) FROM todotable
        WHERE "userId" = $1 AND title ILIKE $2
      `;
      
      const searchResult = await client.query(searchQuery, [userId, `%${searchTerm}%`, limit, offset]);
      const countResult = await client.query(countQuery, [userId, `%${searchTerm}%`]);
      
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

  async togglefavorites(userId: string, taskId: number): Promise<void> {
    const client = await this.pool.connect();
    try {
      const query = `
        UPDATE public.todotable
        SET "favoriteTask" = NOT "favoriteTask"
        WHERE id = $1 AND "userId" = $2
      `;
      await client.query(query, [taskId, userId]);
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error('Could not toggle favorite status');
    } finally {
      client.release();
    }
  }
  async toggleFavoriteTaskById(userId: number, taskId: number): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      const taskQuery = `
        SELECT "favoriteTask", "originalPosition" FROM public.todotable
        WHERE id = $1 AND "userId" = $2
      `;
      const taskResult = await client.query(taskQuery, [taskId, userId]);
      
      if (taskResult.rowCount === 0) {
        throw new Error('Task not found or you do not have permission to update this task');
      }
  
      const task = taskResult.rows[0];
      const newFavoriteStatus = !task.favoriteTask;
      
      let updateQuery;
      let values;
      
      if (newFavoriteStatus) {
        updateQuery = `
          UPDATE public.todotable
          SET "favoriteTask" = $1, "originalPosition" = $2
          WHERE id = $3 AND "userId" = $4
        `;
        values = [newFavoriteStatus, task.originalPosition, taskId, userId];
      } else {
        updateQuery = `
          UPDATE public.todotable
          SET "favoriteTask" = $1, "originalPosition" = (
            SELECT COUNT(*) FROM public.todotable WHERE "userId" = $2 AND "favoriteTask" = true
          ) + 1
          WHERE id = $3 AND "userId" = $4
        `;
        values = [newFavoriteStatus, userId, taskId, userId];
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



//   async toggleFavoriteTaskById(userId: number, taskId: number): Promise<void> {
//     const client = await this.pool.connect();
//     try {
//       const query = `
//         UPDATE public.todotable
//         SET "favoriteTask" = NOT "favoriteTask"
//         WHERE id = $1 AND "userId" = $2
//       `;
//       const values = [taskId, userId];
//       const result = await client.query(query, values);
  
//       if (result.rowCount === 0) {
//         throw new Error('Task not found or you do not have permission to update this task');
//       }
//     } catch (error) {
//       console.error('Error toggling favorite task:', error);
//       throw new Error('Could not toggle favorite task');
//     } finally {
//       client.release();
//     }
//   }  
// }
