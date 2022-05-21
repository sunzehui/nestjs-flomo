import { User } from '@user/entities/user.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ default: '', length: 255 })
  content: string;

  //   关联user和tag;
  @ManyToOne((type) => User, (user) => user.articles)
  user: User;

  @DeleteDateColumn()
  deleteTime: Date;

  @ManyToMany((type) => Tag, (tag) => tag.articles, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable({
    name: 'article_tag', // 此关系的联结表的表名
    joinColumn: {
      name: 'tag',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'article',
      referencedColumnName: 'id',
    },
  })
  tags: Tag[];

  @Column()
  createTime: string;

  @Column({ default: '' })
  updateTime: string;
}
