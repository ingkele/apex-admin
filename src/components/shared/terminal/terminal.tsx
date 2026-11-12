/**
 * 终端面板（纯 DOM 手写，零新依赖——与验证码组同思路，不引入 xterm.js）
 * 深底等宽输出区 + 内联输入行；键盘：Enter 提交 / ↑↓ 历史 / Tab 补全 / Ctrl+L 清屏 / Ctrl+C 取消
 */
import * as React from 'react'
import { Server } from 'lucide-react'
import { TERMINAL_HOSTS } from './commands'
import type { TerminalLine, TerminalTone } from './transport'
import type { TerminalSession } from './use-terminal-session'

const TONE_CLS: Record<TerminalTone, string> = {
  default: 'text-slate-300',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-rose-400',
  info: 'text-sky-400',
  muted: 'text-slate-500',
  accent: 'text-violet-300',
}

function LineRow({ line }: { line: TerminalLine }) {
  if (line.kind === 'prompt') {
    return (
      <div className="flex gap-2 px-4 py-[1px]">
        <span className="shrink-0 text-emerald-400">{line.prompt}</span>
        <span className="text-slate-200">{line.text}</span>
      </div>
    )
  }
  return (
    <div className={`px-4 py-[1px] whitespace-pre-wrap ${TONE_CLS[line.tone]}`}>
      {line.text || ' '}
    </div>
  )
}

export function TerminalPanel({ session }: { session: TerminalSession }) {
  const boxRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight
  }, [session.lines.length])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      session.submit()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      session.navigateHistory('up')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      session.navigateHistory('down')
    } else if (e.key === 'Tab') {
      e.preventDefault()
      session.complete()
    } else if (e.key.toLowerCase() === 'l' && e.ctrlKey) {
      e.preventDefault()
      session.clearScreen()
    } else if (e.key.toLowerCase() === 'c' && e.ctrlKey && !window.getSelection()?.toString()) {
      e.preventDefault()
      session.interrupt()
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      {/* 主机选项卡（切换即新会话） */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <span className="flex items-center gap-1.5 text-[11px] text-muted">
          <Server className="h-3.5 w-3.5" /> 主机
        </span>
        {TERMINAL_HOSTS.map((h) => {
          const active = h.id === session.host.id
          return (
            <button
              key={h.id}
              type="button"
              data-testid={`terminal-host-${h.id}`}
              onClick={() => session.switchHost(h.id)}
              className={
                active
                  ? 'flex items-center gap-2 rounded-lg border border-brand-300 bg-brand-50 px-2.5 py-1.5 text-left text-brand-700 transition-colors dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'flex items-center gap-2 rounded-lg border border-line bg-canvas/60 px-2.5 py-1.5 text-left text-muted transition-colors hover:border-brand-200 hover:text-ink'
              }
            >
              <span className={active ? 'h-1.5 w-1.5 rounded-full bg-emerald-500' : 'h-1.5 w-1.5 rounded-full bg-slate-400'} />
              <span className="font-mono text-[11px] font-medium">{h.label}</span>
              <span className="text-[10px] opacity-70">{h.desc}</span>
            </button>
          )
        })}
      </div>

      {/* 终端主体（风格对齐服务日志终端视图） */}
      <div className="bg-[#0b1220]" onClick={() => inputRef.current?.focus()}>
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#0f172a] px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <span className="font-mono text-[10.5px] text-slate-400">
              {session.host.user}@{session.host.hostname}
            </span>
            <span className="rounded border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 font-mono text-[9px] text-slate-500">
              bash
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] text-slate-500">
            <span>
              <span className="text-slate-300">{session.lines.length}</span> 行
            </span>
            <span className="h-3 w-px bg-slate-700" />
            <span>UTF-8</span>
          </div>
        </div>

        <div ref={boxRef} data-testid="terminal-output" className="h-[520px] overflow-auto py-2">
          {session.lines.length === 0 ? (
            <div className="px-4 py-16 text-center font-mono text-[11px] text-slate-500">
              已清屏 · 输入 help 查看可用命令
            </div>
          ) : (
            <div className="font-mono text-[11px] leading-[1.85]">
              {session.lines.map((l) => (
                <LineRow key={l.id} line={l} />
              ))}
            </div>
          )}

          {/* 内联输入行 */}
          <div className="flex gap-2 px-4 py-[1px] font-mono text-[11px] leading-[1.85]">
            <span className="shrink-0 text-emerald-400">{session.prompt}</span>
            <input
              id="terminal-command"
              ref={inputRef}
              data-testid="terminal-input"
              value={session.input}
              onChange={(e) => session.setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={session.status !== 'connected'}
              spellCheck={false}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-slate-200 caret-emerald-400 outline-none placeholder:text-slate-600 disabled:cursor-not-allowed"
              placeholder={session.status === 'connected' ? '输入命令…' : '会话已断开'}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
