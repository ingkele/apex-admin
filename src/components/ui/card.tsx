import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn('rounded-xl border border-line bg-surface', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn('flex items-center justify-between gap-3 border-b border-line px-5 py-4', className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('text-[14px] font-semibold text-ink', className)} {...props} />
  )
}

export function CardContent({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('p-5', className)} {...props} />
}
