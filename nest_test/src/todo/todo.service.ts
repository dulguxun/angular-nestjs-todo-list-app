import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Todotable } from './todo.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todotable)
    private todoRepository: Repository<Todotable>,
  ) {}

  getTasksByUser(userId: number, page: number = 1, limit: number = 10): Promise<[Todotable[], number]> {
    const offset = (page - 1) * limit;
    return this.todoRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['user'],
      skip: offset,
      take: limit,
    });
  }

  async addTask(task: Todotable): Promise<void> {
    await this.todoRepository.save(task);
  }

  findTaskById(id: number): Promise<Todotable> {
    return this.todoRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async updateTask(task: Todotable): Promise<void> {
    await this.todoRepository.save(task);
  }

  async deleteTask(id: number): Promise<void> {
    await this.todoRepository.delete(id);
  }

  async searchTasks(userId: number, searchTerm: string): Promise<Todotable[]> {
    return this.todoRepository.find({
      where: { user: { id: userId }, title: Like(`%${searchTerm}%`) },
      relations: ['user'],
    });
  }
}
