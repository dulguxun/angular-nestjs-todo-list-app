import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Todotable  {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  favoriteTask: boolean;
  
  @Column({ default: 0 })
  originalPosition: number; // Add this field

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, user => user.tasks)
  user: User;
}
