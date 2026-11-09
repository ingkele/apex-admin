import { mockTransport } from '@/mocks/transport'
import { useAuthStore } from '@/stores/auth.store'

/**
 * API adapter —— 框架化预留④：
 * 后端 base URL、鉴权头、错误处理、分页协议全部收敛在此文件。
 * 换后端 / 换协议只改这一处。
 *
 * 数据来源由环境变量决定：
 *   VITE_DATA_MODE=mock（默认）→ src/mocks/transport.ts 模拟数据
 *   VITE_DATA_MODE=live        → fetch 调 VITE_API_BASE_URL（默认 /api）
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

const fetchTransport: Transport = async (method, path, body) => {
  const token = useAuthStore.getState().token
  const res = await fetch(BASE_URL + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    let message = `请求失败（${res.status}）`
    try {
      const data = (await res.json()) as { message?: string }
      if (data.message) message = data.message
    } catch {
      /* 保留默认文案 */
    }
    throw new ApiError(res.status, message)
  }
  return res.status === 204 ? null : res.json()
}

const transport: Transport = MODE === 'live' ? fetchTransport : mockTransport

export const http = {
  get: <T>(path: string, query?: PageQuery) =>
    transport('GET', query ? `${path}?${new URLSearchParams(
      Object.entries(query)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)]) as [string, string][],
    )}` : path) as Promise<T>,
  post: <T>(path: string, body?: unknown) => transport('POST', path, body) as Promise<T>,
  put: <T>(path: string, body?: unknown) => transport('PUT', path, body) as Promise<T>,
  del: <T>(path: string) => transport('DELETE', path) as Promise<T>,
}
