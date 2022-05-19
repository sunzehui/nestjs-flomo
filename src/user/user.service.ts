import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserStatusDTO } from './dto/user-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import * as _ from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}
  async register(createUserDto: CreateUserDto) {
    const username = createUserDto.username;
    const password = createUserDto.password;
    const userDO = {
      username,
      password,
      memo_count: 0,
      day_count: 0,
      tag_count: 0,
      month_sign_id: 0,
      last_login: '',
    };
    const user = this.repository.create(userDO);
    const result = await this.repository.save(user);
    if (_.isEmpty(result)) {
      return user;
    }
    return {
      status: true,
      message: 'ok',
    };
  }
  findLoginUser(username: string) {
    return this.repository.findOneBy({ username });
  }
}
