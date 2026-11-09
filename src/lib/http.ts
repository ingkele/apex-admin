import axios, { type AxiosError, type AxiosProgressEvent } from 'axios'
import { mockTransport } from '@/mocks/transport'
import { useAuthStore } from '@/stores/auth.store'

/**
 * API adapter —— 框架化预留④：
 * 后端 base URL、鉴权头、错误处理、分页协议全部收敛在此文件。
 * 换后端 / 换协议只改这一处。
 *
 * 数据来源由环境变量决定：
 *   VITE_DATA_MODE=mock（默认）→ src/mocks/transport.ts 模拟数据
 *   VITE_DATA_MODE=live        → axios 调 VITE_API_BASE_URL（默认 /api）
 *
 * 能力清单：
 * - 常规 CRUD：axios 实例 + 拦截器（token 注入 / 错误归一化为 ApiError）+ 超时
 * - 文件上传：http.upload（FormData + 进度回调）
 * - 文件下载：http.download（Blob 落盘）
 * - 流式请求：http.stream（SSE / 分块读取；浏览器 axios 走 XHR 不支持流式
 *   响应体，因此该通道固定用原生 fetch + ReadableStream，属官方推荐做法）
 */

export interface PageQuery {
  page?: number
  pageSize?: number
  sort?: string
  order?: 'asc' | 'desc'
  [key: string]: unknown
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'
export type Transport = (method: Method, path: string, body?: unknown) => Promise<unknown>

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '/api'
const MODE: string = import.meta.env.VITE_DATA_MODE ?? 'mock'
const TIMEOUT: number = Number(import.meta.env.VITE_API_TIMEOUT ?? 15_000)

// —— axios 实例（live 模式） ——

const client = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
})

/** 请求拦截：注入 Bearer token */
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/** axios 错误 → ApiError 归一化（网络错误 status=0，业务错误取后端 message） */
function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err
  const ax = err as AxiosError<{ message?: string }>
  if (ax.response) {
    const message = ax.response.data?.message ?? `请求失败（${ax.response.status}）`
    // TODO(对接后端)：401 时可在此挂 token 静默刷新后重放请求
    return new ApiError(ax.response.status, message)
  }
  if (ax.code === 'ECONNABORTED') return new ApiError(0, '请求超时，请稍后重试')
  return new ApiError(0, '网络异常，请检查连接')
}

/** 响应拦截：统一抛 ApiError（mock 通道与 hooks 层的既有约定保持不变） */
client.interceptors.response.use(
  (res) => res,
  (err) => {
    throw toApiError(err)
  },
)

const axiosTransport: Transport = async (method, path, body) => {
  const res = await client.request({ method, url: path, data: body })
  return res.data
}

const transport: Transport = MODE === 'live' ? axiosTransport : mockTransport

// —— http 门面 ——

function toQueryString(query: PageQuery): string {
  return new URLSearchParams(
    Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)]) as [string, string][],
  ).toString()
}

export const http = {
  get: <T>(path: string, query?: PageQuery) =>
    transport('GET', query ? `${path}?${toQueryString(query)}` : path) as Promise<T>,
  post: <T>(path: string, body?: unknown) => transport('POST', path, body) as Promise<T>,
  put: <T>(path: string, body?: unknown) => transport('PUT', path, body) as Promise<T>,
  del: <T>(path: string) => transport('DELETE', path) as Promise<T>,

  /**
   * 文件上传 —— FormData + 上传进度回调。
   * live：axios onUploadProgress；mock：模拟进度后返回成功。
   */
  upload: <T>(path: string, form: FormData, onProgress?: (percent: number) => void): Promise<T> => {
    if (MODE === 'mock') {
      return mockUpload(form, onProgress) as Promise<T>
    }
    const token = useAuthStore.getState().token
    return client
      .post<T>(path, form, {
        // FormData 由浏览器自动设置带 boundary 的 Content-Type，勿手动覆盖
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        onUploadProgress: (e: AxiosProgressEvent) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
        },
      })
      .then((res) => res.data)
      .catch((err) => {
        throw toApiError(err)
      })
  },

  /**
   * 文件下载 —— 响应按 Blob 接收并触发浏览器落盘。
   */
  download: async (path: string, filename: string): Promise<void> => {
    let blob: Blob
    if (MODE === 'mock') {
      blob = new Blob([`# Apex Admin mock 导出\n${path}\n${new Date().toISOString()}\n`], {
        type: 'text/plain',
      })
    } else {
      try {
        const res = await client.get<Blob>(path, { responseType: 'blob' })
        blob = res.data
      } catch (err) {
        throw toApiError(err)
      }
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  },

  /**
   * 流式请求 —— SSE / 分块文本（fetch + ReadableStream 实现）。
   * 适用于 AI 对话逐字输出、日志实时推流等场景；收到的是未解析的分片，
   * SSE 格式（data: {...}\n\n）由调用方或上层封装解析。
   * mock 模式：分片模拟输出，方便演示页联调。
   */
  async stream(
    path: string,
    opts: {
      method?: 'GET' | 'POST'
      body?: unknown
      signal?: AbortSignal
      /** 每收到一个分片的回调 */
      onChunk: (text: string) => void
      /** 可选：流正常结束回调 */
      onDone?: () => void
    },
  ): Promise<void> {
    if (MODE === 'mock') {
      const chunks = [
        `data: {"path":"${path}","mode":"mock"}\n\n`,
        'data: {"delta":"Apex Admin 流式通道（mock）——"}\n\n',
        'data: {"delta":"接通后端后此处为真实 SSE 分片。"}\n\n',
        'data: [DONE]\n\n',
      ]
      for (const c of chunks) {
        if (opts.signal?.aborted) return
        await new Promise((r) => setTimeout(r, 180))
        opts.onChunk(c)
      }
      opts.onDone?.()
      return
    }
    const token = useAuthStore.getState().token
    const res = await fetch(BASE_URL + path, {
      method: opts.method ?? 'POST',
      headers: {
        Accept: 'text/event-stream',
        ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      signal: opts.signal,
    })
    if (!res.ok || !res.body) throw new ApiError(res.status, `流式请求失败（${res.status}）`)

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      opts.onChunk(decoder.decode(value, { stream: true }))
    }
    opts.onDone?.()
  },

  /** axios 原始实例 —— 需要完全自定义 config（响应类型 / 自定义 header 等）时使用，拦截器仍然生效 */
  raw: client,
}

// —— mock 模式的上传/流式模拟（让演示页在 mock 下也能跑通） ——

async function mockUpload<T>(form: FormData, onProgress?: (p: number) => void): Promise<T> {
  const file = form.get('file')
  const name = file instanceof File ? file.name : 'file'
  for (let p = 0; p <= 100; p += 20) {
    await new Promise((r) => setTimeout(r, 120))
    onProgress?.(p)
  }
  return { ok: true, name, size: file instanceof File ? file.size : 0, url: `mock://${name}` } as T
}
