import * as React from 'react'
import { Switch } from '@base-ui/react/switch'
import { cn } from '@/lib/utils'

/** 开关 —— Base UI Switch 底层 */
export function AppSwitch({
  checked,
  onCheckedChange,
  disabled,
  className,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        // flex + items-center：16px 圆点在 20px 轨道内上下各留 2px，垂直居中不依赖 translate
        'relative flex h-[20px] w-[36px] shrink-0 cursor-pointer items-center rounded-full px-[2px] transition-colors outline-none',
        'bg-slate-200 data-[checked]:bg-brand-600 dark:bg-slate-700',
        'focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      <Switch.Thumb className="block h-[16px] w-[16px] shrink-0 rounded-full bg-white shadow-sm transition-all duration-200 data-[checked]:ml-auto" />
    </Switch.Root>
  )
}
