import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { ArticleEntity } from "@modules/article/entities/article.entity";
import { Tag } from "@modules/tag/entities/tag.entity";
import { sanitizeHtml } from "@utils/sanitize";

export interface ExportMemoItem {
  id: number;
  content: string;
  tags: string[];
  createTime: string;
  updateTime: string;
  is_topic: boolean;
}

export interface ImportMemoItem {
  content: string;
  tags?: string[];
  createTime?: string;
  is_topic?: boolean;
}

/** 去掉 html 标签并还原常见实体，用于导出 markdown */
function stripHtml(html: string) {
  return (html ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepo: Repository<ArticleEntity>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  /** 导出当前用户的全部 memo */
  async export(userId: number, format: "json" | "md" = "json") {
    const articles = await this.articleRepo.find({
      where: { user: { id: userId }, deleteTime: IsNull() },
      relations: ["tags"],
      order: { createTime: "ASC" },
    });

    const records: ExportMemoItem[] = articles.map((article) => ({
      id: article.id,
      content: article.content,
      tags: (article.tags ?? []).map((tag) => tag.content),
      createTime: article.createTime,
      updateTime: article.updateTime,
      is_topic: article.is_topic,
    }));

    const date = todayString();

    if (format === "md") {
      const content = records
        .map((record) => {
          const tagLine = record.tags.length
            ? `\n\n${record.tags.map((tag) => `#${tag}`).join(" ")}`
            : "";
          return `## ${record.createTime}\n\n${stripHtml(record.content)}${tagLine}`;
        })
        .join("\n\n---\n\n");

      return {
        format,
        filename: `flomo-export-${date}.md`,
        total: records.length,
        content,
      };
    }

    return {
      format: "json",
      filename: `flomo-export-${date}.json`,
      total: records.length,
      content: JSON.stringify(
        {
          version: 1,
          exportedAt: new Date().toISOString(),
          memos: records,
        },
        null,
        2,
      ),
    };
  }

  /**
   * 导入 memo。
   * 以「content 完全相同」判重，整体在一个事务里执行，失败则全部回滚。
   */
  async import(
    userId: number,
    payload: { memos?: ImportMemoItem[] } | ImportMemoItem[],
  ) {
    const items: ImportMemoItem[] = Array.isArray(payload)
      ? payload
      : (payload?.memos ?? []);

    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException("没有可导入的数据");
    }
    if (items.length > 5000) {
      throw new BadRequestException("单次导入不能超过 5000 条");
    }

    const existing = await this.articleRepo.find({
      where: { user: { id: userId } },
      select: ["id", "content"],
      withDeleted: true,
    });
    const known = new Set(existing.map((article) => article.content));

    let imported = 0;
    let skipped = 0;

    await this.articleRepo.manager.transaction(async (manager) => {
      const tagRepo = manager.getRepository(Tag);
      const articleRepo = manager.getRepository(ArticleEntity);

      for (const item of items) {
        const rawContent = typeof item?.content === "string" ? item.content : "";
        if (!rawContent.trim()) {
          skipped += 1;
          continue;
        }

        // 导入内容同样要过白名单清洗，避免绕过 XSS 防护
        const content = sanitizeHtml(rawContent);
        if (known.has(content)) {
          skipped += 1;
          continue;
        }
        known.add(content);

        const tagNames = Array.from(
          new Set(
            (item.tags ?? [])
              .map((tag) => String(tag).trim())
              .filter(Boolean),
          ),
        );

        const tags: Tag[] = [];
        for (const name of tagNames) {
          let tag = await tagRepo.findOne({
            where: { content: name, user: { id: userId } },
            withDeleted: true,
          });
          if (!tag) {
            tag = await tagRepo.save(
              tagRepo.create({ content: name, user: { id: userId } }),
            );
          } else if (tag.deleteTime) {
            await tagRepo.restore(tag.id);
            tag.deleteTime = null;
          }
          tags.push(tag);
        }

        await articleRepo.save(
          articleRepo.create({
            content,
            user: { id: userId },
            tags,
            is_topic: Boolean(item.is_topic),
          }),
        );
        imported += 1;
      }
    });

    return { total: items.length, imported, skipped };
  }
}
