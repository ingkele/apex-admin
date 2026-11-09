import * as React from 'react'
import { AlertDialog } from '@base-ui/react/alert-dialog'
import { AlertTriangle } from 'lucide-react'
import { Button } from './button'

/** 危险操作二次确认 —— Base UI AlertDialog 底层（设计方案 §6.5） */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = '确认',
  danger = true,
  onConfirm,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  danger?: boolean
  onConfirm: () => void
  children?: React.ReactNode
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(v) => onOpenChange(v)}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px]" />
        <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[420px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-surface p-6 shadow-pop">
          <div className="flex items-start gap-3">
            {danger ? (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10">
                <AlertTriangle className="h-4.5 w-4.5" />
              </div>
            ) : null}
            <div className="min-w-0">
              <AlertDialog.Title className="text-[15px] font-semibold text-ink">
                {title}
              </AlertDialog.Title>
              {description ? (
                <AlertDialog.Description className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                  {description}
                </AlertDialog.Description>
              ) : null}
              {children}
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialog.Close
              render={
                <Button variant="outline" size="sm">
                  取消
                </Button>
              }
            />
            <Button
              variant={danger ? 'danger' : 'primary'}
              size="sm"
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
            >
              {confirmText}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
