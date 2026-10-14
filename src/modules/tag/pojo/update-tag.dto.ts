import { OmitType, PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { CreateTagDto } from "./create-tag.dto";

export class UpdateTagDto extends PartialType(
  OmitType(CreateTagDto, ["content"]),
) {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  is_topics?: boolean;

  /** 父标签 id；传 null 表示移动到顶层 */
  @IsOptional()
  parentId?: number | null;
}
