import { IsString, IsEmail, MinLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskDto } from 'src/todo/dto/task.dto';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  tasks: TaskDto[];
}
