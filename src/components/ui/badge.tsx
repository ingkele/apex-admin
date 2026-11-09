import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium',
  {
    variants: {
      variant: {
        brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
        green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
        red: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
        gray: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400',
      },
    },
    defaultVariants: { variant: 'gray' },
  },
)

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<'span'>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

/** 通用状态徽章：把业务状态映射为颜色语义 */
const STATUS_VARIANT: Record<string, 'brand' | 'green' | 'red' | 'amber' | 'gray'> = {
  running: 'brand',
  success: 'green',
  healthy: 'green',
  warn: 'amber',
  maintenance: 'gray',
  active: 'green',
  enabled: 'green',
  failed: 'red',
  down: 'red',
  disabled: 'gray',
  cancelled: 'gray',
  queued: 'amber',
  degraded: 'amber',
  invited: 'amber',
  revoked: 'gray',
  readonly: 'gray',
  low: 'gray',
  medium: 'amber',
  high: 'red',
}

const STATUS_LABEL: Record<string, string> = {
  running: '运行中',
  success: '成功',
  failed: '失败',
  queued: '排队中',
  cancelled: '已取消',
  healthy: '健康',
  warn: '告警',
  maintenance: '维护中',
  degraded: '降级',
  down: '宕机',
  active: '正常',
  invited: '待激活',
  disabled: '已停用',
  readonly: '只读',
  enabled: '启用',
  revoked: '已撤销',
  low: '低',
  medium: '中',
  high: '高',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? 'gray'} className={className}>
      {STATUS_LABEL[status] ?? status}
    </Badge>
  )
}
