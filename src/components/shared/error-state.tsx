import * as React from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ErrorTone = 'brand' | 'amber' | 'rose' | 'slate'

const TONE: Record<ErrorTone, { ring: string; code: string; icon: string }> = {
  brand: {
    ring: 'from-brand-500/15 to-brand-600/5',
    code: 'from-brand-600 to-brand-400',
    icon: 'bg-blue-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  },
  amber: {
    ring: 'from-amber-500/15 to-amber-600/5',
    code: 'from-amber-600 to-amber-400',
    icon: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  },
  rose: {
    ring: 'from-rose-500/15 to-rose-600/5',
    code: 'from-rose-600 to-rose-400',
    icon: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  },
  slate: {
    ring: 'from-slate-500/15 to-slate-600/5',
    code: 'from-slate-600 to-slate-400',
    icon: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  },
}

/** 缺省页统一骨架：403 / 404 / 500 / 离线共用 */
export function ErrorState({
  code,
  title,
  description,
  tone = 'brand',
  icon,
  tips,
  onRetry,
  retryText = '重新加载',
  bare = false,
}: {
  code: string
  title: string
  description: string
  tone?: ErrorTone
  icon: React.ReactNode
  /** 常见原因 / 排查建议 */
  tips?: string[]
  onRetry?: () => void
  retryText?: string
  /** 嵌入卡片内部使用：去掉整屏高度与卡片描边 */
  bare?: boolean
}) {
  const t = TONE[tone]
  const router = useRouter()

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        bare ? 'py-8' : 'min-h-[calc(100vh-14rem)] py-10',
      )}
    >
      <div className="w-full max-w-[560px]">
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl text-center',
            bare ? 'px-6 py-4' : 'border border-line bg-surface px-8 py-10',
          )}
        >
          {/* 光晕 */}
          {bare ? null : (
            <div className={cn('pointer-events-none absolute inset-x-0 -top-24 h-56 bg-gradient-to-b blur-2xl', t.ring)} />
          )}
          <div className="relative">
            <div className={cn('mx-auto flex h-12 w-12 items-center justify-center rounded-2xl', t.icon)}>{icon}</div>
            <div
              className={cn(
                'mt-4 bg-gradient-to-br bg-clip-text bg-clip-text leading-none font-bold tracking-tight text-transparent tabular-nums',
                bare ? 'text-[44px]' : 'text-[64px]',
                t.code,
              )}
            >
              {code}
            </div>
            <h1 className="mt-3 text-[18px] font-semibold text-ink">{title}</h1>
            <p className="mx-auto mt-2 max-w-[420px] text-[12.5px] leading-6 text-muted">{description}</p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Link to="/dashboard">
                <Button size="sm">
                  <Home className="h-3.5 w-3.5" /> 回到工作台
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => router.history.back()}>
                <ArrowLeft className="h-3.5 w-3.5" /> 返回上一页
              </Button>
              <Button variant="outline" size="sm" onClick={onRetry ?? (() => window.location.reload())}>
                <RefreshCw className="h-3.5 w-3.5" /> {retryText}
              </Button>
            </div>
          </div>
        </div>

        {tips?.length ? (
          <div className="mt-5 rounded-xl border border-line bg-surface px-5 py-4">
            <div className="text-[11.5px] font-medium text-ink">可能的原因</div>
            <ul className="mt-2 space-y-1.5">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-[11px] leading-5 text-muted">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-soft" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
