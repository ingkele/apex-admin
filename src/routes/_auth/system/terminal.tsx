import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Eraser, Plug, PlugZap, Terminal as TerminalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { TerminalPanel } from '@/components/shared/terminal/terminal'
import { useTerminalSession } from '@/components/shared/terminal/use-terminal-session'
import type { TerminalStatus } from '@/components/shared/terminal/transport'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/system/terminal')({
  component: TerminalPage,
})

const STATUS_META: Record<TerminalStatus, { label: string; cls: string; dot: string }> = {
  connected: { label: '已连接', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', dot: 'bg-emerald-500' },
  connecting: { label: '连接中', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400', dot: 'bg-amber-500' },
  disconnected: { label: '已断开', cls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400', dot: 'bg-rose-500' },
}

function TerminalPage() {
  const session = useTerminalSession()
  const meta = STATUS_META[session.status]

  return (
    <div>
      <PageHeader
        title="终端"
        description="模拟终端运维入口：内置命令集与内存文件系统，支持命令历史、Tab 补全与多主机会话切换；live 模式预留 WebSocket 传输层对接点。"
        actions={
          <>
            <span
              data-testid="terminal-status"
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium',
                meta.cls,
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
              {meta.label}
            </span>
            <Button variant="outline" size="sm" onClick={session.clearScreen}>
              <Eraser className="h-3.5 w-3.5" /> 清屏
            </Button>
            {session.status === 'connected' ? (
              <Button variant="outline" size="sm" onClick={session.disconnect}>
                <Plug className="h-3.5 w-3.5" /> 断开连接
              </Button>
            ) : (
              <Button size="sm" onClick={session.connect}>
                <PlugZap className="h-3.5 w-3.5" /> 重新连接
              </Button>
            )}
          </>
        }
      />

      <TerminalPanel session={session} />

      <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted">
        <TerminalIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        演示模式：命令在浏览器本地模拟执行（help / ls / cd / cat / ping / neofetch 等 15 个命令），无真实远程连接。
        接入真实后端时向 useTerminalSession 注入 WebSocketTransport（见 transport.ts 对接说明），页面零改动。
      </p>
    </div>
  )
}
