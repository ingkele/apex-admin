import * as React from 'react'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import {
  Activity, Bookmark, CircleX, Clock3, Download, Eraser, Pause, Play,
  Search, Server, TriangleAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppSelect } from '@/components/ui/select'
import { AppSwitch } from '@/components/ui/switch'
import { PageHeader } from '@/components/shared/page-header'
import { MiniStat } from '@/components/shared/stat-tile'
import { useLogs, useLogStats } from '@/api'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/services/logs')({
  validateSearch: (search: Record<string, unknown>): { service?: string } => ({
    service: typeof search.service === 'string' ? search.service : undefined,
  }),
  component: ServiceLogsPage,
})

const LEVEL_STYLE: Record<string, { label: string; cls: string }> = {
  INFO: { label: 'INFO', cls: 'text-sky-400' },
  DEBUG: { label: 'DEBUG', cls: 'text-slate-500' },
  WARN: { label: 'WARN', cls: 'text-amber-400' },
  ERROR: { label: 'ERROR', cls: 'text-rose-400' },
}

/** 服务名配色（原型同一服务固定色） */
const SERVICE_STYLE: Record<string, string> = {
  'gateway-api': 'text-violet-300',
  'inference-core': 'text-emerald-300',
  'task-scheduler': 'text-cyan-300',
  'vector-db': 'text-amber-300',
}

const MESSAGE_STYLE: Record<string, string> = {
  INFO: 'text-slate-300',
  DEBUG: 'text-slate-400',
  WARN: 'text-amber-200/90',
  ERROR: 'text-rose-200/90',
}

const SERVICE_OPTIONS = ['gateway-api', 'inference-core', 'task-scheduler', 'vector-db']

function ServiceLogsPage() {
  const search = useSearch({ from: '/_auth/services/logs' })
  const [service, setService] = React.useState(search.service ?? 'all')
  const [level, setLevel] = React.useState('all')
  const [keyword, setKeyword] = React.useState('')
  const [debounced, setDebounced] = React.useState('')
  const [paused, setPaused] = React.useState(false)
  const [autoScroll, setAutoScroll] = React.useState(true)
  const [cleared, setCleared] = React.useState(false)

  const logs = useLogs({ service, level, keyword: debounced })
  const stats = useLogStats()
  const boxRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(keyword.trim()), 300)
    return () => clearTimeout(id)
  }, [keyword])

  const lines = cleared ? [] : (logs.data ?? [])

  React.useEffect(() => {
    if (autoScroll && boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight
    }
  }, [lines.length, autoScroll])

  const s = stats.data

  return (
    <div>
      <PageHeader
        title="服务日志"
        description="实时聚合平台服务日志，支持级别过滤、关键字检索与流式跟随。"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.success('日志检索条件已保存为视图')}>
              <Bookmark className="h-3.5 w-3.5" /> 保存视图
            </Button>
            <Button size="sm" onClick={() => toast.success('已开始下载（演示）')}>
              <Download className="h-3.5 w-3.5" /> 下载日志
            </Button>
          </>
        }
      />

      {/* 4 张概览卡 */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat
          label="实时吞吐"
          icon={<Activity className="h-3.5 w-3.5" />}
          value={s?.throughput ?? '—'}
          unit={s?.throughputUnit}
        />
        <MiniStat
          label="ERROR / FATAL"
          tone="rose"
          icon={<CircleX className="h-3.5 w-3.5" />}
          value={s?.errorFatal ?? '—'}
          unit={s?.errorDelta}
        />
        <MiniStat
          label="WARN 日志"
          tone="amber"
          icon={<TriangleAlert className="h-3.5 w-3.5" />}
          value={s?.warn ?? '—'}
          unit={s ? `需关注 ${s.warnAttention} 条` : undefined}
        />
        <MiniStat
          label="采集延迟"
          tone="green"
          icon={<Clock3 className="h-3.5 w-3.5" />}
          value={s?.latency ?? '—'}
          unit={s?.latencyNote}
        />
      </div>

      {/* 工具栏 + 终端（同一张卡） */}
      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-4 py-3">
          <div className="flex h-8 items-center gap-2 rounded-lg border border-line bg-canvas/60 pl-2.5 pr-1">
            <Server className="h-3.5 w-3.5 shrink-0 text-soft" />
            <AppSelect
              value={service}
              onValueChange={(v) => {
                setService(v)
                setCleared(false)
              }}
              className="h-7 w-[132px] border-0 bg-transparent px-0 shadow-none"
              options={[{ value: 'all', label: '全部服务' }, ...SERVICE_OPTIONS.map((n) => ({ value: n, label: n }))]}
            />
          </div>

          <AppSelect
            value={level}
            onValueChange={setLevel}
            className="h-8 w-[108px]"
            options={[
              { value: 'all', label: '全部级别' },
              { value: 'INFO', label: 'INFO' },
              { value: 'WARN', label: 'WARN' },
              { value: 'ERROR', label: 'ERROR' },
              { value: 'DEBUG', label: 'DEBUG' },
            ]}
          />

          <div className="flex h-8 w-[270px] items-center gap-2 rounded-lg border border-line bg-canvas/60 px-2.5 focus-within:border-brand-300 focus-within:bg-surface">
            <Search className="h-3.5 w-3.5 shrink-0 text-soft" />
            <input
              id="log-keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索日志内容、Trace ID…"
              className="h-full min-w-0 flex-1 bg-transparent text-[11.5px] text-ink outline-none placeholder:text-soft"
            />
            <kbd className="rounded border border-line bg-surface px-1 py-0.5 font-mono text-[9px] text-soft">/</kbd>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 text-[11.5px] text-muted"
            onClick={() => setAutoScroll((v) => !v)}
          >
            自动滚动
            <AppSwitch checked={autoScroll} onCheckedChange={setAutoScroll} />
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-50" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              实时流
            </span>
            <Button variant="outline" size="sm" className="h-8 px-2.5 text-[11px]" onClick={() => setPaused((p) => !p)}>
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              {paused ? '继续' : '暂停'}
            </Button>
            <Button variant="outline" size="sm" className="h-8 px-2.5 text-[11px]" onClick={() => setCleared(true)}>
              <Eraser className="h-3.5 w-3.5" /> 清屏
            </Button>
            <Button variant="outline" size="sm" className="h-8 px-2.5 text-[11px]" onClick={() => toast.success('已开始下载（演示）')}>
              <Download className="h-3.5 w-3.5" /> 下载
            </Button>
          </div>
        </div>

        {/* 终端 */}
        <div className="bg-[#0b1220]">
          <div className="flex items-center justify-between border-b border-slate-800 bg-[#0f172a] px-4 py-2.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <span className="font-mono text-[10.5px] text-slate-400">
                apex-prod / {service === 'all' ? 'aggregated-stream' : service}
              </span>
              <span className="rounded border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 font-mono text-[9px] text-slate-500">
                tail -f
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px] text-slate-500">
              <span>
                显示 <span className="text-slate-300">{lines.length}</span> 行
              </span>
              <span className="h-3 w-px bg-slate-700" />
              <span>UTF-8</span>
            </div>
          </div>

          <div ref={boxRef} className="h-[560px] overflow-auto">
            <div className="min-w-[1080px] py-2 font-mono text-[11px] leading-[1.85]">
              {lines.length === 0 ? (
                <div className="px-4 py-16 text-center text-[11px] text-slate-500">
                  {cleared ? '已清屏 · 等待新日志…' : '没有匹配的日志行'}
                </div>
              ) : (
                lines.map((l, i) => (
                  <div key={`${l.at}-${i}`} className="flex gap-3 px-4 py-[1px]">
                    <span className="w-[78px] shrink-0 text-right text-slate-600">{l.at}</span>
                    <span className={`w-[44px] shrink-0 font-semibold ${LEVEL_STYLE[l.level]?.cls ?? 'text-slate-400'}`}>
                      {l.level}
                    </span>
                    <span className={`w-[124px] shrink-0 truncate ${SERVICE_STYLE[l.service] ?? 'text-slate-300'}`}>
                      {l.service}
                    </span>
                    <span className="w-[112px] shrink-0 text-slate-500">{l.trace}</span>
                    <span className={MESSAGE_STYLE[l.level] ?? 'text-slate-300'}>{l.message}</span>
                  </div>
                ))
              )}
              <div className="flex items-center gap-2 px-4 pt-2 text-[11px] text-slate-500">
                <span className="text-emerald-400">❯</span>
                <span>streaming</span>
                <span className="h-3 w-1.5 animate-pulse bg-slate-500" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
