import * as React from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/** 对话框 —— Base UI Dialog 底层（受控 open） */
export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  width = 'w-[520px]',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  width?: string
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => onOpenChange(v)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px]" />
        <Dialog.Popup
          className={cn(
            'fixed left-1/2 top-1/2 z-50 max-h-[86vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-line bg-surface shadow-pop',
            width,
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-1">
            <div>
              <Dialog.Title className="text-[15px] font-semibold text-ink">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-[12.5px] text-muted">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close className="rounded-md p-1 text-soft transition hover:bg-hover hover:text-ink">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="px-6 pb-5">{children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
