import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ primary: true })
  username: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column()
  memo_count: number;

  @Column()
  day_count: number;

  @Column()
  tag_count: number;

  @Column()
  month_sign_id: number;
  @BeforeInsert() async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @Column()
  last_login: string;
}
