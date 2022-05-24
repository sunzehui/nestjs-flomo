import { Article } from './../../article/entities/article.entity';
import { User } from '@user/entities/user.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Statistic {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'int' })
  count: number;

  @BeforeInsert() initTime() {
    this.date = new Date();
  }
  @Column({ type: 'date' })
  date: Date;

  @ManyToOne((type) => User, (user) => user.id)
  user: User;

  @ManyToOne((type) => Article, (article) => article.id)
  article: Article;
}
