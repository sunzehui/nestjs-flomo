import {Tag} from '@modules/tag/entities/tag.entity';
import {Article} from "@modules/article/entities/article.entity";
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

    @Column({unique:true, type: 'varchar'})
    username: string;

    @Column({type: 'varchar', charset:'utf8mb4',default:'浮墨用户'})
    nickname: string;

    @Column({type: 'varchar', select: false})
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

    @OneToMany(() => Article, (article) => article.user)
    articles: Article[];

    @OneToMany(() => Tag, (tag) => tag.user)
    tags: Tag[];

    @Column()
    last_login: string;
}
