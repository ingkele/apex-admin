import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowUpRight, Boxes, CheckCircle2, Code2, Database, GitBranch, Layers,
  Package, Rocket, Server, Sparkles,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { appConfig } from '@/app.config'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/about')({
  component: AboutPage,
})

const STACK = [
  { group: '前端', icon: Code2, items: ['React 19', 'TypeScript 5.9', 'TanStack Router', 'TanStack Query', 'TanStack Table v8', 'Tailwind CSS v4', 'Base UI 1.9', 'Recharts', 'react-grid-layout'] },
  { group: '后端', icon: Server, items: ['.NET 8', 'SQL Server 2022', 'Redis', 'RabbitMQ（Outbox）', 'JWT + MFA', 'Serilog'] },
  { group: '交付', icon: Boxes, items: ['Vite 7', 'GitHub Actions', 'Gitee Go', 'Docker', 'K8s（HPA）', 'Nginx'] },
]

const CHANGELOG = [
  { version: 'v2.4.1', date: '2026-11-08', tag: '当前版本', items: ['系统参数页支持分组锚点与配置健康检查', '角色权限矩阵拆分为菜单权限 11 项 + 按钮权限 9 项'] },
  { version: 'v2.4.0', date: '2026-11-06', tag: '', items: ['工作台支持拖拽 / 缩放 / 一键自动排序', '新增服务日志终端视图与 trace 检索'] },
  { version: 'v2.3.0', date: '2026-10-28', tag: '', items: ['新增菜单管理、部门管理、字典管理', '补齐 403 / 404 / 500 / 离线缺省页'] },
  { version: 'v2.2.0', date: '2026-10-12', tag: '', items: ['任务详情页重构：进度卡 + 执行时间线 + 断点续跑', 'API Key 增加到期提醒与环境标识'] },
]

const LINKS = [
  { label: '设计规范', desc: '设计 token、间距与组件约定', icon: Layers },
  { label: '接入文档', desc: 'API 契约、DTO 与错误码', icon: Package },
  { label: '问题反馈', desc: '提交缺陷或需求建议', icon: GitBranch },
  { label: '更新日志', desc: '完整版本变更历史', icon: Rocket },
]

const SYSTEM_INFO = [
  ['平台版本', 'v2.4.1（build 20261108.3）'],
  ['API 版本', 'v1 · /api/v1'],
  ['运行时', 'Node 22.22 · Chromium 141'],
  ['数据模式', 'Mock 内存态（切 VITE_DATA_MODE=live 接真实后端）'],
  ['部署区域', 'cn-shanghai-1 · 生产环境'],
  ['构建时间', '2026-11-08 14:26:41'],
]

function AboutPage() {
  return (
    <div>
      <PageHeader title="关于" description="平台版本信息、技术栈与变更记录。" />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border border-line bg-surface px-6 py-7">
        <div className="pointer-events-none absolute -top-24 right-0 h-56 w-72 rounded-full bg-gradient-to-br from-brand-500/15 to-brand-600/5 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-[20px] font-semibold text-white shadow-sm">
              {appConfig.logoText}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[19px] font-semibold tracking-tight text-ink">{appConfig.name}</h1>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10.5px] font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                  v2.4.1
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <CheckCircle2 className="h-2.5 w-2.5" /> 最新版本
                </span>
              </div>
              <p className="mt-1.5 max-w-[560px] text-[12.5px] leading-6 text-muted">
                面向企业 AI 应用的任务编排、模型接入与运行时治理平台。标准后台管理模板，
                支持角色权限矩阵、审计留痕与主题定制。
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-soft">
                <span>构建号 build 20261108.3</span>
                <span>MIT License</span>
                <span>{appConfig.copyright}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 grid grid-cols-12 items-start gap-5">
        {/* 左：技术栈 + 系统信息 */}
        <div className="col-span-12 space-y-5 lg:col-span-7">
          <section className="rounded-xl border border-line bg-surface p-5">
            <h2 className="flex items-center gap-1.5 text-[13.5px] font-semibold text-ink">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" /> 技术栈
            </h2>
            <div className="mt-4 space-y-4">
              {STACK.map((g) => (
                <div key={g.group}>
                  <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-muted">
                    <g.icon className="h-3 w-3" /> {g.group}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {g.items.map((it) => (
                      <span
                        key={it}
                        className="rounded-md border border-line bg-canvas/60 px-2 py-1 font-mono text-[10.5px] text-muted"
                      >
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                <Database className="h-3.5 w-3.5 text-soft" /> 系统信息
              </h2>
            </div>
            <div className="divide-y divide-line px-5">
              {SYSTEM_INFO.map(([k, v]) => (
                <div key={k} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-[11.5px]">
                  <span className="text-muted">{k}</span>
                  <span className="font-mono text-[11px] text-ink">{v}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 右：更新日志 + 链接 */}
        <div className="col-span-12 space-y-5 lg:col-span-5">
          <section className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-[13.5px] font-semibold text-ink">更新日志</h2>
            <div className="mt-4 space-y-4">
              {CHANGELOG.map((c, i) => (
                <div key={c.version} className="relative pl-5">
                  <span
                    className={cn(
                      'absolute left-0 top-1.5 h-2 w-2 rounded-full',
                      i === 0 ? 'bg-brand-600 ring-4 ring-brand-500/15' : 'bg-slate-300 dark:bg-slate-600',
                    )}
                  />
                  {i < CHANGELOG.length - 1 ? (
                    <span className="absolute left-[3.5px] top-4 h-full w-px bg-line" />
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11.5px] font-medium text-ink">{c.version}</span>
                    <span className="text-[10.5px] text-soft">{c.date}</span>
                    {c.tag ? (
                      <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9.5px] text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                        {c.tag}
                      </span>
                    ) : null}
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {c.items.map((it) => (
                      <li key={it} className="flex items-start gap-1.5 text-[11px] leading-5 text-muted">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-soft" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-line bg-surface">
            {LINKS.map((l) => (
              <button
                key={l.label}
                type="button"
                className="flex w-full items-center gap-3 border-b border-line px-5 py-3 text-left transition last:border-0 hover:bg-hover/60"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-canvas text-soft">
                  <l.icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-medium text-ink">{l.label}</span>
                  <span className="block text-[10.5px] text-soft">{l.desc}</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-soft" />
              </button>
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}
