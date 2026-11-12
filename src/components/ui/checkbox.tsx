import * as React from 'react'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

/** 复选框 —— 原生 input 打底（保留键盘与表单语义），视觉用 peer 状态绘制 */
export function Checkbox({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  indeterminate,
  className,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
  indeterminate?: boolean
  className?: string
}) {
  const ref = React.useRef<HTMLInputElement>(null)
  const autoId = React.useId()

  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate) && !checked
  }, [indeterminate, checked])

  const box = (
    <span className="relative mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center">
      <input
        id={autoId}
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className={cn(
          'peer h-4 w-4 cursor-pointer appearance-none rounded border border-line bg-surface transition-colors',
          'checked:border-brand-600 checked:bg-brand-600 indeterminate:border-brand-600 indeterminate:bg-brand-600',
          'focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      />
      <Check
        className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
        strokeWidth={3}
      />
      {indeterminate && !checked ? (
        <Minus className="pointer-events-none absolute h-3 w-3 text-white" strokeWidth={3} />
      ) : null}
    </span>
  )

  if (!label && !description) return box

  return (
    <label className={cn('flex cursor-pointer items-start gap-2 select-none', disabled && 'cursor-not-allowed opacity-60')}>
      {box}
      <span className="min-w-0">
        {label ? <span className="block text-[12.5px] text-ink">{label}</span> : null}
        {description ? <span className="mt-0.5 block text-[10.5px] text-muted">{description}</span> : null}
      </span>
    </label>
  )
}
