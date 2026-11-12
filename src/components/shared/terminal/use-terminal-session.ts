/**
 * 终端会话 hook：输入、命令历史、输出流、主机切换、连接状态
 *
 * mock 模式（默认）：命令本地执行（commands.ts），零后端依赖
 * live 模式：注入 TerminalTransport（见 transport.ts），输出由后端回传，页面零改动
 */
import * as React from 'react'
import {
  completeCommand, displayPath, executeCommand, getHostFs, TERMINAL_HOSTS,
  type CommandOutputLine,
} from './commands'
import type { TerminalHost, TerminalLine, TerminalStatus, TerminalTransport } from './transport'

export interface UseTerminalSessionOptions {
  /** live 模式传输层；不传即 mock 模式 */
  transport?: TerminalTransport
}

export type TerminalSession = ReturnType<typeof useTerminalSession>

export function useTerminalSession(options?: UseTerminalSessionOptions) {
  const transport = options?.transport

  const [lines, setLines] = React.useState<TerminalLine[]>([])
  const [input, setInput] = React.useState('')
  const [history, setHistory] = React.useState<string[]>([])
  const [historyIdx, setHistoryIdx] = React.useState<number | null>(null)
  const [status, setStatus] = React.useState<TerminalStatus>(transport ? 'connecting' : 'connected')
  const [host, setHost] = React.useState<TerminalHost>(TERMINAL_HOSTS[0])
  const [cwd, setCwd] = React.useState('/home/apex')

  const idRef = React.useRef(0)
  const hostRef = React.useRef(host)
  hostRef.current = host

  const prompt = `${host.user}@${host.hostname}:${displayPath(cwd)}$ `

  const pushLines = React.useCallback((items: Array<Omit<TerminalLine, 'id'>>) => {
    setLines((prev) => [...prev, ...items.map((l) => ({ ...l, id: idRef.current++ }))])
  }, [])

  const pushOut = React.useCallback(
    (items: CommandOutputLine[]) => pushLines(items.map((l) => ({ kind: 'out' as const, text: l.text, tone: l.tone }))),
    [pushLines],
  )

  /** 会话横幅（进入/切换主机/重新连接时输出） */
  const pushBanner = React.useCallback(
    (h: TerminalHost) => {
      pushLines([
        { kind: 'out', text: `Apex Admin Mock Terminal · ${h.label}（${h.desc}）`, tone: 'accent' },
        { kind: 'out', text: '演示会话：内置命令集 + 内存文件系统，无真实远程连接。输入 help 查看可用命令。', tone: 'muted' },
        { kind: 'out', text: `Last login: ${new Date().toLocaleString('zh-CN')} on mock-console`, tone: 'muted' },
      ])
    },
    [pushLines],
  )

  // 首次进入：输出横幅（mock）/ 建立传输连接（live）
  React.useEffect(() => {
    if (transport) {
      const offLine = transport.onLine((text, tone) => pushOut([{ text, tone }]))
      const offStatus = transport.onStatus(setStatus)
      transport.connect(hostRef.current).catch(() => setStatus('disconnected'))
      return () => {
        offLine()
        offStatus()
      }
    }
    pushBanner(hostRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** 提交一行输入 */
  const submit = React.useCallback(() => {
    const raw = input
    setInput('')
    setHistoryIdx(null)
    pushLines([{ kind: 'prompt', prompt, text: raw, tone: 'default' }])

    const trimmed = raw.trim()
    if (trimmed) setHistory((prev) => [...prev, trimmed])

    if (status !== 'connected') {
      pushOut([{ text: 'bash: 会话已断开，请先点击「重新连接」', tone: 'error' }])
      return
    }

    if (transport) {
      transport.send(raw)
      return
    }

    const result = executeCommand(raw, {
      host: hostRef.current,
      cwd,
      fs: getHostFs(hostRef.current.id),
      history: [...history, ...(trimmed ? [trimmed] : [])],
    })
    if (result.clear) {
      setLines([])
      return
    }
    pushOut(result.lines)
    if (result.nextCwd) setCwd(result.nextCwd)
    if (result.exit) setStatus('disconnected')
  }, [input, prompt, status, transport, cwd, history, pushLines, pushOut])

  /** ↑↓ 浏览命令历史 */
  const navigateHistory = React.useCallback(
    (dir: 'up' | 'down') => {
      if (history.length === 0) return
      let next: number | null
      if (dir === 'up') next = historyIdx === null ? history.length - 1 : Math.max(0, historyIdx - 1)
      else if (historyIdx === null) return
      else next = historyIdx + 1
      if (next >= history.length) {
        setHistoryIdx(null)
        setInput('')
        return
      }
      setHistoryIdx(next)
      setInput(history[next])
    },
    [history, historyIdx],
  )

  /** Tab 补全命令名 */
  const complete = React.useCallback(() => {
    setInput((cur) => {
      if (cur.includes(' ')) return cur
      return completeCommand(cur) ?? cur
    })
  }, [])

  /** Ctrl+C：取消当前行 */
  const interrupt = React.useCallback(() => {
    pushLines([{ kind: 'prompt', prompt, text: `${input}^C`, tone: 'warning' }])
    setInput('')
    setHistoryIdx(null)
  }, [input, prompt, pushLines])

  /** Ctrl+L / 页头清屏按钮 */
  const clearScreen = React.useCallback(() => setLines([]), [])

  /** 页头断开连接 */
  const disconnect = React.useCallback(() => {
    transport?.disconnect()
    setStatus('disconnected')
    pushOut([{ text: '连接已断开', tone: 'warning' }])
  }, [transport, pushOut])

  /** 页头重新连接 */
  const connect = React.useCallback(() => {
    setStatus('connected')
    pushBanner(hostRef.current)
    pushOut([{ text: '连接已建立（演示）', tone: 'success' }])
  }, [pushBanner, pushOut])

  /** 切换主机 = 新会话：清屏 + 新横幅，历史保留（类 shell 行为） */
  const switchHost = React.useCallback(
    (id: string) => {
      const next = TERMINAL_HOSTS.find((h) => h.id === id)
      if (!next || next.id === hostRef.current.id) return
      setHost(next)
      hostRef.current = next
      setCwd('/home/apex')
      setInput('')
      setHistoryIdx(null)
      setLines([])
      pushBanner(next)
    },
    [pushBanner],
  )

  return {
    lines, input, setInput, prompt, status, host, cwd,
    history, submit, navigateHistory, complete, interrupt, clearScreen,
    disconnect, connect, switchHost,
  }
}
