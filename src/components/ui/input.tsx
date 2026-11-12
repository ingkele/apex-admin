import * as React from 'react'
import { cn } from '@/lib/utils'

export const inputBase =
  'h-9 w-full rounded-lg border border-line bg-surface px-3 text-[13px] text-ink outline-none transition-colors placeholder:text-soft focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-50'

export function Input({ className, id, ...props }: React.ComponentPropsWithoutRef<'input'>) {
  const autoId = React.useId()
  return <input id={id ?? autoId} className={cn(inputBase, className)} {...props} />
}

export function Textarea({ className, id, ...props }: React.ComponentPropsWithoutRef<'textarea'>) {
  const autoId = React.useId()
  return (
    <textarea
      id={id ?? autoId}
      className={cn(inputBase, 'h-auto min-h-[88px] resize-y py-2', className)}
      {...props}
    />
  )
}

export function Label({ className, ...props }: React.ComponentPropsWithoutRef<'label'>) {
  return (
    <label
      className={cn('mb-1.5 block text-[12.5px] font-medium text-ink', className)}
      {...props}
    />
  )
}
