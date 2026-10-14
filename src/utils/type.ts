/**
 * 空值判断工具。
 * 语义与 lodash.isNil 一致，但自带类型收窄，且不依赖第三方类型定义。
 */

export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function isNotNil<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
