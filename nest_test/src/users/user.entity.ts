import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Todotable } from 'src/todo/todo.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length : 100 })
  username: string;

  @Column({ length : 100 })
  email: string;

  @Column({ length : 100 })
  password: string;

  @OneToMany(() => Todotable, task => task.user)
  tasks: Todotable[];
}
