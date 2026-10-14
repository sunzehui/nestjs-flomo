import { randomBytes } from "crypto";
import { In, IsNull, Repository } from "typeorm";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { UserService } from "@/core/user/user.service";
import { ArticleService } from "@modules/article/article.service";
import { ArticleEntity } from "@modules/article/entities/article.entity";
import { FindArticleQuery } from "@modules/article/dto/find-article.dto";
import { UserEntity } from "@/core/user/entities/user.entity";
import { parseId } from "@utils/id";
import { ShareSelection } from "./entities/share-selection.entity";

/** XML 文本转义 */
function escapeXml(text: string) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html: string) {
  return String(html ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

@Injectable()
export class ShareService {
  constructor(
    private readonly articleService: ArticleService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @InjectRepository(ShareSelection)
    private readonly selectionRepo: Repository<ShareSelection>,
    @InjectRepository(ArticleEntity)
    private readonly articleRepo: Repository<ArticleEntity>,
  ) {}

  async findUserShared(userId: number, query: FindArticleQuery = {}) {
    const userInfo = await this.userService.findUser(userId);
    if (!userInfo) {
      throw new NotFoundException("用户不存在");
    }

    // 必须显式传入查询条件，否则 findAll 会退化为「查询全库文章」
    const memoPage = await this.articleService.findAll(userId, {
      ...query,
      deleted: false,
    });

    // 分享页不应暴露账号密码等敏感字段
    const { password: _password, ...safeUserInfo } = userInfo as UserEntity;

    return {
      userInfo: safeUserInfo,
      usersMemo: memoPage.list,
      pagination: {
        total: memoPage.total,
        page: memoPage.page,
        pageSize: memoPage.pageSize,
        hasMore: memoPage.hasMore,
      },
    };
  }

  /** 创建精选分享，返回不可枚举的 token */
  async createSelection(
    userId: number,
    payload: { title?: string; articleIds: Array<string | number> },
  ) {
    const ids = Array.from(
      new Set((payload.articleIds ?? []).map((id) => parseId(id))),
    );
    if (ids.length === 0) {
      throw new BadRequestException("请至少选择一条 memo");
    }

    // 校验这些 memo 都属于当前用户
    const owned = await this.articleRepo.count({
      where: { id: In(ids), user: { id: userId }, deleteTime: IsNull() },
    });
    if (owned !== ids.length) {
      throw new BadRequestException("存在无权分享的 memo");
    }

    const selection = this.selectionRepo.create({
      token: randomBytes(16).toString("hex"),
      userId,
      title: (payload.title ?? "").slice(0, 100),
      articleIds: ids,
      revoked: false,
    });

    const saved = await this.selectionRepo.save(selection);
    return { token: saved.token, title: saved.title, count: ids.length };
  }

  /** 读取精选分享（无需登录） */
  async getSelection(token: string) {
    const selection = await this.selectionRepo.findOne({ where: { token } });
    if (!selection || selection.revoked) {
      throw new NotFoundException("分享不存在或已失效");
    }

    const userInfo = await this.userService.findUser(selection.userId);
    const articles = await this.articleRepo.find({
      where: {
        id: In(selection.articleIds),
        deleteTime: IsNull(),
      },
      relations: ["tags", "files"],
      order: { createTime: "DESC" },
    });

    const { password: _password, ...safeUserInfo } = (userInfo ??
      {}) as UserEntity;

    return {
      title: selection.title,
      createdAt: selection.createdAt,
      userInfo: safeUserInfo,
      usersMemo: articles.map((article) =>
        this.articleService.resolveFilePath(article),
      ),
    };
  }

  /** 撤销精选分享 */
  async revokeSelection(userId: number, token: string) {
    const selection = await this.selectionRepo.findOne({ where: { token } });
    if (!selection || selection.userId !== userId) {
      throw new NotFoundException("分享不存在");
    }
    selection.revoked = true;
    await this.selectionRepo.save(selection);
    return { token, revoked: true };
  }

  /** 某用户公开 memo 的 RSS 输出 */
  async buildFeed(userId: number) {
    const userInfo = await this.userService.findUser(userId);
    if (!userInfo) {
      throw new NotFoundException("用户不存在");
    }

    const memoPage = await this.articleService.findAll(userId, {
      pageSize: 50,
      deleted: false,
    });

    const baseUrl = (this.configService.get<string>("SERVER_URL") ?? "").replace(
      /\/+$/,
      "",
    );
    const selfLink = `${baseUrl}/api/share/feed/${userId}.xml`;
    const pageLink = `${baseUrl}/user/${userId}`;
    const nickname = escapeXml(userInfo.nickname || userInfo.username || "flomo");

    const items = memoPage.list
      .map((memo) => {
        const description = escapeXml(stripHtml(memo.content));
        const pubDate = new Date(memo.createTime).toUTCString();
        const tags = (memo.tags ?? [])
          .map((tag: { content: string }) => escapeXml(tag.content))
          .join(", ");
        return [
          "    <item>",
          `      <title>${escapeXml(stripHtml(memo.content).slice(0, 60) || "memo")}</title>`,
          `      <description>${description}</description>`,
          `      <pubDate>${pubDate}</pubDate>`,
          `      <guid isPermaLink="false">flomo-memo-${memo.id}</guid>`,
          tags ? `      <category>${tags}</category>` : "",
          "    </item>",
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n");

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0">',
      "  <channel>",
      `    <title>${nickname} 的 flomo</title>`,
      `    <link>${escapeXml(pageLink)}</link>`,
      `    <description>${nickname} 的公开 memo</description>`,
      `    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${escapeXml(selfLink)}" rel="self" type="application/rss+xml"/>`,
      `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
      items,
      "  </channel>",
      "</rss>",
    ]
      .filter(Boolean)
      .join("\n");
  }
}
