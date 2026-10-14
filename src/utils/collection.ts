/**
 * 按 `content` 字段去重，保留首次出现的元素。
 * 等价于 lodash.uniqBy(items, 'content')，但无需引入第三方依赖。
 */
export function uniqByContent<T extends { content: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (seen.has(item.content)) continue;
    seen.add(item.content);
    result.push(item);
  }
  return result;
}
