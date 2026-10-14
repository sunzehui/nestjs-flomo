// file.entity.ts
import { ArticleEntity } from "@modules/article/entities/article.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
} from "typeorm";
import { Injectable } from "@nestjs/common";
import { UserEntity } from "@/core/user/entities/user.entity";

@Entity()
@Injectable()
export class FileEntity {
  constructor(file: Partial<FileEntity>) {
    Object.assign(this, file);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => UserEntity, (user) => user.files)
  users: UserEntity[];

  @Column()
  filename: string;

  @Column()
  filePath: string;

  // 关连接表（article_file）由 ArticleEntity 侧通过 @JoinTable 维护，
  // 这里不能再声明 @JoinTable，否则 TypeORM 会报「关系两侧都有 JoinTable」
  @ManyToMany(() => ArticleEntity, (article) => article.files)
  article: ArticleEntity[];

  @Column({ unique: true })
  md5: string;
}
