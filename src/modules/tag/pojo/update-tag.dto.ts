import { OmitType, PartialType } from "@nestjs/mapped-types";
import { IsOptional, IsString } from "class-validator";
import { CreateTagDto } from "./create-tag.dto";

export class UpdateTagDto extends PartialType(OmitType(CreateTagDto, ["content"])) {
  @IsOptional()
  @IsString()
  content?: string;
}
