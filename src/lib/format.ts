/** 通用格式化工具（中文展示约定） */

export function formatDateTime(d: Date | string | number): string {
  const date = new Date(d)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}`
}

export function formatDateTimeSec(d: Date | string | number): string {
  const date = new Date(d)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${formatDateTime(d)}:${p(date.getSeconds())}`
}

/** 相对时间：刚刚 / N 分钟前 / N 小时前 / N 天前 / 日期 */
export function formatRelative(d: Date | string | number): string {
  const date = new Date(d)
  const diff = Date.now() - date.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour} 小时前`
  const day = Math.floor(hour / 24)
  if (day < 30) return `${day} 天前`
  return formatDateTime(date)
}

/** 数字缩写：1240000 → 1.24M */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

/** 千分位 */
export function formatNumber(n: number): string {
  return n.toLocaleString('zh-CN')
}

/** 秒 → 00:00:34 */
export function formatDuration(seconds: number): string {
  const p = (n: number) => String(n).padStart(2, '0')
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${p(h)}:${p(m)}:${p(s)}`
}
