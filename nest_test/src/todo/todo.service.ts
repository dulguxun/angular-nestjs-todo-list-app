import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todotable } from './todo.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todotable)
    private todoRepository: Repository<Todotable>,
  ) {}

  getTasksByUser(userId: number): Promise<Todotable[]> {
    return this.todoRepository.find({ where: { user: { id: userId } }, relations: ['user'] });
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


}
