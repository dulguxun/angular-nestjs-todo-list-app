import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Todotable  {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;
  
  @ManyToOne(() => User, user => user.tasks)
  user: User;
}
