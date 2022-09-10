import {Article} from '@modules/article/entities/article.entity';
import {User} from '@/core/user/entities/user.entity';
import {
    BeforeInsert,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import * as moment from 'moment';

@Entity()
export class Statistic {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({type: 'int'})
    count: number;

    @BeforeInsert() initTime() {
        this.date = moment().format('YYYY-MM-DD');
        console.log('date', this.date);
    }

    @Column({type: 'date'})
    date: string;

    @ManyToOne(() => User, (user) => user.id)
    user: User;

    @ManyToOne(() => Article, (article) => article.id)
    article: Article;
}
