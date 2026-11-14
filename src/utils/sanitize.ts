const BLOCKED_TAG = /<(script|style|iframe|object|embed|link|meta|form)[^>]*>[\s\S]*?<\/\1>|<(script|style|iframe|object|embed|link|meta|form)[^>]*\/?>/gi

/**
 * 富文本消毒：移除脚本类标签、内联事件、javascript: 协议
 */
export function sanitizeHtml(html?: string | null): string {
  if (!html) return ''
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(BLOCKED_TAG, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*(\2)/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*(javascript:[^\s>]+)/gi, '$1="#"')
}

/** 把富文本压成纯文本摘要 */
export function toPlainText(html?: string | null, max = 0): string {
  const text = sanitizeHtml(html)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()

  return max > 0 && text.length > max ? `${text.slice(0, max)}…` : text
}
