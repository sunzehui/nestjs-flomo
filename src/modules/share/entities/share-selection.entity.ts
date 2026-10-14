import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

/**
 * 精选分享：只对外暴露选定的若干条 memo。
 * token 不可枚举，撤销后立即失效。
 */
@Entity()
export class ShareSelection {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  token: string;

  @Index()
  @Column()
  userId: number;

  @Column({ type: "varchar", default: "" })
  title: string;

  @Column({ type: "simple-json" })
  articleIds: number[];

  @Column({ default: false })
  revoked: boolean;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: string;
}
