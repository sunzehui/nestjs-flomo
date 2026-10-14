import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

/** 把 query 中的 "true" / "1" 等字符串归一为 boolean */
const toBoolean = ({ value }: { value: unknown }): unknown => {
  if (value === true || value === 1 || value === "1" || value === "true")
    return true;
  if (value === false || value === 0 || value === "0" || value === "false")
    return false;
  return value;
};

export type TagFilterMode = "and" | "or";
export type ArticleSort = "time_desc" | "time_asc" | "relevance";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export class FindArticleQuery {
  /** 是否查询回收站（软删除）里的数据 */
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  deleted?: boolean;

  /** 单标签筛选（向后兼容） */
  @IsOptional()
  @IsString()
  tag?: string;

  /** 整串关键词（短语匹配，向后兼容） */
  @IsOptional()
  @IsString()
  content?: string;

  /** 多关键词，空格或逗号分隔，AND 语义 */
  @IsOptional()
  @IsString()
  keywords?: string;

  /** 多标签，逗号分隔 */
  @IsOptional()
  @IsString()
  tags?: string;

  /** 多标签组合模式，默认 or */
  @IsOptional()
  @IsIn(["and", "or"])
  tagMode?: TagFilterMode;

  /** 起始日期 yyyy-MM-dd（含） */
  @IsOptional()
  @IsString()
  from?: string;

  /** 结束日期 yyyy-MM-dd（含） */
  @IsOptional()
  @IsString()
  to?: string;

  /** 只看包含图片的 memo */
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  hasImage?: boolean;

  /** 排序方式 */
  @IsOptional()
  @IsIn(["time_desc", "time_asc", "relevance"])
  sort?: ArticleSort;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  pageSize?: number;
}
