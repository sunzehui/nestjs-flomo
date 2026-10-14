import { ArticleEntity } from "@modules/article/entities/article.entity";
import { UserEntity } from "@/core/user/entities/user.entity";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity()
// 标签名只在「单个用户」范围内唯一，避免不同用户互相占用同名标签
@Index(["content", "userId"], { unique: true })
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", charset: "utf8mb4" })
  content: string;

  @Column({ default: false })
  is_topics: boolean;

  @ManyToMany(() => ArticleEntity, (article) => article.tags)
  articles: ArticleEntity[];

  @DeleteDateColumn({
    nullable: true,
  })
  deleteTime: Date | null;

  @Index()
  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: "userId" })
  user: UserEntity;
}
