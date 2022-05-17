import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ primary: true })
  username: string;

  @Column()
  password: string;

  @Column()
  memo_count: number;

  @Column()
  day_count: number;

  @Column()
  tag_count: number;

  @Column()
  month_sign_id: number;

  @Column()
  last_login: string;
}
