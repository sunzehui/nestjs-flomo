import { IsNotEmpty, MaxLength, MinLength, Validate } from 'class-validator';
import CustomUsername from '../create-user.decorator';
export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(6, {
    message: '用户名长度不能小于6位',
  })
  @MaxLength(18, {
    message: '用户名长度不能大于18位',
  })
  @Validate(CustomUsername)
  username: string;

  @IsNotEmpty()
  @MinLength(6, {
    message: '密码长度不能小于6位',
  })
  @MaxLength(18, {
    message: '密码长度不能大于18位',
  })
  password: string;
}
