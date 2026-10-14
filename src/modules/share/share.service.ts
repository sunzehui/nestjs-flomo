import { UserService } from "@/core/user/user.service";
import { ArticleService } from "@modules/article/article.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UserEntity } from "@/core/user/entities/user.entity";

@Injectable()
export class ShareService {
  constructor(
    private readonly articleService: ArticleService,
    private readonly userService: UserService,
  ) {}

  async findUserShared(userId: number) {
    const userInfo = await this.userService.findUser(userId);
    if (!userInfo) {
      throw new NotFoundException("用户不存在");
    }
    // 必须显式传入查询条件，否则 findAll 会退化为「查询全库文章」
    const usersMemo = await this.articleService.findAll(userId, {
      deleted: false,
    });

    // 分享页不应暴露账号密码等敏感字段
    const { password: _password, ...safeUserInfo } = userInfo as UserEntity;

    return {
      userInfo: safeUserInfo,
      usersMemo,
    };
  }
}
