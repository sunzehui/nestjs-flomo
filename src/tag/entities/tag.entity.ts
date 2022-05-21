import { Article } from 'src/article/entities/article.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  @Index({ unique: true })
  content: string;

  @Column({ default: false })
  is_topics: boolean;

  @ManyToMany((type) => Article, (article) => article.tags)
  articles: Article[];

  @DeleteDateColumn()
  deleteTime: Date;
}
