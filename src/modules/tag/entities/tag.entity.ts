import { ArticleEntity } from '@modules/article/entities/article.entity';
import { UserEntity } from '@/core/user/entities/user.entity';
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

  @Column({ type: 'varchar', charset: 'utf8mb4' })
  @Index({ unique: true })
  content: string;

  @Column({ default: false })
  is_topics: boolean;

  @ManyToMany(() => ArticleEntity, (article) => article.tags)
  articles: ArticleEntity[];

  @DeleteDateColumn()
  deleteTime: Date;

  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;
}
