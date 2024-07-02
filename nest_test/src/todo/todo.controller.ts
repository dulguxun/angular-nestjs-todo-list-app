import { Controller, Get, Query, Post, Body, Req, UseGuards, Param } from '@nestjs/common';
import { TodoService } from './todo.service';
import { Todotablee } from './todo.entity';
import { JwtAuthGuard } from 'src/strategies/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('task')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getTasks(@Req() req, @Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<{ tasks: Todotablee[], total: number }> {
    const userId = req.user.userId;
    return this.todoService.getTasksByUser(userId, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/add')
  async addTask(@Req() req, @Body() taskData: CreateTaskDto): Promise<{ message: string; tasks: Todotablee[] }> {
    const userId = req.user.userId;
    const newTask: Todotablee = {
      id: 0,
      title: taskData.title,
      description: taskData.description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      favoriteTask: false,
      originalPosition: 0,
      user: { id: userId } as any,
    };
    await this.todoService.addTask(newTask);

    const { tasks } = await this.todoService.getTasksByUser(userId);
    return { message: 'Task added successfully', tasks };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/update')
  async updateTask(@Req() req, @Body() taskData: UpdateTaskDto): Promise<{ message: string }> {
    const userId = req.user.userId;
    const task = await this.todoService.findTaskById(taskData.id);

    task.title = taskData.title;
    task.description = taskData.description;
    task.updatedAt = new Date();

    await this.todoService.updateTask(task);
    return { message: 'Task updated successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/delete')
  async deleteTask(@Req() req, @Body() taskId: { id: number }): Promise<{ message: string }> {
    await this.todoService.deleteTask(taskId.id);
    return { message: 'Task deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/search')
  async searchTasks(@Req() req, @Query('search') search: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<{ tasks: Todotablee[], total: number }> {
    const userId = req.user.userId;
    return this.todoService.searchTasksByTitle(userId, search, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/favorite')
  async toggleFavoriteTask(@Req() req, @Body() taskId: { id: number }): Promise<{ message: string }> {
    const userId = req.user.userId;
    await this.todoService.toggleFavoriteTaskById(userId, taskId.id);
    return { message: 'Task favorite status updated successfully' };
  }
}
