import { UserEntity } from "@/core/user/entities/user.entity";
import { Tag } from "@modules/tag/entities/tag.entity";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  DeleteDateColumn,
  BeforeUpdate,
  Index,
  UpdateDateColumn,
} from "typeorm";
import { FileEntity } from "@modules/file-management/entities/file.entity";

@Entity()
export class ArticleEntity {
  constructor(partial: Partial<ArticleEntity>) {
    Object.assign(this, partial);
  }
  @Index()
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: "text", charset: "utf8mb4", default: "" })
  content: string;

  //   关联user和tag;
  @ManyToOne(() => UserEntity, (user) => user.articles)
  user: UserEntity;

  @DeleteDateColumn({
    nullable: true,
  })
  deleteTime: Date | null;

  @ManyToMany(() => Tag, (tag) => tag.articles, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinTable({
    name: "article_tag", // 此关系的联结表的表名
    joinColumn: {
      name: "article",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "tag",
      referencedColumnName: "id",
    },
  })
  tags: Tag[];

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createTime: string;

  
  @UpdateDateColumn({
    type: "datetime",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updateTime: string;

  @Column({ default: false })
  is_topic: boolean;

  @ManyToMany(() => FileEntity, (file) => file.article, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  }) // Define one-to-many relationship
  @JoinTable({
    name: "article_file",
    joinColumn: {
      name: "article",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "file",
      referencedColumnName: "id",
    },
  })
  files: FileEntity[];
}
