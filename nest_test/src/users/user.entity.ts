import { Todotablee } from 'src/todo/todo.entity';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  tasks: Todotablee[];
}