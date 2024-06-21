import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Todotable } from './todo.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todotable)
    private todoRepository: Repository<Todotable>,
  ) {}

  async getTasksByUser(userId: number, page: number = 1, limit: number = 10): Promise<{ tasks: Todotable[], total: number }> {
    const [tasks, total] = await this.todoRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['user'],
      order: {
        favoriteTask: 'DESC',
        originalPosition: 'DESC'
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { tasks, total };
  }
  

  async addTask(task: Todotable): Promise<void> {
    const totalTasks = await this.todoRepository.count({ where: { user: { id: task.user.id } } });
    task.originalPosition = totalTasks + 1; // Set original position
    await this.todoRepository.save(task);
  }
  

  async findTaskById(id: number): Promise<Todotable> {
    return this.todoRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async updateTask(task: Todotable): Promise<void> {
    await this.todoRepository.save(task);
  }
  

  async deleteTask(id: number): Promise<void> {
    await this.todoRepository.delete(id);
  }

  async searchTasksByTitle(userId: number, searchTerm: string, page: number = 1, limit: number = 10): Promise<{ tasks: Todotable[], total: number }> {
    const [tasks, total] = await this.todoRepository.findAndCount({
      where: { 
        user: { id: userId },
        title: Like(`%${searchTerm}%`),
      },
      relations: ['user'],
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { tasks, total };
  }

  async toggleFavoriteTaskById(userId: number, taskId: number): Promise<void> {
    const task = await this.todoRepository.findOne({ where: { id: taskId, user: { id: userId } }, relations: ['user'] });
    if (!task) {
      throw new Error('Task not found');
    }
    task.favoriteTask = !task.favoriteTask; // Toggle favorite status
    task.updatedAt = new Date();
    await this.todoRepository.save(task);
  }
}
