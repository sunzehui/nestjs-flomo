import { Tag } from 'src/tag/entities/tag.entity';
import { Article } from './../../article/entities/article.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column()
  memo_count: number;

  @Column()
  day_count: number;

  @Column()
  tag_count: number;

  @Column()
  month_sign_id: number;
  @BeforeInsert() async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
  @OneToMany((type) => Article, (article) => article.user)
  articles: Article[];

  @OneToMany(() => Tag, (tag) => tag.user)
  tags: Tag[];

  @Column()
  last_login: string;
}
