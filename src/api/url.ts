/**
 * API 地址统一入口 —— 后端接口变动时，改这里或对应模块文件即可，hooks 层零改动。
 *
 * 组织方式（模块化引入式）：
 * - 各业务域的地址表在 `modules/*.ts` 中各自维护（`xxxUrls`，动态路径为工厂函数）；
 * - 本文件将其聚合为 `urls` 命名空间，供需要集中查看/引用的场景使用；
 * - 页面仍然统一从 `@/api` 引入 hooks，不感知 URL 细节。
 */
import { analyticsUrls } from './modules/analytics'
import { auditUrls } from './modules/audit'
import { dashboardUrls } from './modules/dashboard'
import { keyUrls } from './modules/key'
import { modelUrls } from './modules/model'
import { notificationUrls } from './modules/notification'
import { roleUrls } from './modules/role'
import { serviceUrls } from './modules/service'
import { settingsUrls } from './modules/settings'
import { systemUrls } from './modules/system'
import { taskUrls } from './modules/task'
import { userUrls } from './modules/user'

/** 全量 API 地址表（按业务域分组） */
export const urls = {
  dashboard: dashboardUrls,
  task: taskUrls,
  service: serviceUrls,
  model: modelUrls,
  key: keyUrls,
  user: userUrls,
  role: roleUrls,
  audit: auditUrls,
  settings: settingsUrls,
  system: systemUrls,
  analytics: analyticsUrls,
  notification: notificationUrls,
} as const

export type ApiUrls = typeof urls
