// src/todo/dto/update-task.dto.ts
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateTaskDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;
}
