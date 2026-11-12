/**
 * 终端传输层 —— mock / live 双模的切换点
 *
 * - mock 模式（默认）：不走传输层，useTerminalSession 直接调 commands.ts 本地执行
 * - live 模式：向 hook 注入 TerminalTransport 实现（如 WebSocketTransport），
 *   会话 hook 与页面零改动切换，命令执行改由后端回传输出
 */

/** 输出行色调（映射终端 ANSI 颜色，渲染层在 terminal.tsx 落色） */
export type TerminalTone = 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted' | 'accent'

export type TerminalLineKind = 'out' | 'prompt'

export interface TerminalLine {
  id: number
  kind: TerminalLineKind
  /** 输出内容；prompt 行存命令文本（提示符前缀单独存 prompt 字段） */
  text: string
  tone: TerminalTone
  /** prompt 行的提示符前缀，如 `apex@app-server-01:~$ ` */
  prompt?: string
}

export type TerminalStatus = 'connecting' | 'connected' | 'disconnected'

/** 主机（mock 会话目标；live 模式透传给传输层） */
export interface TerminalHost {
  id: string
  /** 选项卡显示名 */
  label: string
  /** 提示符用户名 */
  user: string
  /** 提示符主机名 */
  hostname: string
  /** 主机说明（选项卡副标题） */
  desc: string
}

/**
 * live 模式传输接口（后端 SSH / 容器 exec 网关对接点）
 * mock 模式不实现它；后端就绪后实现 WebSocketTransport 并注入 useTerminalSession 即可
 */
export interface TerminalTransport {
  connect(host: TerminalHost): Promise<void>
  disconnect(): void
  /** 发送一行命令（不含换行符） */
  send(command: string): void
  /** 订阅输出行回调，返回取消订阅函数 */
  onLine(cb: (text: string, tone: TerminalTone) => void): () => void
  /** 订阅连接状态回调，返回取消订阅函数 */
  onStatus(cb: (status: TerminalStatus) => void): () => void
}

/**
 * WebSocket 传输 stub —— live 模式对接点（当前未接入后端，调用即抛错提示）
 *
 * 后端就绪后的对接步骤（只改本类，页面与 hook 零改动）：
 * 1. connect()：`new WebSocket(this.wsUrl)`，onopen 后发送 `{ type: 'open', host }`
 * 2. send()：发送 `{ type: 'input', data: command + '\n' }`
 * 3. onLine()：监听 onmessage，解析 `{ type: 'output', data }` 逐行回调
 * 4. 断线重连与心跳在本类内闭环，状态变化通过 onStatus 通知会话
 */
export class WebSocketTransport implements TerminalTransport {
  constructor(private readonly wsUrl: string) {}

  connect(_host: TerminalHost): Promise<void> {
    return Promise.reject(new Error(`live 模式未接入：请先对接终端网关（${this.wsUrl}）`))
  }

  disconnect(): void {
    throw new Error(`live 模式未接入：请先对接终端网关（${this.wsUrl}）`)
  }

  send(_command: string): void {
    throw new Error(`live 模式未接入：请先对接终端网关（${this.wsUrl}）`)
  }

  onLine(): () => void {
    throw new Error(`live 模式未接入：请先对接终端网关（${this.wsUrl}）`)
  }

  onStatus(): () => void {
    throw new Error(`live 模式未接入：请先对接终端网关（${this.wsUrl}）`)
  }
}
