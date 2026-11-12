/**
 * 终端命令注册表（mock 执行层）
 * 纯函数解析执行：输入一行 → CommandResult（输出行 + 可选副作用标记）。
 * 文件系统为按主机区分的内存假数据，全部自包含，零后端依赖。
 */
import type { TerminalHost, TerminalTone } from './transport'

export interface CommandOutputLine {
  text: string
  tone: TerminalTone
}

export interface CommandResult {
  lines: CommandOutputLine[]
  /** 清屏副作用（会话层清空输出区） */
  clear?: boolean
  /** 退出会话副作用（会话层置为已断开） */
  exit?: boolean
  /** cd 切换后的新工作目录（会话层更新提示符） */
  nextCwd?: string
}

export interface CommandContext {
  host: TerminalHost
  cwd: string
  fs: MockFs
  /** 本次会话已执行的命令历史（history 命令读取） */
  history: string[]
}

export interface CommandDef {
  name: string
  desc: string
  usage?: string
  run(args: string[], ctx: CommandContext): CommandResult
}

/** mock 文件系统：绝对路径 → 节点（子级由路径前缀隐含） */
export type MockFs = Record<string, { type: 'dir' } | { type: 'file'; content: string }>

/** 演示主机（mock 三台，切换即新会话） */
export const TERMINAL_HOSTS: TerminalHost[] = [
  { id: 'app-01', label: 'app-server-01', user: 'apex', hostname: 'app-server-01', desc: '应用节点 · 8C16G' },
  { id: 'db-02', label: 'db-server-02', user: 'apex', hostname: 'db-server-02', desc: '数据库节点 · 16C64G' },
  { id: 'local', label: '本地 shell', user: 'apex', hostname: 'local-dev', desc: '本地演示会话' },
]

const HOME = '/home/apex'

const FS_APP: MockFs = {
  '/': { type: 'dir' },
  '/etc': { type: 'dir' },
  '/etc/os-release': { type: 'file', content: 'NAME="Apex Linux"\nVERSION="2026.11 (LTS)"\nID=apex\nPRETTY_NAME="Apex Linux 2026.11 LTS"' },
  '/var': { type: 'dir' },
  '/var/log': { type: 'dir' },
  '/var/log/app.log': { type: 'file', content: '2026-11-12 09:00:01 INFO  gateway-api started on :8080\n2026-11-12 09:00:03 INFO  inference-core warmup done (1.2s)\n2026-11-12 10:12:45 WARN  task-scheduler queue depth > 80%\n2026-11-12 10:13:02 INFO  task-scheduler scale-out +2 workers' },
  [HOME]: { type: 'dir' },
  [`${HOME}/app`]: { type: 'dir' },
  [`${HOME}/app/config.yaml`]: { type: 'file', content: 'server:\n  port: 8080\n  workers: 4\nlog:\n  level: info\n  file: /var/log/app.log' },
  [`${HOME}/app/deploy.sh`]: { type: 'file', content: '#!/usr/bin/env bash\nset -euo pipefail\necho "deploying apex-admin..."\n# 演示脚本，无真实部署动作' },
  [`${HOME}/README.md`]: { type: 'file', content: '# app-server-01\n\n应用节点演示目录。输入 help 查看可用命令。' },
}

const FS_DB: MockFs = {
  '/': { type: 'dir' },
  '/etc': { type: 'dir' },
  '/etc/os-release': { type: 'file', content: 'NAME="Apex Linux"\nVERSION="2026.11 (LTS)"\nID=apex\nPRETTY_NAME="Apex Linux 2026.11 LTS"' },
  '/var': { type: 'dir' },
  '/var/log': { type: 'dir' },
  '/var/log/db.log': { type: 'file', content: '2026-11-12 08:59:58 INFO  postgres ready to accept connections\n2026-11-12 09:31:10 INFO  checkpoint complete: wrote 1284 buffers\n2026-11-12 10:02:33 WARN  slow query: 2.31s (orders_analytics)' },
  [HOME]: { type: 'dir' },
  [`${HOME}/backup`]: { type: 'dir' },
  [`${HOME}/backup/plan.md`]: { type: 'file', content: '# 备份计划\n\n- 每日 02:00 全量备份（保留 7 天）\n- 每小时 WAL 归档' },
  [`${HOME}/README.md`]: { type: 'file', content: '# db-server-02\n\n数据库节点演示目录。输入 help 查看可用命令。' },
}

const FS_LOCAL: MockFs = {
  '/': { type: 'dir' },
  [HOME]: { type: 'dir' },
  [`${HOME}/projects`]: { type: 'dir' },
  [`${HOME}/projects/apex-admin.md`]: { type: 'file', content: '# apex-admin\n\nReact 19 + TanStack Router 后台管理模板（演示文件）。\n在线预览：https://ingkele.github.io/apex-admin/' },
  [`${HOME}/notes.md`]: { type: 'file', content: '终端演示会话笔记：\n- help 查看命令\n- Tab 补全命令名\n- Ctrl+L 清屏' },
}

const FS_MAP: Record<string, MockFs> = { 'app-01': FS_APP, 'db-02': FS_DB, local: FS_LOCAL }

/** 取主机对应的内存文件系统 */
export function getHostFs(hostId: string): MockFs {
  return FS_MAP[hostId] ?? FS_LOCAL
}

/** 解析路径（支持 . .. 绝对/相对），返回规范化的绝对路径 */
export function resolvePath(cwd: string, input: string): string {
  const raw = input.startsWith('/') ? input : `${cwd}/${input}`
  const parts: string[] = []
  for (const seg of raw.split('/')) {
    if (!seg || seg === '.') continue
    if (seg === '..') parts.pop()
    else parts.push(seg)
  }
  return `/${parts.join('/')}`.replace(/\/$/, '') || '/'
}

/** 提示符目录显示（HOME 缩写为 ~） */
export function displayPath(cwd: string): string {
  return cwd === HOME ? '~' : cwd.startsWith(`${HOME}/`) ? `~${cwd.slice(HOME.length)}` : cwd
}

const out = (text: string, tone: TerminalTone = 'default'): CommandOutputLine => ({ text, tone })
const err = (text: string): CommandOutputLine => out(text, 'error')

function listDir(fs: MockFs, dir: string): CommandOutputLine[] {
  const prefix = dir === '/' ? '/' : `${dir}/`
  const names = new Map<string, boolean>()
  for (const [path, node] of Object.entries(fs)) {
    if (path === dir || !path.startsWith(prefix)) continue
    const rest = path.slice(prefix.length)
    if (rest.includes('/')) continue
    names.set(rest, node.type === 'dir')
  }
  if (names.size === 0) return [out('(空目录)', 'muted')]
  return [...names.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, isDir]) => (isDir ? out(`${name}/`, 'accent') : out(name, 'default')))
}

const NEOFETCH_ART = [
  '      ___   ___  __  __ ',
  '     / _ | / _ \\/ / / / ',
  '    / __ |/ // / /_/ /  ',
  '   /_/ |_/____/\\____/   ',
]

function neofetch(ctx: CommandContext): CommandOutputLine[] {
  const info = [
    ['OS', 'Apex Linux 2026.11 LTS x86_64'],
    ['Host', ctx.host.label],
    ['Kernel', '6.6.0-apex-generic'],
    ['Uptime', '12 days, 4 hours, 21 mins'],
    ['Shell', 'bash 5.2.21'],
    ['Terminal', 'apex-admin mock-terminal'],
    ['CPU', 'Apex Virtual CPU (8) @ 2.40GHz'],
    ['Memory', '6.2 GiB / 16.0 GiB'],
    ['Theme', 'Apex Blue'],
  ]
  const lines: CommandOutputLine[] = []
  for (let i = 0; i < NEOFETCH_ART.length; i++) {
    const art = NEOFETCH_ART[i]
    const kv = info[i]
    lines.push(out(art + (kv ? `  ${kv[0]}: ${kv[1]}` : ''), 'accent'))
  }
  for (const [k, v] of info.slice(NEOFETCH_ART.length)) lines.push(out(`${' '.repeat(24)}${k}: ${v}`, 'accent'))
  return lines
}

function ping(args: string[]): CommandOutputLine[] {
  const target = args[0] ?? 'gateway-api.internal'
  const count = Math.min(Math.max(Number(args[1]) || 4, 1), 8)
  const base = 20 + Math.random() * 40
  const lines: CommandOutputLine[] = [out(`PING ${target} (10.0.12.${Math.floor(Math.random() * 200) + 10}): 56 data bytes`, 'info')]
  const times: number[] = []
  for (let i = 0; i < count; i++) {
    const t = Math.round((base + (Math.random() - 0.5) * 12) * 1000) / 1000
    times.push(t)
    lines.push(out(`64 bytes from ${target}: icmp_seq=${i} ttl=54 time=${t} ms`, 'default'))
  }
  const min = Math.min(...times).toFixed(3)
  const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(3)
  const max = Math.max(...times).toFixed(3)
  lines.push(out(`--- ${target} ping statistics ---`, 'muted'))
  lines.push(out(`${count} packets transmitted, ${count} packets received, 0.0% packet loss`, 'success'))
  lines.push(out(`round-trip min/avg/max = ${min}/${avg}/${max} ms`, 'muted'))
  return lines
}

/** 内置命令表（help 输出与 Tab 补全共用） */
export const COMMANDS: CommandDef[] = [
  {
    name: 'help',
    desc: '查看可用命令',
    run: () => ({
      lines: [
        out('Apex Mock Terminal 内置命令：', 'success'),
        ...COMMANDS.map((c) => out(`  ${c.name.padEnd(10)}${c.desc}${c.usage ? `（用法：${c.usage}）` : ''}`, 'default')),
        out('快捷键：↑↓ 历史命令 · Tab 补全 · Ctrl+L 清屏 · Ctrl+C 取消当前行', 'muted'),
      ],
    }),
  },
  {
    name: 'ls',
    desc: '列出目录内容',
    usage: 'ls [路径]',
    run: (args, ctx) => {
      const target = resolvePath(ctx.cwd, args[0] ?? '.')
      const node = ctx.fs[target]
      if (!node) return { lines: [err(`ls: ${args[0] ?? target}: No such file or directory`)] }
      if (node.type === 'file') return { lines: [out(target.split('/').pop() ?? target, 'default')] }
      return { lines: listDir(ctx.fs, target) }
    },
  },
  {
    name: 'cd',
    desc: '切换工作目录',
    usage: 'cd [路径]',
    run: (args, ctx) => {
      const target = resolvePath(ctx.cwd, args[0] ?? HOME)
      const node = ctx.fs[target]
      if (!node) return { lines: [err(`cd: ${args[0] ?? target}: No such file or directory`)] }
      if (node.type === 'file') return { lines: [err(`cd: ${args[0] ?? target}: Not a directory`)] }
      return { lines: [], nextCwd: target }
    },
  },
  { name: 'pwd', desc: '显示当前目录', run: (_args, ctx) => ({ lines: [out(ctx.cwd, 'default')] }) },
  {
    name: 'cat',
    desc: '查看文件内容',
    usage: 'cat <文件>',
    run: (args, ctx) => {
      const target = resolvePath(ctx.cwd, args[0] ?? '')
      const node = ctx.fs[target]
      if (!node) return { lines: [err(`cat: ${args[0] ?? ''}: No such file or directory`)] }
      if (node.type === 'dir') return { lines: [err(`cat: ${args[0]}: Is a directory`)] }
      return { lines: node.content.split('\n').map((l) => out(l, 'default')) }
    },
  },
  {
    name: 'echo',
    desc: '输出一行文本',
    usage: 'echo <文本>',
    run: (args) => ({ lines: [out(args.join(' '), 'default')] }),
  },
  { name: 'whoami', desc: '显示当前用户', run: (_args, ctx) => ({ lines: [out(ctx.host.user, 'default')] }) },
  { name: 'hostname', desc: '显示主机名', run: (_args, ctx) => ({ lines: [out(ctx.host.hostname, 'default')] }) },
  { name: 'date', desc: '显示当前时间', run: () => ({ lines: [out(new Date().toString(), 'default')] }) },
  {
    name: 'uname',
    desc: '显示系统信息',
    usage: 'uname [-a]',
    run: (args) => ({
      lines: [
        out(
          args.includes('-a')
            ? `Linux ${Math.random() > 0.5 ? 'app-server-01' : 'db-server-02'} 6.6.0-apex-generic #1 SMP x86_64 GNU/Linux`
            : 'Linux',
          'default',
        ),
      ],
    }),
  },
  {
    name: 'history',
    desc: '查看命令历史',
    run: (_args, ctx) => ({
      lines: ctx.history.length
        ? ctx.history.map((h, i) => out(`  ${String(i + 1).padStart(3)}  ${h}`, 'default'))
        : [out('(暂无历史命令)', 'muted')],
    }),
  },
  { name: 'clear', desc: '清屏', run: () => ({ lines: [], clear: true }) },
  { name: 'ping', desc: '模拟连通性测试', usage: 'ping <主机> [次数]', run: (args) => ({ lines: ping(args) }) },
  { name: 'neofetch', desc: '显示系统信息卡片', run: (_args, ctx) => ({ lines: neofetch(ctx) }) },
  {
    name: 'exit',
    desc: '断开当前会话',
    run: () => ({ lines: [out('logout', 'muted'), out('会话已断开（演示）', 'warning')], exit: true }),
  },
]

/** 命令名列表（Tab 补全数据源） */
export const COMMAND_NAMES: string[] = COMMANDS.map((c) => c.name)

/** Tab 补全：无歧义前缀返回完整命令名，否则返回 null */
export function completeCommand(prefix: string): string | null {
  const hit = COMMAND_NAMES.filter((n) => n.startsWith(prefix))
  return hit.length === 1 ? hit[0] : null
}

/** 解析并执行一行输入（mock 主入口；live 模式不走这里） */
export function executeCommand(input: string, ctx: CommandContext): CommandResult {
  const trimmed = input.trim()
  if (!trimmed) return { lines: [] }
  const [name, ...args] = trimmed.split(/\s+/)
  const cmd = COMMANDS.find((c) => c.name === name)
  if (!cmd) return { lines: [err(`bash: ${name}: command not found（输入 help 查看可用命令）`)] }
  return cmd.run(args, ctx)
}
