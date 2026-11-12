import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft, Check, Copy, CopyPlus, Download, Info, LoaderCircle, RefreshCw,
  RotateCw, ShieldCheck, Square, XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppTabs, AppTabPanel } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PageHeader } from '@/components/shared/page-header'
import { Can } from '@/components/shared/can'
import { useTask, useTaskActions } from '@/api'
import { formatDateTime, formatDuration, formatNumber } from '@/lib/format'
import { logLines, type TaskParam } from '@/mocks/db'
import { cn, withBase } from '@/lib/utils'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/tasks/$id')({
  component: TaskDetailPage,
})

/** 任务状态 → 胶囊样式（原型：圆点 + 文案） */
const STATUS_PILL: Record<string, { label: string; cls: string; dot: string; pulse?: boolean }> = {
  running: { label: '运行中', cls: 'bg-blue-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300', dot: 'bg-brand-500', pulse: true },
  success: { label: '成功', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', dot: 'bg-emerald-500' },
  failed: { label: '失败', cls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400', dot: 'bg-rose-500' },
  queued: { label: '排队中', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400', dot: 'bg-amber-500' },
  cancelled: { label: '已取消', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', dot: 'bg-slate-400' },
}

/** 关联服务（原型同款表格） */
const RELATED_SERVICES = [
  { name: 'embedding-worker', duty: '向量计算', tone: 'ok', latency: '24 ms' },
  { name: 'task-scheduler', duty: '任务调度', tone: 'ok', latency: '11 ms' },
  { name: 'vector-db', duty: '向量存储', tone: 'warn', latency: '18 ms' },
] as const

function TaskDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const task = useTask(id)
  const { retry, cancel } = useTaskActions()
  const [tab, setTab] = React.useState('params')
  const [cancelOpen, setCancelOpen] = React.useState(false)

  const t = task.data
  if (task.isPending || !t) {
    return <div className="py-20 text-center text-[13px] text-soft">加载中…</div>
  }

  const pill = STATUS_PILL[t.status] ?? STATUS_PILL.queued
  const progress = t.progress
  const params: TaskParam[] = t.params ?? Object.entries(t.input ?? {}).map(([key, v]) => ({
    key,
    value: typeof v === 'string' ? v : JSON.stringify(v),
    source: '任务配置',
  }))
  const requestJson = JSON.stringify({ model: t.model, ...(t.input ?? {}) }, null, 2)

  return (
    <div>
      {/* 面包屑 */}
      <div className="mb-5 flex items-center gap-2 text-[11.5px] text-muted">
        <a
          href={withBase('tasks')}
          onClick={(e) => {
            e.preventDefault()
            void navigate({ to: '/tasks' })
          }}
          className="flex items-center gap-1.5 transition hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回任务列表
        </a>
        <span className="text-soft">/</span>
        <span className="font-mono text-[10.5px] text-soft">{t.id}</span>
      </div>

      <PageHeader
        title={t.name}
        className="mb-6"
        description={
          <span className="flex flex-wrap items-center gap-3 text-[11.5px] text-muted">
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(t.id)
                toast.success('任务 ID 已复制')
              }}
              className="flex items-center gap-1.5 font-mono text-[10.5px] text-soft transition hover:text-ink"
            >
              {t.id}
              <Copy className="h-3 w-3" />
            </button>
            <span className="h-1 w-1 rounded-full bg-line" />
            <span>{t.type}</span>
            <span className="h-1 w-1 rounded-full bg-line" />
            <span>提交于 {formatDateTime(t.createdAt)}</span>
          </span>
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => task.refetch()}>
              <RefreshCw className="h-3.5 w-3.5" /> 刷新
            </Button>
            <Can permission="task:retry">
              <Button
                variant="outline"
                size="sm"
                onClick={() => retry.mutate(t.id, { onSuccess: () => toast.success('已重新入队') })}
              >
                <RotateCw className="h-3.5 w-3.5" /> 重试
              </Button>
            </Can>
            <Button variant="outline" size="sm" onClick={() => toast.success('已克隆为新任务（演示）')}>
              <CopyPlus className="h-3.5 w-3.5" /> 克隆
            </Button>
            {t.status === 'running' || t.status === 'queued' ? (
              <Can permission="task:cancel">
                <Button variant="danger" size="sm" onClick={() => setCancelOpen(true)}>
                  <Square className="h-3.5 w-3.5" /> 取消
                </Button>
              </Can>
            ) : null}
          </>
        }
      />

      {/* 顶部徽章行：状态 + 优先级 */}
      <div className="-mt-3 mb-5 flex flex-wrap items-center gap-2.5">
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium', pill.cls)}>
          <span className={cn('h-1.5 w-1.5 rounded-full', pill.dot, pill.pulse && 'animate-pulse')} />
          {pill.label}
        </span>
        {t.priority ? (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10.5px] font-medium text-muted dark:bg-slate-800">
            {t.priority}
          </span>
        ) : null}
      </div>

      {/* 进度卡（运行中任务） */}
      {progress ? (
        <section className="mb-5 overflow-hidden rounded-xl border border-brand-100 bg-gradient-to-r from-brand-50/80 via-surface to-surface p-5 shadow-card dark:border-brand-500/20 dark:from-brand-500/5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
                <LoaderCircle className={cn('h-[18px] w-[18px]', t.status === 'running' && 'animate-spin')} />
              </div>
              <div>
                <div className="text-[12.5px] font-semibold text-ink">{progress.step}</div>
                <div className="mt-0.5 text-[11px] text-muted">{progress.detail}</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[10px] text-soft">当前吞吐</div>
                <div className="mt-0.5 font-mono text-[13px] font-medium text-ink">
                  {progress.throughput}
                  <span className="ml-1 text-[10px] text-muted">{progress.throughputUnit}</span>
                </div>
              </div>
              <div className="h-8 w-px bg-line" />
              <div className="text-right">
                <div className="text-[10px] text-soft">已运行</div>
                <div className="mt-0.5 font-mono text-[13px] font-medium text-ink">{progress.elapsed}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-soft">总进度</div>
                <div className="mt-0.5 font-mono text-[13px] font-semibold text-brand-600 dark:text-brand-400">
                  {progress.percent}%
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-500/15">
            <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${progress.percent}%` }} />
          </div>
        </section>
      ) : null}

      {/* 基础信息 */}
      <section className="mb-5 rounded-xl border border-line bg-surface p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-ink">基础信息</h2>
          <span className="flex items-center gap-1.5 text-[10.5px] text-soft">
            <ShieldCheck className="h-3 w-3" /> 已记录审计日志
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 xl:grid-cols-4">
          {[
            ['任务类型', t.type],
            ['执行模型', t.model],
            ['提交人', t.submitter],
            ['调度队列', t.queue ?? 'embedding-prod'],
            ['运行环境', t.env ?? '生产环境 · cn-east'],
            ['重试次数', t.retries ?? '0 / 3'],
            ['超时设置', t.timeout ?? '1800s'],
            ['开始时间', t.startedAt ?? formatDateTime(t.createdAt)],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-[10px] text-soft">{k}</div>
              <div className="mt-1 text-[11.5px] font-medium text-ink">{v}</div>
            </div>
          ))}
        </div>
        {t.failReason ? (
          <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50/70 px-3.5 py-2.5 text-[11.5px] text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            失败原因：{t.failReason}
          </div>
        ) : null}
      </section>

      <div className="grid grid-cols-12 gap-5">
        {/* 左：Tab 面板 */}
        <section className="col-span-12 overflow-hidden rounded-xl border border-line bg-surface shadow-card xl:col-span-9">
          <AppTabs
            value={tab}
            onValueChange={setTab}
            className="px-4 pt-3"
            tabs={[
              { value: 'params', label: '执行参数' },
              {
                value: 'logs',
                label: (
                  <span className="flex items-center gap-1.5">
                    执行日志
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] text-muted dark:bg-slate-800">128</span>
                  </span>
                ),
              },
              {
                value: 'artifacts',
                label: (
                  <span className="flex items-center gap-1.5">
                    产物输出
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] text-muted dark:bg-slate-800">3</span>
                  </span>
                ),
              },
              { value: 'services', label: '关联服务' },
            ]}
          >
            {/* 执行参数 */}
            <AppTabPanel value="params" className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[12.5px] font-semibold text-ink">输入参数</h3>
                  <p className="mt-0.5 text-[10.5px] text-muted">提交任务时请求体中的执行配置，敏感字段已脱敏。</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[10.5px]"
                  onClick={() => {
                    void navigator.clipboard?.writeText(requestJson)
                    toast.success('已复制 JSON')
                  }}
                >
                  <Copy className="h-3 w-3" /> 复制 JSON
                </Button>
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-line">
                <div className="grid grid-cols-12 border-b border-line bg-canvas/60 px-4 py-2 text-[10px] font-medium text-soft">
                  <div className="col-span-3">参数</div>
                  <div className="col-span-7">值</div>
                  <div className="col-span-2">来源</div>
                </div>
                <div className="divide-y divide-line">
                  {params.length === 0 ? (
                    <div className="px-4 py-6 text-center text-[11px] text-soft">该任务无输入参数</div>
                  ) : (
                    params.map((p) => (
                      <div key={p.key} className="grid grid-cols-12 items-center px-4 py-2.5">
                        <div className="col-span-3 font-mono text-[10.5px] text-muted">{p.key}</div>
                        <div className="col-span-7 truncate font-mono text-[11px] text-ink">
                          {p.isBool ? (
                            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                              {p.value}
                            </span>
                          ) : (
                            p.value
                          )}
                        </div>
                        <div className="col-span-2 text-[10px] text-soft">{p.source}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-[#0f172a] p-4">
                <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-slate-400">
                  <span>request.json</span>
                  <span>application/json</span>
                </div>
                <pre className="overflow-x-auto font-mono text-[11px] leading-5 text-slate-300">{requestJson}</pre>
              </div>
            </AppTabPanel>

            {/* 执行日志 */}
            <AppTabPanel value="logs" className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-[12.5px] font-semibold text-ink">执行日志</h3>
                  <p className="mt-0.5 text-[10.5px] text-muted">实时输出最近 128 行日志，任务运行期间自动刷新。</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    实时
                  </span>
                  <Button variant="outline" size="sm" className="h-7 px-2 text-[10.5px]" onClick={() => toast.success('日志已复制')}>
                    <Copy className="h-3 w-3" /> 复制
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 px-2 text-[10.5px]" onClick={() => toast.success('已开始下载（演示）')}>
                    <Download className="h-3 w-3" /> 下载
                  </Button>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 bg-[#0f172a] px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">task/{t.id} · stdout</span>
                  <span className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">ALL</span>
                </div>
                <div className="max-h-[420px] space-y-[3px] overflow-y-auto bg-[#0b1220] p-4 font-mono text-[11px] leading-relaxed">
                  {logLines.map((l, i) => (
                    <div key={i} className="whitespace-pre-wrap">
                      <span className="text-slate-600">{l.at}</span>{' '}
                      <span
                        className={
                          l.level === 'ERROR' ? 'text-rose-400' : l.level === 'WARN' ? 'text-amber-400' : l.level === 'DEBUG' ? 'text-slate-500' : 'text-sky-400'
                        }
                      >
                        {l.level}
                      </span>{' '}
                      <span className="text-slate-500">[{l.service}]</span>{' '}
                      <span className="text-slate-300">{l.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AppTabPanel>

            {/* 产物输出 */}
            <AppTabPanel value="artifacts" className="p-5">
              <h3 className="text-[12.5px] font-semibold text-ink">产物输出</h3>
              <p className="mt-0.5 text-[10.5px] text-muted">任务完成后自动归档至对象存储，保留 30 天。</p>
              <div className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line">
                {[
                  ['summary-2025.md', '2.4 MB', '2026-11-08 08:34'],
                  ['summary-2025.json', '864 KB', '2026-11-08 08:34'],
                  ['figures.zip', '12.1 MB', '2026-11-08 08:35'],
                ].map(([f, size, at]) => (
                  <div key={f} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate font-mono text-[11.5px] text-ink">{f}</div>
                      <div className="mt-0.5 text-[10px] text-soft">{size} · {at}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => toast.success('已开始下载（演示）')}>
                      <Download className="h-3 w-3" /> 下载
                    </Button>
                  </div>
                ))}
              </div>
            </AppTabPanel>

            {/* 关联服务 */}
            <AppTabPanel value="services" className="p-5">
              <h3 className="text-[12.5px] font-semibold text-ink">关联服务</h3>
              <p className="mt-0.5 text-[10.5px] text-muted">该任务执行链路涉及的平台服务与实时延迟。</p>
              <div className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line">
                {RELATED_SERVICES.map((s) => (
                  <div key={s.name} className="grid grid-cols-12 items-center px-4 py-3">
                    <div className="col-span-4 font-mono text-[11px] text-ink">{s.name}</div>
                    <div className="col-span-3 text-[10.5px] text-muted">{s.duty}</div>
                    <div className="col-span-3 flex items-center gap-1.5 text-[10.5px]">
                      <span className={cn('h-1.5 w-1.5 rounded-full', s.tone === 'ok' ? 'bg-emerald-500' : 'bg-amber-500')} />
                      <span className={s.tone === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                        {s.tone === 'ok' ? '健康' : '告警'}
                      </span>
                    </div>
                    <div className="col-span-1 font-mono text-[10.5px] text-muted">{s.latency}</div>
                    <div className="col-span-1 text-right">
                      <a href={withBase('services')} className="text-[10.5px] text-brand-600 hover:text-brand-700 dark:text-brand-400">
                        查看
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </AppTabPanel>
          </AppTabs>
        </section>

        {/* 右：时间线 / 指标 / 提示 */}
        <aside className="col-span-12 space-y-4 xl:col-span-3">
          <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-ink">执行时间线</h2>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                {t.status === 'running' ? '进行中' : pill.label}
              </span>
            </div>
            <div className="mt-4">
              {(t.timeline ?? []).length === 0 ? (
                <div className="text-[11px] text-soft">暂无时间线记录</div>
              ) : (
                (t.timeline ?? []).map((step, i, arr) => (
                  <div key={step.label} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-full',
                          step.state === 'done' && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
                          step.state === 'current' && 'relative border-2 border-brand-500 bg-brand-50 dark:bg-brand-500/10',
                          step.state === 'pending' && 'border border-line bg-canvas',
                        )}
                      >
                        {step.state === 'done' ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <span className={cn('h-1.5 w-1.5 rounded-full', step.state === 'current' ? 'animate-pulse bg-brand-500' : 'bg-soft')} />
                        )}
                      </span>
                      {i < arr.length - 1 ? <span className="h-9 w-px bg-line" /> : null}
                    </div>
                    <div className={cn('-mt-0.5', i < arr.length - 1 && 'pb-4')}>
                      <div
                        className={cn(
                          'text-[11px] font-medium',
                          step.state === 'current' ? 'text-brand-700 dark:text-brand-300' : step.state === 'pending' ? 'text-muted' : 'text-ink',
                        )}
                      >
                        {step.label}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-soft">
                        {[step.at, step.note].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <h2 className="text-[13px] font-semibold text-ink">运行指标</h2>
            <div className="mt-3.5 space-y-3">
              {[
                ['已处理文本块', '84,120', progress?.percent ?? 67.5, 'bg-brand-500'],
                ['Token 消耗', formatNumber(t.metrics?.tokens ?? 0), 45, 'bg-violet-500'],
                ['API 配额使用', '42%', 42, 'bg-emerald-500'],
              ].map(([label, value, pct, color]) => (
                <div key={String(label)}>
                  <div className="mb-1 flex items-center justify-between text-[10.5px]">
                    <span className="text-muted">{label}</span>
                    <span className="font-mono text-ink">{value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className={cn('h-full rounded-full', color as string)} style={{ width: `${pct as number}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-3.5">
              <div>
                <div className="text-[10px] text-soft">平均延迟</div>
                <div className="mt-0.5 font-mono text-[12.5px] font-medium text-ink">128 ms</div>
              </div>
              <div>
                <div className="text-[10px] text-soft">错误率</div>
                <div className="mt-0.5 font-mono text-[12.5px] font-medium text-emerald-600 dark:text-emerald-400">0.00%</div>
              </div>
              <div>
                <div className="text-[10px] text-soft">累计耗时</div>
                <div className="mt-0.5 font-mono text-[12.5px] font-medium text-ink">{formatDuration(t.durationSec)}</div>
              </div>
              <div>
                <div className="text-[10px] text-soft">费用</div>
                <div className="mt-0.5 font-mono text-[12.5px] font-medium text-ink">¥{(t.metrics?.cost ?? 0).toFixed(2)}</div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
              <div>
                <div className="text-[11px] font-medium text-ink">任务支持断点续跑</div>
                <p className="mt-1 text-[10.5px] leading-4 text-muted">
                  若任务失败，重试时会从最近一次检查点继续，不会重复消耗已完成的 Token。
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="确认取消此任务？"
        description="取消后需重新提交，执行中的资源将被释放。"
        confirmText="确认取消"
        onConfirm={() => cancel.mutate(t.id, { onSuccess: () => toast.success('任务已取消') })}
      />
    </div>
  )
}
