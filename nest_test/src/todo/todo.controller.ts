import { Controller, Get, Query, Post, Body, Req, UseGuards, UnauthorizedException, ForbiddenException, Param } from '@nestjs/common';
import { TodoService } from './todo.service';
import { Todotable } from './todo.entity';
import { JwtAuthGuard } from 'src/strategies/jwt-auth.guard';

@Controller('task')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getTasks(@Req() req, @Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<{ tasks: Todotable[], total: number }> {
    const userId = req.user.userId;
    return this.todoService.getTasksByUser(userId, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/add')
  async addTask(@Req() req, @Body() taskData: { title: string, description: string }): Promise<{ message: string; tasks: Todotable[] }> {
    const userId = req.user.userId;
    const newTask: Todotable = {
      id: 0,
      title: taskData.title,
      createdAt: new Date(),
      updatedAt: new Date(),
      favoriteTask: false,
      originalPosition: 0,
      description: taskData.description,
      user: { id: userId } as any,
    };
    await this.todoService.addTask(newTask);

    const { tasks } = await this.todoService.getTasksByUser(userId);
    return { message: 'Task added successfully', tasks };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/update')
  async updateTask(@Req() req, @Body() taskData: { id: number; title: string, description: string }): Promise<{ message: string }> {
    const userId = req.user.userId;
    const task = await this.todoService.findTaskById(taskData.id);

    if (task.user.id !== userId) {
      throw new UnauthorizedException();
    }

    task.title = taskData.title;
    task.description = taskData.description;
    task.updatedAt = new Date();

    await this.todoService.updateTask(task);
    return { message: 'Task updated successfully'};
  }

  @UseGuards(JwtAuthGuard)
  @Post('/delete')
  async deleteTask(@Req() req, @Body() taskId: { id: number }): Promise<{ message: string }> {
    const userId = req.user.userId;
    const task = await this.todoService.findTaskById(taskId.id);

    if (task.user.id !== userId) {
      throw new UnauthorizedException();
    }

    await this.todoService.deleteTask(taskId.id);
    return { message: 'Task deleted successfully' };
  }
  @UseGuards(JwtAuthGuard)
  @Get('/search')
  async searchTasks(@Req() req, @Query('search') search: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<{ tasks: Todotable[], total: number }> {
    const userId = req.user.userId;
    return this.todoService.searchTasksByTitle(userId, search, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/favorite')
  async favoriteTask(@Req() req, @Body() taskId: { id: number }): Promise<{ message: string }> {
    const userId = req.user.userId;
    await this.todoService.toggleFavoriteTaskById(userId, taskId.id);
    return { message: 'Task favorite status updated successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getTaskById(@Req() req, @Param('id') id: number): Promise<Todotable> {
    const userId = req.user.userId;
    const task = await this.todoService.findTaskById(id);
    console.log(task.user.id, userId);
    if (task.user.id !== userId) {
      
      throw new ForbiddenException();
    }
    return task;
  }
}