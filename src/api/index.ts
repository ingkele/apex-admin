/**
 * 数据请求层 barrel —— 页面统一从 '@/api' 引入，感知不到内部结构。
 *
 * 分层：
 * - query-keys.ts   TanStack Query 缓存键（qk）
 * - url.ts          API 地址统一汇总入口（urls）
 * - modules/*.ts    各业务域的 hooks + 各自的 xxxUrls 地址表
 *
 * 页面只消费 hooks；换后端时改 modules 里的 urls（或 url.ts）即可，
 * hooks 调用路径不变（adapter 见 lib/http.ts）。
 */
export * from './query-keys'
export * from './url'
export * from './modules/analytics'
export * from './modules/audit'
export * from './modules/dashboard'
export * from './modules/key'
export * from './modules/model'
export * from './modules/notification'
export * from './modules/role'
export * from './modules/service'
export * from './modules/settings'
export * from './modules/system'
export * from './modules/task'
export * from './modules/user'
