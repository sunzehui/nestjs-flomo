import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import _ from 'lodash';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}
  register(createUserDto: CreateUserDto) {
    const username = createUserDto.username;
    const password = createUserDto.password;
    
  }

  async login(loginUserDto: LoginUserDto) {
    const username = loginUserDto.username;
    const password = loginUserDto.password;
    if (_.isEmpty(username) || _.isEmpty(password)) {
      throw new BadRequestException('user is required!');
    }
    const user = await this.repository.findOneBy({ username });
    if (_.isEmpty(user)) {
      throw new BadRequestException('user not found!');
    }
    const isValidPwd = bcrypt.compare(user.password, password);
    if (!isValidPwd) {
      throw new BadRequestException('password is not valid!');
    }
    return 
  }
}
