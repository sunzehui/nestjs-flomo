/**
 * 极简白名单 HTML 清洗器（零依赖）。
 *
 * 用途：清洗用户提交的 memo 富文本内容，防止存储型 XSS。
 * 策略：标签白名单 + 属性白名单；危险容器连同内容一并丢弃；
 *       URL 与 class 属性做值校验；未在白名单内的标签仅去掉标签本身，保留内部文本。
 */

const ALLOWED_TAGS = new Set([
  'p', 'br', 'div', 'span',
  'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'mark', 'sub', 'sup',
  'code', 'pre', 'blockquote', 'hr',
  'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'a', 'img',
]);

/** 所有标签都允许的属性 */
const GLOBAL_ATTRS = new Set(['class']);

/** 特定标签额外允许的属性 */
const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title']),
  img: new Set(['src', 'alt', 'title']),
};

const VOID_TAGS = new Set(['br', 'hr', 'img']);

/** 会连同内容一起被删除的危险容器 */
const DANGEROUS_CONTAINERS
  = 'script|style|iframe|object|embed|template|svg|math|link|meta|base|form';

const SAFE_URL = /^(?:https?:|mailto:|tel:|\/|#)/i;
const SAFE_CLASS = /^[\w\s-]*$/;

function sanitizeAttributes(tag: string, rawAttrs: string): string {
  const allowed = new Set([
    ...GLOBAL_ATTRS,
    ...(TAG_ATTRS[tag] ?? []),
  ]);

  const attributes: string[] = [];
  const attrPattern
    = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;

  let match: RegExpExecArray | null = attrPattern.exec(rawAttrs);
  while (match !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? '';
    // 事件处理器（on*）一律不在白名单内，会被这里直接丢弃
    if (allowed.has(name) && value !== '') {
      const isValid
        = name === 'class'
          ? SAFE_CLASS.test(value)
          : name === 'href' || name === 'src'
            ? SAFE_URL.test(value.trim())
            : true;
      if (isValid)
        attributes.push(`${name}="${value.replace(/"/g, '&quot;')}"`);
    }
    match = attrPattern.exec(rawAttrs);
  }

  if (tag === 'a' && attributes.some(attr => attr.startsWith('href=')))
    attributes.push('rel="noopener noreferrer nofollow"', 'target="_blank"');

  return attributes.length > 0 ? ` ${attributes.join(' ')}` : '';
}

export function sanitizeHtml(input?: string | null): string {
  if (!input)
    return '';

  let html = String(input);

  // 1. 删除危险容器及其内容
  html = html.replace(
    new RegExp(`<\\s*(${DANGEROUS_CONTAINERS})[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>`, 'gi'),
    '',
  );
  // 2. 删除未闭合的危险标签
  html = html.replace(
    new RegExp(`<\\s*\\/?\\s*(${DANGEROUS_CONTAINERS})(?:\\s[^>]*)?\\/?\\s*>`, 'gi'),
    '',
  );
  // 3. 删除注释（可用于绕过过滤）
  html = html.replace(/<!--[\s\S]*?-->/g, '');

  // 4. 逐标签做白名单处理
  html = html.replace(
    /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)\s*>/g,
    (_full: string, closing: string, rawTag: string, rawAttrs: string, selfClose: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag))
        return '';
      if (closing)
        return `</${tag}>`;
      const attributes = sanitizeAttributes(tag, rawAttrs);
      return VOID_TAGS.has(tag) || selfClose !== ''
        ? `<${tag}${attributes} />`
        : `<${tag}${attributes}>`;
    },
  );

  return html;
}
