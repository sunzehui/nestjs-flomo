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
import * as moment from 'moment';
@Entity()
export class Statistic {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'int' })
  count: number;

  @BeforeInsert() initTime() {
    this.date = moment().format('YYYY-MM-DD');
    console.log('date', this.date);
  }
  @Column({ type: 'date' })
  date: string;

  @ManyToOne((type) => User, (user) => user.id)
  user: User;

  @ManyToOne((type) => Article, (article) => article.id)
  article: Article;
}
