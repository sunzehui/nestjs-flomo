import { UserEntity } from '@/core/user/entities/user.entity';
import { Tag } from '@modules/tag/entities/tag.entity';
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
  OneToMany,
  JoinColumn,
} from 'typeorm';
import * as moment from 'moment';
import { FileEntity } from '@modules/file-management/entities/file.entity';

@Entity()
export class ArticleEntity {
  @Index()
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'text', charset: 'utf8mb4', default: '' })
  content: string;

  //   关联user和tag;
  @ManyToOne(() => UserEntity, (user) => user.articles)
  user: UserEntity;

  @DeleteDateColumn()
  deleteTime: Date;

  @ManyToMany(() => Tag, (tag) => tag.articles, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable({
    name: 'article_tag', // 此关系的联结表的表名
    joinColumn: {
      name: 'article',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag',
      referencedColumnName: 'id',
    },
  })
  tags: Tag[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createTime: string;

  @BeforeUpdate()
  time() {
    this.updateTime = moment().format('YYYY-MM-DD HH:mm:ss');
  }
  @Column({
    type: 'datetime',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateTime: string;

  @Column({ default: false })
  is_topic: boolean;

  @OneToMany(() => FileEntity, (file) => file.article, {
    cascade: true,
    onDelete: 'CASCADE',
  }) // Define one-to-many relationship
  @JoinColumn({ name: 'article_id' })
  files: FileEntity[];
}
