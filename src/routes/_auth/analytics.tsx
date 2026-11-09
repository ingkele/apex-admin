import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  Activity, ArrowDownRight, ArrowUpRight, Download, Gauge, Layers, Timer, TrendingUp, TriangleAlert,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AppSelect } from '@/components/ui/select'
import { PageHeader } from '@/components/shared/page-header'
import { useAnalytics } from '@/api'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/analytics')({
  component: AnalyticsPage,
})

const WEEK_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const KPI_ICON = { tasks: Activity, calls: Layers, latency: Timer, error: TriangleAlert } as const

const TOOLTIP_STYLE = {
  background: 'var(--elevated)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  fontSize: 12,
  color: 'var(--ink)',
  boxShadow: '0 8px 24px -12px rgba(15,23,42,0.28)',
} as const

function AnalyticsPage() {
  const [range, setRange] = React.useState<'7d' | '30d'>('7d')
  const { data, isLoading } = useAnalytics(range)

  return (
    <>
      <PageHeader
        eyebrow={<span>概览 › 分析页 · 数据每 5 分钟聚合一次</span>}
        title="分析页"
        description="任务吞吐、模型调用、响应耗时与错误分布的多维分析，支持按周期切换与导出。"
        actions={
          <>
            <div className="w-[130px]">
              <AppSelect
                value={range}
                onValueChange={(v) => setRange(v as '7d' | '30d')}
                options={[
                  { value: '7d', label: '近 7 天' },
                  { value: '30d', label: '近 30 天' },
                ]}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('报告已生成，正在下载分析报告.pdf')}
            >
              <Download className="h-3.5 w-3.5" /> 导出报告
            </Button>
          </>
        }
      />

      {isLoading || !data ? (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[112px] animate-pulse rounded-xl border border-line bg-surface" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {/* 指标卡 */}
          {data.kpis.map((kpi) => {
            const Icon = KPI_ICON[kpi.key as keyof typeof KPI_ICON] ?? Activity
            const good = kpi.key === 'error' || kpi.key === 'latency' ? kpi.trend === 'down' : kpi.trend === 'up'
            return (
              <div
                key={kpi.key}
                className="col-span-3 rounded-xl border border-line bg-surface px-4 py-3.5 shadow-card"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-muted">{kpi.label}</span>
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg',
                      kpi.tone === 'brand' && 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
                      kpi.tone === 'green' && 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
                      kpi.tone === 'amber' && 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
                      kpi.tone === 'rose' && 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="mt-2 flex items-end gap-1.5">
                  <span className="text-[24px] font-semibold leading-none tabular-nums text-ink">{kpi.value}</span>
                  {kpi.unit ? <span className="mb-0.5 text-[10px] text-soft">{kpi.unit}</span> : null}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[10.5px]">
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 rounded px-1 py-px font-medium',
                      good
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
                    )}
                  >
                    {kpi.trend === 'up' ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                    {kpi.delta}
                  </span>
                  <span className="text-soft">{kpi.note}</span>
                </div>
              </div>
            )
          })}

          {/* 趋势 */}
          <Card className="col-span-8 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <div>
                <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
                  <TrendingUp className="h-4 w-4 text-brand-500" /> 任务量与模型调用趋势
                </div>
                <p className="mt-0.5 text-[10.5px] text-muted">
                  {range === '7d' ? '近 7 天' : '近 30 天'}累计任务{' '}
                  {data.trend.reduce((s, p) => s + p.tasks, 0).toLocaleString('en-US')} 次 · 调用{' '}
                  {data.trend.reduce((s, p) => s + p.calls, 0).toLocaleString('en-US')} 次
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10.5px] text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-4 rounded-full bg-brand-500" /> 任务量
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-4 rounded-full bg-emerald-500" /> 模型调用
                </span>
              </div>
            </div>
            <div className="h-[268px] px-3 pb-3 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand-500)" stopOpacity={0.24} />
                      <stop offset="100%" stopColor="var(--brand-500)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: 'var(--soft)' }}
                    axisLine={false}
                    tickLine={false}
                    interval={range === '30d' ? 4 : 0}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: 'var(--soft)' }}
                    tickFormatter={(v: number) => v.toLocaleString('en-US')}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: 'var(--soft)' }}
                    tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={{ color: 'var(--muted)', fontSize: 11 }}
                    formatter={(value, name) => [
                      `${Number(value ?? 0).toLocaleString('en-US')} 次`,
                      name === 'tasks' ? '任务量' : '模型调用',
                    ]}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="tasks"
                    stroke="var(--brand-500)"
                    strokeWidth={2}
                    fill="url(#aTasks)"
                    animationDuration={450}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="calls"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#aCalls)"
                    animationDuration={450}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 来源分布 */}
          <Card className="col-span-4 overflow-hidden">
            <div className="border-b border-line px-5 py-3.5">
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
                <Layers className="h-4 w-4 text-brand-500" /> 调用来源分布
              </div>
              <p className="mt-0.5 text-[10.5px] text-muted">按请求入口统计，合计 100%</p>
            </div>
            <div className="relative h-[168px] px-4 pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.sources}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={74}
                    paddingAngle={2}
                    stroke="var(--surface)"
                    strokeWidth={2}
                    animationDuration={450}
                  >
                    {data.sources.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value}%`, '占比']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-3">
                <span className="text-[19px] font-semibold leading-none tabular-nums text-ink">38.6k</span>
                <span className="mt-1 text-[10px] text-soft">总调用量</span>
              </div>
            </div>
            <div className="space-y-2 px-5 pb-4">
              {data.sources.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-[11.5px]">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span className="min-w-0 flex-1 truncate text-muted">{s.name}</span>
                  <span className="tabular-nums text-ink">{s.value}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* 服务耗时 */}
          <Card className="col-span-5 overflow-hidden">
            <div className="border-b border-line px-5 py-3.5">
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
                <Gauge className="h-4 w-4 text-brand-500" /> 服务响应耗时
              </div>
              <p className="mt-0.5 text-[10.5px] text-muted">P50 深色 / P95 浅色，单位毫秒</p>
            </div>
            <div className="space-y-3 px-5 py-4">
              {data.latency.map((l) => {
                const max = Math.max(...data.latency.map((x) => x.p95))
                return (
                  <div key={l.service}>
                    <div className="flex items-center justify-between text-[11.5px]">
                      <span className="text-ink">{l.service}</span>
                      <span className="tabular-nums text-muted">
                        {l.p50} / <span className="text-ink">{l.p95}</span> ms
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-canvas">
                      <div className="relative h-full" style={{ width: `${(l.p95 / max) * 100}%` }}>
                        <div className="h-full w-full rounded-full bg-brand-200 dark:bg-brand-500/25" />
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-brand-500"
                          style={{ width: `${(l.p50 / l.p95) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* 错误分布 */}
          <Card className="col-span-3 overflow-hidden">
            <div className="border-b border-line px-5 py-3.5">
              <div className="text-[13.5px] font-semibold text-ink">错误类型分布</div>
              <p className="mt-0.5 text-[10.5px] text-muted">共 152 次失败</p>
            </div>
            <div className="space-y-2.5 px-5 py-4">
              {data.errors.map((e) => (
                <div key={e.type}>
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="text-ink">{e.type}</span>
                    <span className="tabular-nums text-muted">{e.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        e.tone === 'rose' && 'bg-rose-500',
                        e.tone === 'amber' && 'bg-amber-500',
                        e.tone === 'brand' && 'bg-brand-500',
                        e.tone === 'slate' && 'bg-slate-400',
                      )}
                      style={{ width: `${e.share}%` }}
                    />
                  </div>
                  <div className="mt-0.5 text-right text-[10px] tabular-nums text-soft">{e.share}%</div>
                </div>
              ))}
            </div>
          </Card>

          {/* 洞察 */}
          <Card className="col-span-4 overflow-hidden">
            <div className="border-b border-line px-5 py-3.5">
              <div className="text-[13.5px] font-semibold text-ink">关键洞察</div>
              <p className="mt-0.5 text-[10.5px] text-muted">自动分析最近一个周期的异常点</p>
            </div>
            <div className="divide-y divide-line">
              {data.insights.map((ins) => (
                <div key={ins.title} className="flex items-start gap-2.5 px-5 py-3">
                  <span
                    className={cn(
                      'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                      ins.tone === 'brand' && 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
                      ins.tone === 'amber' && 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
                      ins.tone === 'rose' && 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
                    )}
                  >
                    <TriangleAlert className="h-3 w-3" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10.5px] text-soft">{ins.title}</div>
                    <div className="mt-0.5 text-[12px] font-medium text-ink">{ins.value}</div>
                    <div className="mt-0.5 text-[10.5px] leading-relaxed text-muted">{ins.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 热力图 */}
          <Card className="col-span-12 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <div>
                <div className="text-[13.5px] font-semibold text-ink">调用时段热力</div>
                <p className="mt-0.5 text-[10.5px] text-muted">按小时聚合，颜色越深调用越集中</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-soft">
                低
                {[0.15, 0.35, 0.55, 0.75, 1].map((o) => (
                  <span
                    key={o}
                    className="h-3 w-4 rounded-sm bg-brand-500"
                    style={{ opacity: o }}
                  />
                ))}
                高
              </div>
            </div>
            <div className="overflow-x-auto px-5 py-4">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[40px_repeat(24,1fr)] gap-[3px] pb-1 text-[9.5px] text-soft">
                  <span />
                  {Array.from({ length: 24 }).map((_, h) => (
                    <span key={h} className="text-center">
                      {h % 3 === 0 ? h : ''}
                    </span>
                  ))}
                </div>
                {data.heat.map((row, d) => (
                  <div key={d} className="grid grid-cols-[40px_repeat(24,1fr)] items-center gap-[3px] py-[2px]">
                    <span className="text-[10.5px] text-muted">{WEEK_LABELS[d]}</span>
                    {row.map((v, h) => (
                      <span
                        key={h}
                        title={`${WEEK_LABELS[d]} ${h}:00 · 强度 ${v}`}
                        className="h-5 rounded-[3px] bg-brand-500 transition-transform hover:scale-110"
                        style={{ opacity: 0.08 + (v / 100) * 0.85 }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* 模型排行 */}
          <Card className="col-span-12 overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div>
                <div className="text-[13.5px] font-semibold text-ink">模型调用排行</div>
                <p className="mt-0.5 text-[10.5px] text-muted">按调用次数降序，成本含缓存命中折扣</p>
              </div>
              <span className="rounded-md bg-canvas px-2 py-1 text-[10.5px] text-muted">共 5 个模型</span>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-canvas/60">
                  {['模型', '提供方', '调用次数', '平均延迟', '成功率', '成本', '调用占比'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11.5px] font-medium whitespace-nowrap text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.models.map((m) => (
                  <tr key={m.name} className="border-b border-line transition-colors last:border-0 hover:bg-hover/60">
                    <td className="px-4 py-3 text-[12.5px] font-medium text-ink">{m.name}</td>
                    <td className="px-4 py-3 text-[12px] text-muted">{m.provider}</td>
                    <td className="px-4 py-3 text-[12.5px] tabular-nums text-ink">
                      {m.calls.toLocaleString('en-US')}
                    </td>
                    <td className="px-4 py-3 text-[12px] tabular-nums text-muted">{m.latency}</td>
                    <td className="px-4 py-3 text-[12px] tabular-nums text-muted">{m.success}</td>
                    <td className="px-4 py-3 text-[12.5px] tabular-nums text-ink">{m.cost}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-canvas">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${m.share * 2}%` }} />
                        </div>
                        <span className="text-[11px] tabular-nums text-muted">{m.share}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </>
  )
}
