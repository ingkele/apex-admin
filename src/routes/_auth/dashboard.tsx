import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Responsive as ResponsiveGridLayout, noCompactor, useContainerWidth, type Layout } from 'react-grid-layout'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  ArrowRight, ArrowUpRight, Check, CircleAlert, CircleX, Download, GripVertical,
  ListChecks, LoaderCircle, Palette, PencilLine, Plus, RefreshCw, RotateCcw, RotateCw, Save, Sparkles, Target, TriangleAlert,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { AppSelect } from '@/components/ui/select'
import { PageHeader } from '@/components/shared/page-header'
import { LiveBadge, MiniBars, StatBadge, StatTile } from '@/components/shared/stat-tile'
import { ACCENTS, ACCENT_LABELS, useThemeStore, type AccentKey } from '@/stores/theme.store'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import {
  useDashboardLayoutPref, useDashboardOverview, useSaveDashboardLayout,
  useTaskActions, useTaskTrend,
} from '@/api'
import { cn } from '@/lib/utils'
import 'react-grid-layout/css/styles.css'

export const Route = createFileRoute('/_auth/dashboard')({
  component: DashboardPage,
})

/** 布局本地持久化键（mock 阶段内存态刷新即失，落 localStorage 保证刷新后仍在） */
const LAYOUT_LS_KEY = 'apex-dashboard-layout'

function readCachedLayouts(): Record<string, Layout> | null {
  try {
    const raw = localStorage.getItem(LAYOUT_LS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, Layout>) : null
  } catch {
    return null
  }
}

function cacheLayouts(next: Record<string, Layout>) {
  try {
    localStorage.setItem(LAYOUT_LS_KEY, JSON.stringify(next))
  } catch {
    /* 隐私模式等写入失败时忽略 */
  }
}

/** 12 列栅格：与原型 col-span 一一对应（趋势 8 + 右侧留 4 空，用 noCompactor 保留空位） */
const DEFAULT_LAYOUTS: Record<string, Layout> = {
  lg: [
    { i: 'stat-today', x: 0, y: 0, w: 3, h: 5, minW: 3, minH: 5, maxW: 6 },
    { i: 'stat-success', x: 3, y: 0, w: 3, h: 5, minW: 3, minH: 5, maxW: 6 },
    { i: 'stat-failed', x: 6, y: 0, w: 3, h: 5, minW: 3, minH: 5, maxW: 6 },
    { i: 'stat-running', x: 9, y: 0, w: 3, h: 5, minW: 3, minH: 5, maxW: 6 },
    { i: 'trend', x: 0, y: 5, w: 8, h: 9, minW: 6, minH: 6 },
    { i: 'preset', x: 0, y: 14, w: 5, h: 8, minW: 4, minH: 6 },
    { i: 'preview', x: 5, y: 14, w: 7, h: 8, minW: 5, minH: 6 },
    { i: 'health', x: 0, y: 22, w: 4, h: 9, minW: 4, minH: 6 },
    { i: 'failed', x: 0, y: 31, w: 12, h: 10, minW: 6, minH: 6 },
  ],
  md: [
    { i: 'stat-today', x: 0, y: 0, w: 5, h: 5, minW: 4, minH: 5 },
    { i: 'stat-success', x: 5, y: 0, w: 5, h: 5, minW: 4, minH: 5 },
    { i: 'stat-failed', x: 0, y: 5, w: 5, h: 5, minW: 4, minH: 5 },
    { i: 'stat-running', x: 5, y: 5, w: 5, h: 5, minW: 4, minH: 5 },
    { i: 'trend', x: 0, y: 10, w: 10, h: 9, minW: 6, minH: 6 },
    { i: 'preset', x: 0, y: 19, w: 10, h: 8, minW: 4, minH: 6 },
    { i: 'preview', x: 0, y: 27, w: 10, h: 8, minW: 5, minH: 6 },
    { i: 'health', x: 0, y: 35, w: 10, h: 9, minW: 4, minH: 6 },
    { i: 'failed', x: 0, y: 44, w: 10, h: 10, minW: 6, minH: 6 },
  ],
}

/** 各断点的栅格列数（自动排序需要） */
const BP_COLS: Record<string, number> = { lg: 12, md: 10 }

/**
 * 自动排序：按当前「从上到下、从左到右」的顺序做首次适配装箱，
 * 保留每张卡的宽高，消除拖拽产生的空洞，紧凑铺满栅格。
 */
function autoArrangeLayouts(layouts: Record<string, Layout>): Record<string, Layout> {
  const out: Record<string, Layout> = {}
  for (const [bp, items] of Object.entries(layouts)) {
    const cols = BP_COLS[bp] ?? 12
    const occupied: boolean[][] = []
    const fits = (x: number, y: number, w: number, h: number) => {
      if (x + w > cols) return false
      for (let yy = y; yy < y + h; yy++) {
        const row = occupied[yy] ?? (occupied[yy] = [])
        for (let xx = x; xx < x + w; xx++) if (row[xx]) return false
      }
      return true
    }
    const place = (x: number, y: number, w: number, h: number) => {
      for (let yy = y; yy < y + h; yy++) {
        const row = occupied[yy] ?? (occupied[yy] = [])
        for (let xx = x; xx < x + w; xx++) row[xx] = true
      }
    }
    const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x)
    out[bp] = sorted.map((it) => {
      const w = Math.min(it.w, cols)
      for (let y = 0; ; y++) {
        for (let x = 0; x + w <= cols; x++) {
          if (fits(x, y, w, it.h)) {
            place(x, y, w, it.h)
            return { ...it, x, y, w }
          }
        }
      }
    })
  }
  return out
}

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

function dateLabel(d: Date) {
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · ${WEEKDAYS[d.getDay()]}`
}

function greetingOf(hour: number) {
  if (hour < 6) return '凌晨好'
  if (hour < 11) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

function clockOf(d: Date | string | undefined) {
  if (!d) return '—'
  const t = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(t.getTime())) return '—'
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(t.getHours())}:${p(t.getMinutes())}:${p(t.getSeconds())}`
}

function failTimeOf(iso: string) {
  const t = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(t.getMonth() + 1)}-${p(t.getDate())} ${p(t.getHours())}:${p(t.getMinutes())}:${p(t.getSeconds())}`
}

/** 卡片右上角拖拽手柄（原型：悬停显现的 grip 图标；编辑态常显） */
function DragHandle({ visible = false }: { visible?: boolean }) {
  return (
    <div
      className={cn(
        'dash-drag-handle absolute right-3 top-3 z-20 cursor-grab rounded-md p-1 text-soft transition hover:bg-hover hover:text-muted group-hover:opacity-100 active:cursor-grabbing',
        visible ? 'opacity-100' : 'opacity-0',
      )}
      title="拖拽调整位置"
    >
      <GripVertical className="h-4 w-4" />
    </div>
  )
}

function DashboardPage() {
  const overview = useDashboardOverview()
  const trend = useTaskTrend()
  const { retry } = useTaskActions()
  const { data: pref } = useDashboardLayoutPref()
  const saveLayout = useSaveDashboardLayout()
  const { width, containerRef } = useContainerWidth()

  const user = useAuthStore((s) => s.user)
  const accent = useThemeStore((s) => s.accent)
  const setAccent = useThemeStore((s) => s.setAccent)
  const resetTheme = useThemeStore((s) => s.reset)
  const openThemeDrawer = useUiStore((s) => s.openThemeDrawer)

  const [layouts, setLayouts] = React.useState<Record<string, Layout>>(
    () => readCachedLayouts() ?? DEFAULT_LAYOUTS,
  )
  const [env, setEnv] = React.useState('all')
  const [now, setNow] = React.useState(new Date())
  const [editing, setEditing] = React.useState(false)
  const restored = React.useRef(false)
  const lastSaved = React.useRef('')
  /** 进入编辑模式时的布局快照，取消时回滚 */
  const snapshot = React.useRef<Record<string, Layout>>(DEFAULT_LAYOUTS)

  React.useEffect(() => {
    if (!restored.current && pref?.layouts) {
      setLayouts(pref.layouts as unknown as Record<string, Layout>)
      restored.current = true
    }
  }, [pref])

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const data = overview.data
  const stats = data?.dashboardStats
  const health = data?.dashboardHealth ?? []
  const failedTasks = data?.failedTasks ?? []
  const userName = user?.name ?? '管理员'

  const handleLayoutChange = (_current: Layout, all: unknown) => {
    const next = all as Record<string, Layout>
    setLayouts(next)
    // 编辑模式下只改本地，退出时统一保存/取消
    if (editing) return
    const key = JSON.stringify(next)
    if (lastSaved.current === key) return
    lastSaved.current = key
    cacheLayouts(next)
    saveLayout.mutate(next as never)
  }

  const enterEdit = () => {
    snapshot.current = layouts
    setEditing(true)
  }

  const exitEdit = (mode: 'save' | 'cancel' | 'reset') => {
    let next = layouts
    if (mode === 'cancel') next = snapshot.current
    if (mode === 'reset') next = DEFAULT_LAYOUTS
    setLayouts(next)
    setEditing(false)
    if (mode === 'save') {
      lastSaved.current = JSON.stringify(next)
      cacheLayouts(next)
      saveLayout.mutate(next as never)
      toast.success('布局已保存', { description: '刷新页面后仍会保持' })
    } else if (mode === 'cancel') {
      toast.info('已放弃布局更改')
    } else {
      lastSaved.current = JSON.stringify(DEFAULT_LAYOUTS)
      cacheLayouts(DEFAULT_LAYOUTS)
      saveLayout.mutate(DEFAULT_LAYOUTS as never)
      toast.success('已恢复默认布局')
    }
  }

  const autoArrange = () => {
    setLayouts((cur) => autoArrangeLayouts(cur))
    toast.success('已自动排序', { description: '卡片已紧凑重排，确认后点击「保存布局」' })
  }

  return (
    <div>
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            {dateLabel(now)}
            <span className="text-soft">·</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              全部服务正常
            </span>
          </span>
        }
        title="工作台"
        description={`${greetingOf(now.getHours())}，${userName}。这里是平台今日的运行概览与待处理事项。`}
        actions={
          editing ? (
            <>
              <Button variant="outline" size="sm" onClick={autoArrange}>
                <Sparkles className="h-3.5 w-3.5" /> 自动排序
              </Button>
              <Button variant="outline" size="sm" onClick={() => exitEdit('reset')}>
                <RotateCcw className="h-3.5 w-3.5" /> 恢复默认
              </Button>
              <Button variant="outline" size="sm" onClick={() => exitEdit('cancel')}>
                取消
              </Button>
              <Button size="sm" onClick={() => exitEdit('save')}>
                <Save className="h-3.5 w-3.5" /> 保存布局
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={enterEdit}>
                <PencilLine className="h-3.5 w-3.5" /> 编辑布局
              </Button>
              <Button variant="outline" size="sm" onClick={() => { overview.refetch(); trend.refetch() }}>
                <RefreshCw className="h-3.5 w-3.5" /> 刷新数据
              </Button>
              <Link to="/tasks">
                <Button size="sm">
                  <Plus className="h-3.5 w-3.5" /> 新建任务
                </Button>
              </Link>
            </>
          )
        }
      />

      {/* 编辑态提示条 / 浏览态提示 + 数据更新时间 */}
      {editing ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand-300 bg-brand-50/60 px-4 py-2.5 dark:border-brand-500/30 dark:bg-brand-500/10">
          <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-brand-700 dark:text-brand-300">
            <PencilLine className="h-3.5 w-3.5" />
            编辑模式：按住手柄拖拽调位置 · 拖右下角调大小（统计卡最小 3 列）
          </span>
          <span className="text-[11px] text-brand-600/80 dark:text-brand-300/70">
            更改暂未生效，保存后应用
          </span>
        </div>
      ) : (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-soft">
          <span className="flex items-center gap-1.5">
            <GripVertical className="h-3 w-3" />
            点击「编辑布局」可调整卡片位置与大小，支持一键自动排序
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            数据更新于 {clockOf(data?.updatedAt ?? now)}
          </span>
        </div>
      )}

      <div ref={containerRef}>
        {width > 0 ? (
          <ResponsiveGridLayout
            className={cn('layout', editing && 'rgl-editing')}
            width={width}
            layouts={layouts as never}
            breakpoints={{ lg: 1200, md: 768 }}
            cols={{ lg: 12, md: 10 }}
            rowHeight={30}
            margin={[16, 12]}
            compactor={noCompactor}
            dragConfig={
              editing
                ? { enabled: true, cancel: 'button,a,input,select,textarea,.recharts-wrapper' }
                : { enabled: true, handle: '.dash-drag-handle', cancel: 'button,a,input,select,textarea' }
            }
            resizeConfig={editing ? { enabled: true, handles: ['se'] } : { enabled: false }}
            onLayoutChange={handleLayoutChange}
          >
            {/* —— 统计卡 1：今日任务数 —— */}
            <div key="stat-today" className="group relative">
              <DragHandle visible={editing} />
              <StatTile
                icon={<ListChecks className="h-[18px] w-[18px]" />}
                tone="brand"
                label="今日任务数"
                value={(stats?.today.value ?? 1284).toLocaleString()}
                compare={`/ ${(stats?.today.yesterday ?? 1142).toLocaleString()} 昨日`}
                badge={<StatBadge delta={stats?.today.delta ?? '+12.4%'} tone="up" />}
                footer={<MiniBars bars={stats?.today.bars ?? [12, 16, 14, 20, 18, 24, 28]} />}
              />
            </div>

            {/* —— 统计卡 2：任务成功率 —— */}
            <div key="stat-success" className="group relative">
              <DragHandle visible={editing} />
              <StatTile
                icon={<Target className="h-[18px] w-[18px]" />}
                tone="green"
                label="任务成功率"
                value={
                  <>
                    {stats?.success.value ?? 98.6}
                    <span className="text-[18px]">%</span>
                  </>
                }
                compare={`目标 ${stats?.success.target ?? 98.0}%`}
                badge={<StatBadge delta={stats?.success.delta ?? '+0.8%'} tone="up" />}
                footer={
                  <>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-hover">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${stats?.success.value ?? 98.6}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-soft">
                      <span>{stats?.success.note ?? '近 7 日稳定'}</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {stats?.success.verdict ?? '高于基线'}
                      </span>
                    </div>
                  </>
                }
              />
            </div>

            {/* —— 统计卡 3：失败任务数 —— */}
            <div key="stat-failed" className="group relative">
              <DragHandle visible={editing} />
              <StatTile
                icon={<CircleAlert className="h-[18px] w-[18px]" />}
                tone="rose"
                label="失败任务数"
                value={stats?.failed.value ?? 18}
                compare={stats?.failed.compare ?? '较昨日减少 5 个'}
                badge={<StatBadge delta={stats?.failed.delta ?? '-22.1%'} tone="down" />}
                footer={
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-canvas px-3 py-2">
                    <TriangleAlert className="h-[13px] w-[13px] shrink-0 text-amber-500" />
                    <span className="text-[10px] text-muted">
                      {stats?.failed.pending ?? 6} 个待处理 · {stats?.failed.oldest ?? '最快 12 分钟前'}
                    </span>
                  </div>
                }
              />
            </div>

            {/* —— 统计卡 4：运行中任务 —— */}
            <div key="stat-running" className="group relative">
              <DragHandle visible={editing} />
              <StatTile
                icon={<LoaderCircle className="h-[18px] w-[18px]" />}
                tone="amber"
                label="运行中任务"
                value={stats?.running.value ?? 42}
                compare={`队列等待 ${stats?.running.queue ?? 7} 个`}
                badge={<LiveBadge />}
                footer={
                  <div className="mt-4 grid grid-cols-3 gap-1.5">
                    {(stats?.running.breakdown ?? [
                      { label: '推理', value: 12 },
                      { label: '批处理', value: 21 },
                      { label: '微调', value: 9 },
                    ]).map((b) => (
                      <div key={b.label} className="rounded-md bg-canvas py-1.5 text-center">
                        <div className="text-[11px] font-semibold tabular-nums text-ink">{b.value}</div>
                        <div className="text-[9px] text-soft">{b.label}</div>
                      </div>
                    ))}
                  </div>
                }
              />
            </div>

            {/* —— 任务趋势（col-span-8，右侧留空） —— */}
            <div key="trend" className="group relative">
              <DragHandle visible={editing} />
              <Card className="flex h-full flex-col">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>任务趋势</CardTitle>
                      <span className="rounded bg-hover px-1.5 py-0.5 text-[9px] font-medium text-muted">近 7 天</span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted">总任务量与成功、失败任务的变化趋势</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden items-center gap-1.5 text-[10px] text-muted sm:flex">
                      <span className="h-2 w-2 rounded-full bg-brand-500" />总任务
                    </span>
                    <span className="hidden items-center gap-1.5 text-[10px] text-muted sm:flex">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />成功
                    </span>
                    <span className="hidden items-center gap-1.5 text-[10px] text-muted sm:flex">
                      <span className="h-2 w-2 rounded-full bg-rose-400" />失败
                    </span>
                    <AppSelect
                      value={env}
                      onValueChange={setEnv}
                      className="h-8 w-[104px] text-[11px] text-muted"
                      options={[
                        { value: 'all', label: '全部环境' },
                        { value: 'prod', label: '生产环境' },
                        { value: 'staging', label: '预发布环境' },
                      ]}
                    />
                  </div>
                </div>
                <div className="min-h-[260px] flex-1 px-3 pb-2 pt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend.data ?? []} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--brand-500)" stopOpacity={0.22} />
                          <stop offset="100%" stopColor="var(--brand-500)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11, fill: 'var(--soft)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 1500]}
                        ticks={[0, 300, 600, 900, 1200, 1500]}
                        tick={{ fontSize: 11, fill: 'var(--soft)' }}
                        tickFormatter={(v: number) => v.toLocaleString('en-US')}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--elevated)',
                          border: '1px solid var(--line)',
                          borderRadius: 12,
                          fontSize: 12,
                          color: 'var(--ink)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        name="总任务"
                        stroke="var(--brand-500)"
                        strokeWidth={2}
                        fill="url(#gTotal)"
                        animationDuration={450}
                      />
                      <Area
                        type="monotone"
                        dataKey="success"
                        name="成功"
                        stroke="#10b981"
                        strokeWidth={1.2}
                        strokeDasharray="4 3"
                        fill="transparent"
                        animationDuration={450}
                      />
                      <Area
                        type="monotone"
                        dataKey="failed"
                        name="失败"
                        stroke="#fb7185"
                        strokeWidth={1.2}
                        fill="transparent"
                        animationDuration={450}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* —— 主题预设（col-span-5） —— */}
            <div key="preset" className="group relative">
              <DragHandle visible={editing} />
              <Card className="flex h-full flex-col p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>主题预设</CardTitle>
                    <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[9px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                      实时
                    </span>
                  </div>
                  <button
                    onClick={openThemeDrawer}
                    className="flex items-center gap-1 text-[10px] font-medium text-muted transition hover:text-ink"
                  >
                    更多设置 <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
                <p className="mb-3.5 text-[11px] text-muted">
                  点击色块即刻更换全局主色调，主按钮、链接、徽章与侧边栏高亮同步联动。
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(ACCENT_LABELS) as AccentKey[]).map((key) => {
                    const active = accent === key
                    return (
                      <button
                        key={key}
                        onClick={() => setAccent(key)}
                        title={ACCENT_LABELS[key]}
                        aria-pressed={active}
                        className={cn(
                          'flex flex-col items-center gap-2 rounded-lg border bg-canvas/60 px-2 py-3 transition hover:border-brand-300 hover:bg-surface',
                          active ? 'border-brand-400 ring-2 ring-brand-500/15' : 'border-line',
                        )}
                      >
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm ring-1 ring-black/5"
                          style={{ background: ACCENTS[key][6] }}
                        >
                          {active ? <Check className="h-4 w-4" /> : null}
                        </span>
                        <span className="text-[10px] font-medium text-muted">{ACCENT_LABELS[key]}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-[10px] text-soft">
                  <span>
                    当前主题：<span className="font-medium text-ink">{ACCENT_LABELS[accent]}</span>
                  </span>
                  <button
                    onClick={() => {
                      resetTheme()
                      toast.success('已恢复默认主题设置')
                    }}
                    className="font-medium text-muted transition hover:text-ink"
                  >
                    恢复默认
                  </button>
                </div>
              </Card>
            </div>

            {/* —— 主题联动效果预览（col-span-7） —— */}
            <div key="preview" className="group relative">
              <DragHandle visible={editing} />
              <Card className="flex h-full flex-col">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>主题联动效果预览</CardTitle>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        设置已同步
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted">主按钮、选中态、状态徽章与表格密度跟随主题设置变化</p>
                  </div>
                  <Button size="sm" onClick={openThemeDrawer}>
                    <Palette className="h-3.5 w-3.5" /> 打开主题设置
                  </Button>
                </div>
                <div className="px-5 py-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />运行中
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />已完成
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />失败
                    </span>
                    <Link
                      to="/tasks"
                      className="text-[11px] font-medium text-brand-600 transition hover:text-brand-700"
                    >
                      查看任务列表 →
                    </Link>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-line">
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-line">
                        <tr className="transition hover:bg-hover/60">
                          <td className="px-3 py-2.5 text-[11.5px] font-medium text-ink">客服知识库向量化</td>
                          <td className="px-3 py-2.5">
                            <span className="rounded-md border border-line bg-canvas px-2 py-0.5 text-[10px] text-muted">
                              Embedding
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <Button variant="primary" size="sm" className="h-6 px-2.5 text-[10px]">
                              查看详情
                            </Button>
                          </td>
                        </tr>
                        <tr className="transition hover:bg-hover/60">
                          <td className="px-3 py-2.5 text-[11.5px] font-medium text-ink">年度财报摘要生成</td>
                          <td className="px-3 py-2.5">
                            <span className="rounded-md border border-line bg-canvas px-2 py-0.5 text-[10px] text-muted">
                              批处理
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <Button variant="soft" size="sm" className="h-6 px-2.5 text-[10px]">
                              重试
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>

            {/* —— 服务健康状态（col-span-4） —— */}
            <div key="health" className="group relative">
              <DragHandle visible={editing} />
              <Card className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                  <div>
                    <CardTitle>服务健康状态</CardTitle>
                    <p className="mt-1 text-[11px] text-muted">核心服务实时可用性</p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {health.filter((h) => h.tone !== 'down').length}/{health.length || 6} 正常
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 p-4">
                  {health.map((h) => (
                    <div key={h.name} className="rounded-lg border border-line bg-canvas/60 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-ink">{h.name}</span>
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            h.tone === 'warn' ? 'bg-amber-400' : 'bg-emerald-500',
                          )}
                        />
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-[10px] text-soft">{h.metric}</span>
                        <span className="font-mono text-[11px] text-muted">{h.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-line px-5 py-3">
                  <span className="text-[10px] text-soft">每 30 秒自动检测</span>
                  <Link
                    to="/services"
                    className="flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:text-brand-700"
                  >
                    查看服务 <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </Card>
            </div>

            {/* —— 失败任务快捷处理（col-span-12） —— */}
            <div key="failed" className="group relative">
              <DragHandle visible={editing} />
              <Card className="flex h-full flex-col">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>失败任务快捷处理</CardTitle>
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                        {stats?.failed.pending ?? 6} 个待处理
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted">
                      失败任务可直接重试，或进入详情查看执行日志与错误堆栈
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.success('已导出失败任务清单')}>
                      <Download className="h-3.5 w-3.5" /> 导出
                    </Button>
                    <Link to="/tasks">
                      <Button variant="outline" size="sm">
                        查看全部 <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[880px] text-left">
                    <thead>
                      <tr className="border-b border-line bg-canvas/60 text-[10px] font-medium tracking-wide text-soft">
                        <th className="px-5 py-2.5">任务</th>
                        <th className="px-4 py-2.5">类型</th>
                        <th className="px-4 py-2.5">失败原因</th>
                        <th className="px-4 py-2.5">提交人</th>
                        <th className="px-4 py-2.5">失败时间</th>
                        <th className="px-4 py-2.5">状态</th>
                        <th className="px-5 py-2.5 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {failedTasks.map((t) => (
                        <tr key={t.id} className="transition hover:bg-hover/60">
                          <td className="px-5 py-3.5">
                            <Link
                              to="/tasks/$id"
                              params={{ id: t.id }}
                              className="text-[12px] font-medium text-ink hover:text-brand-600"
                            >
                              {t.name}
                            </Link>
                            <div className="mt-0.5 font-mono text-[10px] text-soft">{t.id}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="rounded-md border border-line bg-canvas px-2 py-1 text-[10px] text-muted">
                              {t.type}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400">
                              <CircleX className="h-[13px] w-[13px] shrink-0" />
                              <span className="max-w-[220px] truncate">{t.failReason ?? '执行失败'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-[11px] text-muted">{t.submitter}</td>
                          <td className="px-4 py-3.5 font-mono text-[10px] text-soft">{failTimeOf(t.createdAt)}</td>
                          <td className="px-4 py-3.5">
                            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                              失败
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[10px]"
                              onClick={() =>
                                retry.mutate(t.id, {
                                  onSuccess: () => toast.success(`「${t.name}」已重新入队`),
                                })
                              }
                            >
                              <RotateCw className="h-[11px] w-[11px]" /> 重试
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </ResponsiveGridLayout>
        ) : null}
      </div>

      {/* 页脚版本条（原型同款） */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-[11px] text-soft">
        <span>Apex Admin v3.8.2 · AI Platform Operations</span>
        <div className="flex items-center gap-4">
          <Link to="/system/settings" className="transition hover:text-ink">
            系统参数
          </Link>
          <Link to="/system/audit" className="transition hover:text-ink">
            审计日志
          </Link>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            数据同步正常
          </span>
        </div>
      </div>
    </div>
  )
}
