import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateTagDto {
  @IsString()
  @IsNotEmpty({ message: "标签名不能为空" })
  @MaxLength(50, { message: "标签名不能超过 50 个字符" })
  content: string;

  @IsOptional()
  @IsBoolean()
  is_topics?: boolean;
}
