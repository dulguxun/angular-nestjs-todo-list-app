import { IsString } from 'class-validator';

export class TaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}
