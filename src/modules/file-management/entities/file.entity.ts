// file.entity.ts
import { ArticleEntity } from '@modules/article/entities/article.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { join as lJoin } from 'lodash';
import { Transform } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '@/core/user/entities/user.entity';

@Entity()
@Injectable()
export class FileEntity {
  constructor(file: Partial<FileEntity>) {
    Object.assign(this, file);
  }

  @PrimaryGeneratedColumn()
  id: number;

  // Add this relationship

  @ManyToMany(() => UserEntity, (user) => user.files)
  users: UserEntity[];

  @Column()
  filename: string;

  @Column()
  filePath: string;

  @ManyToOne(() => ArticleEntity, (article) => article.files) // Define many-to-one relationship
  @JoinColumn({ name: 'article_id' })
  article: ArticleEntity;

  @Column({ unique: true })
  md5: string;
}
