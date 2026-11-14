const rawBase = import.meta.env.VITE_API_BASE_URL || ''
const baseUrl = rawBase.replace(/\/+$/, '')

/**
 * 拼接后端静态资源地址
 * - 已经带协议 / data: / blob: 的地址原样返回
 * - 其余按环境 base 拼接，并去掉重复斜杠
 */
export function spliceImgUrl(url?: string | null): string {
  if (!url) return ''
  if (/^(https?:)?\/\//i.test(url) || /^(data|blob):/i.test(url)) return url
  return `${baseUrl}/${url.replace(/^\/+/, '')}`
}

/**
 * 上传接口地址
 * 开发环境走 vite 代理（/api），生产环境直连 VITE_API_BASE_URL
 */
export const uploadAction = import.meta.env.DEV
  ? '/api/upload/uploadImg'
  : `${baseUrl}/upload/uploadImg`
