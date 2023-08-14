import { Tag } from '@modules/tag/entities/tag.entity';
import { ArticleEntity } from '@modules/article/entities/article.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { FileEntity } from '@modules/file-management/entities/file.entity';

@Entity()
export class UserEntity {
  constructor(user: Partial<UserEntity>) {
    Object.assign(this, user);
  }
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true, type: 'varchar' })
  username: string;

  @Column({ type: 'varchar', charset: 'utf8mb4', default: '浮墨用户' })
  nickname: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column()
  memo_count: number;

  @Column()
  day_count: number;

  @Column()
  tag_count: number;

  @Column()
  month_sign_id: number;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @OneToMany(() => ArticleEntity, (article) => article.user)
  articles: ArticleEntity[];

  @OneToMany(() => Tag, (tag) => tag.user)
  tags: Tag[];

  // Add this relationship
  @JoinTable({
    name: 'user_file', // 此关系的联结表的表名
    joinColumn: {
      name: 'user',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'file',
      referencedColumnName: 'id',
    },
  })
  @ManyToMany(() => FileEntity, (file) => file.users)
  files: FileEntity[];

  @Column()
  last_login: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createTime: string;
}
