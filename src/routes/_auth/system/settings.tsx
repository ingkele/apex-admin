import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowUpRight, BellRing, CheckCircle2, ChevronRight, Clock, History, Info, Link2,
  AlertTriangle, RotateCcw, Save, ShieldCheck, SlidersHorizontal, Webhook,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { AppSwitch } from '@/components/ui/switch'
import { PageHeader } from '@/components/shared/page-header'
import { Can } from '@/components/shared/can'
import { useSaveSettings, useSettings, useUserStats } from '@/api'
import type { SettingItem, Settings } from '@/mocks/db'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/system/settings')({
  component: SettingsPage,
})

/** 通知事件推送节奏（原型订阅事件卡片右侧小字） */
const EVENT_CADENCE: Record<string, string> = {
  任务执行失败: '即时',
  服务健康异常: '即时',
  密钥即将过期: 'T-7 天',
  高风险审计事件: '即时',
  模型调用量异常: '每小时',
  周报摘要: '每周一',
}

/** 三个分组区块的头部元信息 */
const GROUP_META: {
  key: string
  anchor: string
  icon: typeof SlidersHorizontal
  iconBox: string
  desc: string
  right: React.ReactNode
}[] = [
  {
    key: '基础参数',
    anchor: 'basic',
    icon: SlidersHorizontal,
    iconBox: 'bg-blue-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
    desc: '平台展示信息与默认任务行为配置。',
    right: (
      <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] text-muted dark:bg-slate-800">
        4 项修改将影响所有成员
      </span>
    ),
  },
  {
    key: '安全参数',
    anchor: 'security',
    icon: ShieldCheck,
    iconBox: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    desc: '登录策略、密钥生命周期与访问控制。',
    right: (
      <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
        <ShieldCheck className="h-2.5 w-2.5" /> 安全基线已通过
      </span>
    ),
  },
  {
    key: '通知参数',
    anchor: 'notification',
    icon: BellRing,
    iconBox: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    desc: '配置告警接收渠道与触发事件。',
    right: (
      <span className="ml-auto shrink-0 text-[10.5px] font-medium text-brand-600 hover:text-brand-700">
        查看通知记录
      </span>
    ),
  },
]

function SettingsPage() {
  const settings = useSettings()
  const save = useSaveSettings()
  const userStats = useUserStats()
  const [draft, setDraft] = React.useState<Settings | null>(null)

  React.useEffect(() => {
    if (settings.data && !draft) setDraft(JSON.parse(JSON.stringify(settings.data)))
  }, [settings.data, draft])

  const update = (group: string, key: string, value: string) => {
    setDraft((d) => {
      if (!d) return d
      return { ...d, [group]: d[group].map((it) => (it.key === key ? { ...it, value } : it)) }
    })
  }

  const dirty = !!(draft && settings.data && JSON.stringify(draft) !== JSON.stringify(settings.data))

  const reset = () => {
    setDraft(settings.data ? JSON.parse(JSON.stringify(settings.data)) : null)
    toast.info('已放弃未保存的更改')
  }

  const submit = () => {
    if (!draft) return
    save.mutate(draft, { onSuccess: () => toast.success('参数已保存', { description: '变更已记录到审计日志' }) })
  }

  const memberCount = userStats.data?.total ?? 48

  return (
    <div>
      <PageHeader
        title="系统参数"
        eyebrow={
          <div className="flex items-center gap-1.5">
            <span>系统管理</span>
            <ChevronRight className="h-3 w-3 text-soft" />
            <span className="font-medium text-ink">系统参数</span>
          </div>
        }
        description="配置平台基础信息、安全策略与通知规则，变更将记录到审计日志。"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5" /> 恢复默认
            </Button>
            <Can permission="setting:manage">
              <Button size="sm" disabled={!dirty || save.isPending} onClick={submit}>
                <Save className="h-3.5 w-3.5" /> 保存更改
              </Button>
            </Can>
          </>
        }
      />

      {/* 配置分组锚点条 */}
      <div className="mb-5 flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1.5">
        <span className="px-2 text-[10px] font-medium tracking-wide text-soft uppercase">配置分组</span>
        {GROUP_META.map((g) => (
          <a
            key={g.anchor}
            href={`#${g.anchor}`}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(g.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="rounded-md px-3 py-1.5 text-[11.5px] font-medium text-muted transition hover:bg-hover hover:text-ink"
          >
            {g.key}
          </a>
        ))}
        <span className="ml-auto flex items-center gap-1.5 px-2 text-[10.5px] text-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          生产环境 · 配置已同步
        </span>
      </div>

      <div className="grid grid-cols-12 items-start gap-5">
        {/* 左：三组参数表单 */}
        <div className="col-span-12 space-y-5 lg:col-span-8">
          {draft
            ? GROUP_META.map((meta) => {
                const GroupIcon = meta.icon
                return (
                <section
                  key={meta.anchor}
                  id={meta.anchor}
                  className="scroll-mt-4 overflow-hidden rounded-xl border border-line bg-surface"
                >
                  <div className="flex items-start gap-3 border-b border-line px-5 py-4">
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', meta.iconBox)}>
                      <GroupIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-[13.5px] font-semibold text-ink">{meta.key}</h2>
                      <p className="mt-0.5 text-[10.5px] text-muted">{meta.desc}</p>
                    </div>
                    {meta.right}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-5">
                    {(draft[meta.key] ?? []).map((item) => (
                      <Field
                        key={item.key}
                        item={item}
                        onChange={(v) => update(meta.key, item.key, v)}
                      />
                    ))}
                  </div>
                </section>
                )
              })
            : (
                <div className="rounded-xl border border-line bg-surface py-20 text-center text-[13px] text-soft">
                  加载中…
                </div>
              )}

          {/* 底部保存条 */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-5 py-3.5">
            <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] text-soft">
              <History className="h-3 w-3" />
              上次保存：<span className="font-medium text-muted">2026-11-08 14:32</span> · 陈昊
              <span className="ml-1 font-medium text-brand-600">查看变更记录</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={reset}>
                取消更改
              </Button>
              <Can permission="setting:manage">
                <Button size="sm" disabled={!dirty || save.isPending} onClick={submit}>
                  <Save className="h-3.5 w-3.5" /> 保存所有参数
                </Button>
              </Can>
            </div>
          </div>
        </div>

        {/* 右：摘要 / 健康检查 / 影响提示 */}
        <aside className="col-span-12 space-y-5 lg:col-span-4">
          <section className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="border-b border-line px-4 py-3.5">
              <h2 className="text-[13px] font-semibold text-ink">配置摘要</h2>
              <p className="mt-0.5 text-[10px] text-muted">当前生产工作区的运行信息</p>
            </div>
            <div className="divide-y divide-line px-4">
              {[
                {
                  k: '环境',
                  v: (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      production
                    </span>
                  ),
                },
                { k: '平台版本', v: <span className="font-mono text-[11px] text-ink">v2.4.1</span> },
                { k: '区域', v: <span className="font-mono text-[11px] text-ink">cn-shanghai-1</span> },
                { k: '工作区 ID', v: <span className="font-mono text-[11px] text-ink">ws_apex_prod</span> },
                { k: '成员数', v: <span className="text-[11px] text-ink">{memberCount} 人</span> },
                {
                  k: '运行状态',
                  v: (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 正常
                    </span>
                  ),
                },
              ].map((r) => (
                <div key={r.k} className="flex items-center justify-between py-3 text-[11.5px]">
                  <span className="text-muted">{r.k}</span>
                  {r.v}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-[13px] font-semibold text-ink">配置健康检查</h2>
                <p className="mt-0.5 text-[10px] text-muted">上次检查：今天 08:30</p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                3 / 4 通过
              </span>
            </div>
            <div className="mt-3 space-y-2.5">
              {[
                { ok: true, t: '多因素认证已启用', s: '所有管理员账号强制 MFA' },
                { ok: true, t: '密钥轮换策略合规', s: '最长有效期 365 天，提前 7 天提醒' },
                { ok: true, t: '审计日志保留充足', s: '365 天 · 加密存储' },
                { ok: false, t: 'IP 白名单范围较宽', s: '建议收紧至办公网出口地址' },
              ].map((c) => (
                <div key={c.t} className="flex items-start gap-2">
                  {c.ok ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  )}
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-medium text-ink">{c.t}</div>
                    <div className="text-[10px] text-soft">{c.s}</div>
                  </div>
                </div>
              ))}
            </div>
            <a className="mt-3 flex items-center justify-between rounded-lg border border-line px-3 py-2 text-[11px] font-medium text-muted transition hover:bg-hover hover:text-ink">
              查看安全审计记录
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </section>

          <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
            <div className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-amber-600" />
              <h2 className="text-[12.5px] font-semibold text-amber-800 dark:text-amber-300">变更影响提示</h2>
            </div>
            <p className="mt-1.5 text-[10.5px] leading-4 text-amber-700/80 dark:text-amber-300/70">
              修改安全参数可能导致现有会话失效。建议在业务低峰期操作，并提前通知团队成员。
            </p>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-700/70 dark:text-amber-300/60">
              <Clock className="h-2.5 w-2.5" /> 低峰时段：22:00 - 08:00
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

/** 单个参数字段 —— 按 SettingItem.type 渲染对应控件 */
function Field({ item, onChange }: { item: SettingItem; onChange: (value: string) => void }) {
  const id = `setting-${item.key}`

  // 行内开关卡片
  if (item.type === 'switch') {
    const box = (
      <div className="flex w-full items-center justify-between gap-3 rounded-lg border border-line px-3.5 py-3">
        <div className="min-w-0">
          <div className="text-[12px] font-medium text-ink">{item.label}</div>
          {item.desc ? <div className="mt-0.5 text-[10.5px] text-muted">{item.desc}</div> : null}
        </div>
        <AppSwitch checked={item.value === 'true'} onCheckedChange={(v) => onChange(String(v))} />
      </div>
    )
    return item.row ? <div className="col-span-2">{box}</div> : <div className="col-span-1 flex items-end">{box}</div>
  }

  let control: React.ReactNode
  switch (item.type) {
    case 'select':
      control = (
        <AppSelect
          value={item.value}
          onValueChange={onChange}
          className="text-[12px]"
          options={(item.options ?? []).map((v) => ({ value: v, label: v }))}
        />
      )
      break
    case 'number':
      control = (
        <div className="flex h-9 items-center rounded-lg border border-line bg-surface focus-within:border-brand-300">
          <input
            id={id}
            type="number"
            value={item.value}
            onChange={(e) => onChange(e.target.value)}
            className="h-full min-w-0 flex-1 rounded-lg bg-transparent px-3 text-[12px] text-ink outline-none"
          />
          {item.unit ? <span className="pr-3 text-[10px] text-soft">{item.unit}</span> : null}
        </div>
      )
      break
    case 'url': {
      const Icon = item.testable ? Webhook : Link2
      control = (
        <div className="flex h-9 items-center gap-2 rounded-lg border border-line bg-canvas/50 px-3">
          <Icon className="h-3 w-3 shrink-0 text-soft" />
          <input
            id={id}
            type="url"
            value={item.value}
            onChange={(e) => onChange(e.target.value)}
            className="h-full min-w-0 flex-1 bg-transparent font-mono text-[11.5px] text-ink outline-none"
          />
          {item.inlineBadge ? (
            <span className="flex shrink-0 items-center gap-1 text-[10px] text-emerald-600">
              <CheckCircle2 className="h-2.5 w-2.5" /> {item.inlineBadge}
            </span>
          ) : null}
          {item.testable ? (
            <button
              type="button"
              onClick={() => toast.success('测试通知事件已发送到 Webhook')}
              className="shrink-0 rounded-md border border-line bg-surface px-2 py-1 text-[10px] font-medium text-muted transition hover:bg-hover hover:text-ink"
            >
              测试
            </button>
          ) : null}
        </div>
      )
      break
    }
    case 'textarea':
      control = (
        <Textarea
          id={id}
          rows={2}
          value={item.value}
          placeholder={item.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn('min-h-0 text-[12px]', item.key === 'ipAllowlist' && 'font-mono text-[11px]')}
        />
      )
      break
    case 'timerange': {
      const [start, end] = item.value.split('|')
      control = (
        <div className="flex items-center gap-2">
          <Input
            id={id}
            type="time"
            value={start}
            onChange={(e) => onChange(`${e.target.value}|${end}`)}
            className="text-[12px]"
          />
          <span className="shrink-0 text-[10px] text-soft">至</span>
          <Input
            type="time"
            value={end}
            onChange={(e) => onChange(`${start}|${e.target.value}`)}
            className="text-[12px]"
          />
        </div>
      )
      break
    }
    case 'checks': {
      const picked = item.value ? item.value.split(',') : []
      control = (
        <div className="grid grid-cols-2 gap-1.5">
          {(item.options ?? []).map((opt) => {
            const checked = picked.includes(opt)
            return (
              <label
                key={opt}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-[11.5px] text-ink transition hover:bg-hover"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    onChange(
                      (checked ? picked.filter((p) => p !== opt) : [...picked, opt]).join(','),
                    )
                  }
                  className="h-3.5 w-3.5 shrink-0 rounded accent-brand-600"
                />
                <span className="flex-1">{opt}</span>
                <span className="text-[9.5px] text-soft">{EVENT_CADENCE[opt] ?? '即时'}</span>
              </label>
            )
          })}
        </div>
      )
      break
    }
    default:
      control = <Input id={id} value={item.value} onChange={(e) => onChange(e.target.value)} className="text-[12px]" />
  }

  return (
    <div className={item.full ? 'col-span-2' : undefined}>
      <Label htmlFor={id} className="mb-1.5 block text-[12px] font-medium text-ink">
        {item.label}
        {item.required ? <span className="ml-0.5 text-rose-500">*</span> : null}
      </Label>
      {control}
      {item.desc ? <p className="mt-1.5 text-[10.5px] leading-4 text-soft">{item.desc}</p> : null}
    </div>
  )
}
