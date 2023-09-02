import { UserService } from "@/core/user/user.service";
import { ArticleService } from "@modules/article/article.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ShareService {
  constructor(
    private readonly articleService: ArticleService,
    private readonly userService: UserService,
  ) {}

  async findUserShared(userId: string) {
    const userInfo = await this.userService.findUser(userId);
    const usersMemo = await this.articleService.findAll(userId);

    return {
      userInfo,
      usersMemo,
    };
  }
}
