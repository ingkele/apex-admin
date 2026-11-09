import * as React from 'react'
import { Select } from '@base-ui/react/select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface AppSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

/** 下拉选择 —— Base UI Select 底层 */
export function AppSelect({ value, onValueChange, options, placeholder = '请选择', className, disabled }: AppSelectProps) {
  return (
    <Select.Root value={value} onValueChange={(v) => onValueChange(String(v))} disabled={disabled}>
      <Select.Trigger
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 text-[13px] text-ink outline-none transition-colors',
          'hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:opacity-50',
          className,
        )}
      >
        <Select.Value placeholder={placeholder}>
          {(value) => options.find((o) => o.value === value)?.label ?? placeholder}
        </Select.Value>
        <Select.Icon className="text-soft">
          <ChevronDown className="h-3.5 w-3.5" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={6} className="z-50">
          <Select.Popup className="max-h-[280px] overflow-y-auto rounded-xl border border-line bg-elevated p-1 shadow-pop">
            <Select.List>
              {options.map((opt) => (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-[13px] text-ink outline-none select-none data-[highlighted]:bg-hover data-[selected]:text-brand-600"
                >
                  <Select.ItemText>{opt.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check className="h-3.5 w-3.5 text-brand-600" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
