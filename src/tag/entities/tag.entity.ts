import { Article } from 'src/article/entities/article.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  DeleteDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id?: string;

  @Column()
  @Index({ unique: true })
  content: string;

  @Column({ default: false })
  is_topics: boolean;

  @ManyToMany((type) => Article, (article) => article.tags)
  articles: Article[];

  @DeleteDateColumn()
  deleteTime: Date;

  @ManyToOne((type) => User, (user) => user.id)
  user: User;
}
