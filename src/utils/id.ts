import { BadRequestException } from "@nestjs/common";

/**
 * 把路由参数里的 id 转成实体主键类型（自增整数），并做基础校验。
 * 主键在实体中声明的类型是 number，直接传 string 会造成类型不一致与查询歧义。
 */
export function parseId(id: string | number): number {
  const value = typeof id === "number" ? id : Number(id);
  if (!Number.isInteger(value) || value <= 0) {
    throw new BadRequestException("无效的资源 ID");
  }
  return value;
}
