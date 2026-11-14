import axios from 'axios'
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse
} from 'axios'
import { message } from 'ant-design-vue'

export interface Result<T = unknown> {
  success: boolean
  errorMsg: string
  data: T
}

const STATUS_TEXT: Record<number, string> = {
  400: '请求错误(400)',
  401: '未授权，请重新登录(401)',
  403: '拒绝访问(403)',
  404: '请求的资源不存在(404)',
  408: '请求超时(408)',
  500: '服务器错误(500)',
  501: '服务未实现(501)',
  502: '网关错误(502)',
  503: '服务不可用(503)',
  504: '网关超时(504)',
  505: 'HTTP 版本不受支持(505)'
}

const baseURL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_BASE_URL

/** 同一错误在短时间内只提示一次，避免多个并发请求刷屏 */
let lastTip = ''
let lastTipAt = 0
function tipError(text: string) {
  const now = Date.now()
  if (text === lastTip && now - lastTipAt < 2000) return
  lastTip = text
  lastTipAt = now
  message.error(text)
}

/**
 * axios 二次封装
 * 约定后端返回 { success, errorMsg, data }，拦截器直接解包 data
 */
export class Request {
  instance: AxiosInstance

  constructor(config: AxiosRequestConfig = {}) {
    this.instance = axios.create({
      baseURL,
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
      ...config
    })

    this.instance.interceptors.request.use(
      (cfg) => {
        const token = localStorage.getItem('token')
        if (token) {
          cfg.headers.Authorization = token
        }
        return cfg
      },
      (err: Error) => Promise.reject(err)
    )

    this.instance.interceptors.response.use(
      (res: AxiosResponse<Result>) => {
        const body = res.data
        if (body && typeof body === 'object' && body.success) {
          return body as unknown as AxiosResponse
        }
        // 后端业务错误：统一提示，避免调用方拿不到原因
        const errorMsg = body?.errorMsg || '请求失败，请稍后重试'
        tipError(errorMsg)
        return Promise.reject(new Error(errorMsg))
      },
      (err: AxiosError<Result>) => {
        const status = err.response?.status
        const text =
          (status ? STATUS_TEXT[status] : '') ||
          err.response?.data?.errorMsg ||
          (err.code === 'ECONNABORTED'
            ? '请求超时，请检查网络'
            : '网络异常，请检查网络连接')

        if (status === 401) {
          // 登录态失效：清掉本地凭证
          localStorage.removeItem('token')
        }

        tipError(text)
        return Promise.reject(err)
      }
    )
  }

  public request<T>(config: AxiosRequestConfig): Promise<Result<T>> {
    return this.instance.request(config) as unknown as Promise<Result<T>>
  }

  public get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<Result<T>> {
    return this.instance.get(url, config) as unknown as Promise<Result<T>>
  }

  public post<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<Result<T>> {
    const data = config?.data ?? null
    return this.instance.post(url, data, config) as unknown as Promise<
      Result<T>
    >
  }
}

export default new Request()
