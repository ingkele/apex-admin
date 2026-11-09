import type { Transport } from '@/lib/http'
import type { PageQuery, PageResult } from '@/lib/http'
import {
  analyticsErrors, analyticsHeat, analyticsInsights, analyticsKpis, analyticsLatency,
  analyticsModels, analyticsSources, analyticsTrend,
  apiKeys, auditLogs, auditStats, dashboardHealth, dashboardStats, depts, deptStats, dictTypes,
  logLines, logStats, menuStats, models, roles, services, serviceStats, settings, systemMenus,
  taskSummary, tasks, taskTrend, userStats, users,
  type AuditItem, type Task,
} from './db'

/** Mock 传输层：按 path 分发到内存数据，模拟延迟与分页。 */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function paginate<T>(all: T[], query: URLSearchParams): PageResult<T> {
  const page = Math.max(1, Number(query.get('page') ?? 1))
  const pageSize = Math.max(1, Number(query.get('pageSize') ?? 10))
  const start = (page - 1) * pageSize
  return { items: all.slice(start, start + pageSize), total: all.length, page, pageSize }
}

type Handler = (params: Record<string, string>, query: URLSearchParams, body: Record<string, unknown>) => unknown

interface Route {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  pattern: RegExp
  keys: string[]
  handler: Handler
}

function route(method: Route['method'], path: string, handler: Handler): Route {
  const keys: string[] = []
  const pattern = new RegExp(
    '^' + path.replace(/:([A-Za-z_]+)/g, (_m, k: string) => {
      keys.push(k)
      return '([^/]+)'
    }) + '$',
  )
  return { method, pattern, keys, handler }
}

/** 内存可变状态（演示写操作能即时反馈） */
const mutable = {
  tasks: [...tasks],
  models: [...models],
  apiKeys: [...apiKeys],
  users: [...users],
  settings: JSON.parse(JSON.stringify(settings)) as typeof settings,
  dashboardLayout: null as unknown,
  systemMenus: [...systemMenus],
  depts: [...depts],
  dictTypes: JSON.parse(JSON.stringify(dictTypes)) as typeof dictTypes,
}

const routes: Route[] = [
  // —— 工作台 ——
  route('GET', '/dashboard/overview', () => ({
    taskSummary,
    serviceStats,
    userStats,
    auditStats,
    dashboardStats,
    dashboardHealth,
    failedTasks: mutable.tasks.filter((t) => t.status === 'failed').slice(0, 4),
    updatedAt: new Date().toISOString(),
  })),
  route('GET', '/dashboard/trend', () => taskTrend),

  // —— 分析页 ——
  route('GET', '/analytics', (_p, query) => {
    const range = query.get('range') === '30d' ? '30d' : '7d'
    return {
      range,
      kpis: analyticsKpis,
      trend: analyticsTrend(range),
      sources: analyticsSources,
      latency: analyticsLatency,
      errors: analyticsErrors,
      heat: analyticsHeat,
      models: analyticsModels,
      insights: analyticsInsights,
      updatedAt: new Date().toISOString(),
    }
  }),

  // —— 任务 ——
  route('GET', '/tasks', (_p, query) => {
    let list: Task[] = [...mutable.tasks]
    const keyword = query.get('keyword')
    const status = query.get('status')
    const type = query.get('type')
    if (keyword) list = list.filter((t) => t.name.includes(keyword) || t.id.includes(keyword))
    if (status && status !== 'all') list = list.filter((t) => t.status === status)
    if (type && type !== 'all') list = list.filter((t) => t.type === type)
    return paginate(list, query)
  }),
  route('GET', '/tasks/summary', () => taskSummary),
  route('GET', '/tasks/:id', (params) => {
    const t = mutable.tasks.find((x) => x.id === params.id)
    if (!t) throw new Error('任务不存在')
    // 明细已提供 timeline 的（如演示任务）直接透出，其余按状态推导
    if (t.timeline?.length) return t
    return {
      ...t,
      timeline: [
        { label: '提交', at: t.createdAt, state: 'done' },
        { label: '排队', at: t.createdAt, state: 'done' },
        { label: '执行', at: t.createdAt, state: t.status === 'queued' ? 'pending' : 'done' },
        {
          label: t.status === 'failed' ? '失败' : t.status === 'success' ? '完成' : '执行中',
          at: t.createdAt,
          state: t.status === 'success' ? 'done' : 'current',
        },
      ],
    }
  }),
  route('POST', '/tasks/:id/retry', (params) => {
    const t = mutable.tasks.find((x) => x.id === params.id)
    if (t) { t.status = 'queued'; t.failReason = undefined }
    return { ok: true }
  }),
  route('POST', '/tasks/:id/cancel', (params) => {
    const t = mutable.tasks.find((x) => x.id === params.id)
    if (t) t.status = 'cancelled'
    return { ok: true }
  }),
  route('POST', '/tasks', (_p, _q, body) => {
    const t: Task = {
      id: `tsk_${Math.random().toString(16).slice(2, 10)}`,
      name: String(body.name ?? '新任务'),
      status: 'queued',
      type: String(body.type ?? '批处理推理'),
      model: String(body.model ?? 'gpt-4o'),
      submitter: '陈昊',
      durationSec: 0,
      createdAt: new Date().toISOString(),
    }
    mutable.tasks.unshift(t)
    return t
  }),

  // —— 服务 ——
  route('GET', '/services', () => services),
  route('GET', '/services/stats', () => serviceStats),
  route('GET', '/logs', (_p, query) => {
    let list = [...logLines]
    const service = query.get('service')
    const level = query.get('level')
    const keyword = query.get('keyword')
    if (service && service !== 'all') list = list.filter((l) => l.service === service)
    if (level && level !== 'all') list = list.filter((l) => l.level === level)
    if (keyword) {
      const kw = keyword.toLowerCase()
      list = list.filter((l) => l.message.toLowerCase().includes(kw) || l.trace.toLowerCase().includes(kw) || l.service.includes(kw))
    }
    return list
  }),
  route('GET', '/logs/stats', () => logStats),
  route('GET', '/services/:id/logs', () => logLines),
  route('POST', '/services/:id/restart', () => ({ ok: true })),

  // —— 模型 ——
  route('GET', '/models', () => mutable.models),
  route('POST', '/models/:id/default', (params) => {
    mutable.models.forEach((m) => { m.isDefault = m.id === params.id })
    return { ok: true }
  }),
  route('POST', '/models/:id/test', () => ({ ok: true, latencyMs: 142 })),
  route('PUT', '/models/:id/params', (params, _q, body) => {
    const m = mutable.models.find((x) => x.id === params.id)
    if (m) m.params = { ...m.params, ...(body.params as object) }
    return { ok: true }
  }),
  route('POST', '/models/sync', () => ({ ok: true, added: 0, updated: 2 })),
  route('PUT', '/models/:id/status', (params, _q, body) => {
    const m = mutable.models.find((x) => x.id === params.id)
    if (m) m.status = body.status === 'enabled' ? 'enabled' : 'disabled'
    return { ok: true }
  }),

  // —— API Key ——
  route('GET', '/keys', () => mutable.apiKeys),
  route('POST', '/keys', (_p, _q, body) => {
    const secret = `sk-live-${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 6)}`
    const item = {
      id: `key_${Math.random().toString(16).slice(2, 6)}`,
      name: String(body.name ?? '新密钥'),
      maskedKey: `${secret.slice(0, 10)}••••••••••${secret.slice(-4)}`,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      status: 'active' as const,
      callsMonth: 0,
      lastUsedAt: '—',
      owner: '陈昊',
      env: 'prod' as const,
    }
    mutable.apiKeys.unshift(item)
    return { ...item, secret } // 明文只在创建时返回一次
  }),
  route('POST', '/keys/:id/revoke', (params) => {
    const k = mutable.apiKeys.find((x) => x.id === params.id)
    if (k) k.status = 'revoked'
    return { ok: true }
  }),

  // —— 用户 ——
  route('GET', '/users', (_p, query) => {
    let list = [...mutable.users]
    const keyword = query.get('keyword')
    if (keyword) list = list.filter((u) => u.name.includes(keyword) || u.email.includes(keyword))
    return paginate(list, query)
  }),
  route('GET', '/users/stats', () => userStats),
  route('PUT', '/users/:id/role', (params, _q, body) => {
    const u = mutable.users.find((x) => x.id === params.id)
    if (u) u.roles = [String(body.role)]
    return { ok: true }
  }),
  route('POST', '/users/:id/status', (params, _q, body) => {
    const u = mutable.users.find((x) => x.id === params.id)
    if (u) u.status = body.status as typeof u.status
    return { ok: true }
  }),
  route('POST', '/users/invite', (_p, _q, body) => {
    const u = {
      id: `usr_${Math.random().toString(16).slice(2, 6)}`,
      name: String(body.name ?? '新成员'),
      email: String(body.email ?? 'new@apex.ai'),
      roles: [String(body.role ?? '只读访客')],
      sub: '新成员 · 待加入',
      status: 'invited' as const,
      lastLoginAt: '—',
    }
    mutable.users.push(u)
    return u
  }),

  // —— 角色 ——
  route('GET', '/roles', () => roles),
  route('PUT', '/roles/:id/permissions', () => ({ ok: true })),
  route('POST', '/roles', (_p, _q, body) => ({ id: `role_${Date.now()}`, name: String(body.name ?? '新角色') })),

  // —— 审计 ——
  route('GET', '/audit', (_p, query) => {
    let list: AuditItem[] = [...auditLogs]
    const keyword = query.get('keyword')
    const risk = query.get('risk')
    const operator = query.get('operator')
    const type = query.get('type')
    const result = query.get('result')
    if (keyword) list = list.filter((a) => a.action.includes(keyword) || a.operator.includes(keyword) || a.target.includes(keyword))
    if (risk && risk !== 'all') list = list.filter((a) => a.risk === risk)
    if (operator && operator !== 'all') list = list.filter((a) => a.operator === operator)
    if (result && result !== 'all') list = list.filter((a) => a.result === result)
    if (type && type !== 'all') {
      const matchers: Record<string, string[]> = {
        login: ['登录'],
        perm: ['角色', '权限', '成员'],
        config: ['参数', '配置', '策略'],
        key: ['API Key', '密钥'],
        service: ['服务', '扩容'],
        export: ['导出'],
      }
      const kws = matchers[type] ?? []
      list = list.filter((a) => kws.some((k) => a.action.includes(k) || a.target.includes(k)))
    }
    return paginate(list, query)
  }),
  route('GET', '/audit/stats', () => auditStats),
  route('GET', '/audit/:id', (params) => {
    const a = auditLogs.find((x) => x.id === params.id)
    if (!a) throw new Error('记录不存在')
    return a
  }),

  // —— 系统参数 ——
  route('GET', '/settings', () => mutable.settings),
  route('PUT', '/settings', (_p, _q, body) => {
    for (const [group, items] of Object.entries(body.settings as Record<string, { key: string; value: string }[]>)) {
      const target = mutable.settings[group]
      if (!target) continue
      for (const it of items) {
        const found = target.find((t) => t.key === it.key)
        if (found) found.value = it.value
      }
    }
    return { ok: true }
  }),

  // —— 菜单管理 ——
  route('GET', '/system/menus', () => ({ items: mutable.systemMenus, stats: menuStats })),
  route('POST', '/system/menus', (_p, _q, body) => {
    const name = String(body.name ?? '').trim()
    if (!name) throw new Error('菜单名称不能为空')
    const node = {
      id: `m_${Date.now().toString(36)}`,
      name,
      type: (body.type as 'dir' | 'menu' | 'button') ?? 'menu',
      perm: body.perm ? String(body.perm) : undefined,
      path: body.path ? String(body.path) : undefined,
      component: body.component ? String(body.component) : undefined,
      sort: Number(body.sort ?? 99),
      status: (body.status as 'active' | 'hidden') ?? 'active',
      parentId: body.parentId ? String(body.parentId) : null,
      remark: body.remark ? String(body.remark) : undefined,
    }
    mutable.systemMenus.push(node)
    return node
  }),
  route('PUT', '/system/menus/:id/status', (params) => {
    const node = mutable.systemMenus.find((m) => m.id === params.id)
    if (!node) throw new Error('菜单不存在')
    node.status = node.status === 'active' ? 'hidden' : 'active'
    return node
  }),
  route('DELETE', '/system/menus/:id', (params) => {
    const idx = mutable.systemMenus.findIndex((m) => m.id === params.id)
    if (idx < 0) throw new Error('菜单不存在')
    if (mutable.systemMenus.some((m) => m.parentId === params.id)) throw new Error('请先删除下级菜单')
    mutable.systemMenus.splice(idx, 1)
    return { ok: true }
  }),

  // —— 部门管理 ——
  route('GET', '/system/depts', () => ({ items: mutable.depts, stats: deptStats })),
  route('POST', '/system/depts', (_p, _q, body) => {
    const name = String(body.name ?? '').trim()
    if (!name) throw new Error('部门名称不能为空')
    const node = {
      id: `d_${Date.now().toString(36)}`,
      name,
      owner: String(body.owner ?? '待指派'),
      members: Number(body.members ?? 0),
      status: 'active' as const,
      sort: Number(body.sort ?? 99),
      parentId: body.parentId ? String(body.parentId) : null,
      desc: body.desc ? String(body.desc) : undefined,
    }
    mutable.depts.push(node)
    return node
  }),

  // —— 字典管理 ——
  route('GET', '/system/dicts', () => mutable.dictTypes),
  route('POST', '/system/dicts/:code/items', (params, _q, body) => {
    const type = mutable.dictTypes.find((d) => d.code === params.code)
    if (!type) throw new Error('字典类型不存在')
    const label = String(body.label ?? '').trim()
    const value = String(body.value ?? '').trim()
    if (!label || !value) throw new Error('标签与键值均不能为空')
    if (type.items.some((i) => i.value === value)) throw new Error('键值已存在')
    const item = {
      label, value,
      tone: (body.tone as 'brand' | 'green' | 'amber' | 'rose' | 'slate') ?? 'slate',
      sort: Number(body.sort ?? type.items.length + 1),
      status: 'active' as const,
      remark: body.remark ? String(body.remark) : undefined,
    }
    type.items.push(item)
    return item
  }),

  // —— 用户偏好（工作台布局持久化，§6.6）——
  route('GET', '/user/preferences/dashboard-layout', () => mutable.dashboardLayout ?? { version: 1, layouts: null }),
  route('PUT', '/user/preferences/dashboard-layout', (_p, _q, body) => {
    // 服务端白名单校验：item 数量上限 + 坐标边界 + i 白名单（§6.5）
    const layouts = body.layouts as Record<string, { i: string; x: number; y: number; w: number; h: number }[]> | null
    if (layouts) {
      for (const items of Object.values(layouts)) {
        if (items.length > 30) throw new Error('布局项超出上限（≤30）')
        for (const it of items) {
          if (!/^[\w-]{1,32}$/.test(it.i)) throw new Error('布局项 id 非法')
          if ([it.x, it.y, it.w, it.h].some((n) => !Number.isInteger(n) || n < 0 || n > 100)) throw new Error('布局坐标越界')
        }
      }
    }
    mutable.dashboardLayout = { version: 1, layouts }
    return { ok: true }
  }),
]

export const mockTransport: Transport = async (method, path, body) => {
  await sleep(120 + Math.random() * 200)
  const [pathname, search = ''] = path.split('?')
  const query = new URLSearchParams(search)

  for (const r of routes) {
    if (r.method !== method) continue
    const m = r.pattern.exec(pathname)
    if (!m) continue
    const params: Record<string, string> = {}
    r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]) })
    try {
      return r.handler(params, query, (body ?? {}) as Record<string, unknown>)
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : '操作失败')
    }
  }
  throw new Error(`Mock 未实现的接口：${method} ${path}`)
}

export type { PageQuery, PageResult }
