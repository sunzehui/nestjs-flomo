import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

/**
 * 每日回顾记录。
 * 同一天同一篇 memo 只记录一次，用于「今日不重复推送」。
 */
@Entity()
@Index(["userId", "articleId", "reviewDate"], { unique: true })
export class ReviewLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userId: number;

  @Column()
  articleId: number;

  /** 回顾发生的日期，格式 yyyy-MM-dd */
  @Column({ type: "date" })
  reviewDate: string;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: string;
}
