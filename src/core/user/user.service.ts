import { HttpStatus, Injectable, HttpException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { QueryFailedError, Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { UpdateUserDto } from "@/core/user/dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async findUser(id: number) {
    return await this.repository.findOneBy({ id });
  }

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
      last_login: "",
    };
    try {
      const user = await this.repository.create(userDO);
      const result = await this.repository.save(user);
      // 统一响应结构由全局拦截器负责，此处只返回安全字段（去掉密码）
      const { password: _password, ...safeUser } = result;
      return safeUser;
    } catch (error) {
      throw error instanceof QueryFailedError
        ? new HttpException("用户名已存在", HttpStatus.BAD_REQUEST)
        : error;
    }
  }

  async recordLogin(userId: number) {
    const last_login = new Date().toISOString();

    return await this.repository.update(userId, {
      last_login,
    });
  }

  findLoginUser(username: string) {
    return this.repository.findOne({
      where: { username },
      select: ["id", "username", "password", "nickname", "last_login"],
    });
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    const userDo = {
      nickname: updateUserDto.nickname,
    };
    const res = (await this.repository.update({ id: userId }, userDo)) as {
      affected: number;
    };
    return res.affected > 0;
  }

  /**
   * 修改密码。
   * password 列是 select: false，必须显式 select；BeforeInsert 只在插入时加密，
   * 因此这里需要手动 bcrypt.hash。
   */
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.repository.findOne({
      where: { id: userId },
      select: ["id", "password"],
    });
    if (!user) {
      throw new HttpException("用户不存在", HttpStatus.NOT_FOUND);
    }

    const matched = await bcrypt.compare(oldPassword, user.password);
    if (!matched) {
      throw new HttpException("原密码不正确", HttpStatus.BAD_REQUEST);
    }
    if (oldPassword === newPassword) {
      throw new HttpException("新密码不能与原密码相同", HttpStatus.BAD_REQUEST);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.repository.save(user);
    return true;
  }
}
