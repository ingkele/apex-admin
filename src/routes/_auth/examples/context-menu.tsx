import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { cn } from '@/lib/utils'
import { Copy, Download, Eye, FolderOpen, Pencil, RefreshCw, Share2, Star, Trash2, type LucideIcon } from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/context-menu')({
  component: Page,
})

interface MenuItem {
  label: string
  icon: LucideIcon
  shortcut?: string
  danger?: boolean
  disabled?: boolean
  onSelect: () => void
}

type MenuGroup = (MenuItem | 'separator')[]

/** 右键菜单浮层 —— 跟随光标定位、自动避让视口边缘，Esc / 点击外部关闭 */
function ContextMenu({
  pos,
  groups,
  onClose,
}: {
  pos: { x: number; y: number } | null
  groups: MenuGroup[]
  onClose: () => void
}) {
  const menuRef = React.useRef<HTMLDivElement>(null)
  const [adjusted, setAdjusted] = React.useState<{ x: number; y: number } | null>(null)

  React.useLayoutEffect(() => {
    if (!pos || !menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const x = Math.min(pos.x, window.innerWidth - rect.width - 8)
    const y = Math.min(pos.y, window.innerHeight - rect.height - 8)
    setAdjusted({ x: Math.max(8, x), y: Math.max(8, y) })
  }, [pos])

  React.useEffect(() => {
    if (!pos) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const onDown = () => onClose()
    const onScroll = () => onClose()
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [pos, onClose])

  if (!pos) return null

  return (
    <div
      ref={menuRef}
      role="menu"
      style={{ left: adjusted?.x ?? -9999, top: adjusted?.y ?? -9999, opacity: adjusted ? 1 : 0 }}
      className="fixed z-50 w-[172px] rounded-lg border border-line bg-surface py-1 shadow-pop"
    >
      {groups.map((group, gi) => (
        <React.Fragment key={gi}>
          {gi > 0 ? <div className="my-1 border-t border-line/70" /> : null}
          {group.map((item) => {
            if (item === 'separator') return null
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onSelect()
                  onClose()
                }}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11.5px] transition-colors',
                  item.disabled
                    ? 'cursor-not-allowed text-soft opacity-50'
                    : item.danger
                      ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10'
                      : 'text-ink hover:bg-hover',
                )}
              >
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.shortcut ? (
                  <kbd className="rounded border border-line bg-canvas/60 px-1 font-mono text-[9px] text-soft">
                    {item.shortcut}
                  </kbd>
                ) : null}
              </button>
            )
          })}
        </React.Fragment>
      ))}
    </div>
  )
}

function Page() {
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null)
  const [ctxTarget, setCtxTarget] = React.useState('文件')

  const openMenu = (e: React.MouseEvent, target: string) => {
    e.preventDefault()
    e.stopPropagation()
    setCtxTarget(target)
    setPos({ x: e.clientX, y: e.clientY })
  }

  const groups: MenuGroup[] = [
    [
      { label: '打开', icon: FolderOpen, shortcut: 'Enter', onSelect: () => toast.success(`打开${ctxTarget}`) },
      { label: '预览', icon: Eye, shortcut: 'Space', onSelect: () => toast.success(`预览${ctxTarget}`) },
    ],
    [
      { label: '重命名', icon: Pencil, shortcut: 'F2', onSelect: () => toast.info('重命名（示例）') },
      { label: '复制', icon: Copy, shortcut: 'Ctrl+C', onSelect: () => toast.success('已复制到剪贴板') },
      { label: '分享', icon: Share2, onSelect: () => toast.success('分享链接已生成') },
    ],
    [
      { label: '收藏', icon: Star, onSelect: () => toast.success('已加入收藏') },
      { label: '下载', icon: Download, disabled: true, onSelect: () => {} },
      { label: '刷新', icon: RefreshCw, onSelect: () => toast.success('已刷新') },
    ],
    [{ label: '删除', icon: Trash2, danger: true, shortcut: 'Del', onSelect: () => toast.error('删除（示例，未真删）') }],
  ]

  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 上下文菜单 · 右键浮层菜单</span>}
        title="上下文菜单"
        description="在目标区域按右键弹出操作菜单：跟随光标定位、自动避让视口边缘；Esc / 点外部 / 滚动即关闭。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            id="context-menu-area"
            title="右键操作区"
            desc="在下方卡片与文件格子上点右键，不同目标弹出不同菜单"
            code={`onContextMenu={(e) => {
  e.preventDefault()
  setPos({ x: e.clientX, y: e.clientY })
}}
// 浮层：fixed 定位 + 视口避让 clamp
// 关闭：Esc / mousedown 外部 / scroll`}
          >
            <div
              onContextMenu={(e) => openMenu(e, '卡片')}
              className="rounded-lg border border-line bg-canvas/30 px-5 py-4"
            >
              <div className="text-[12px] font-medium text-ink">服务卡片（在此右键）</div>
              <p className="mt-1 text-[10.5px] text-muted">
                vector-index-svc · 4 实例 · 健康 —— 右键弹出「卡片」操作菜单
              </p>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              {['产品手册.pdf', '周报.docx', '封面.png', '日志.csv', '模型.bin', '配置.yaml'].map((f) => (
                <div
                  key={f}
                  onContextMenu={(e) => openMenu(e, `「${f}」`)}
                  className="flex cursor-context-menu items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 transition-colors hover:border-brand-300 hover:bg-brand-50/40 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <FolderOpen className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1 truncate text-[11px] text-ink">{f}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-lg border border-dashed border-line px-4 py-2.5 text-center text-[10.5px] text-soft">
              空白区域也可以挂右键菜单（「刷新 / 粘贴 / 新建」类场景）
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <DemoBlock
            id="context-menu-spec"
            title="菜单规格"
            desc="分组分隔线、快捷键提示、危险红字、禁用置灰"
            code={`groups: MenuGroup[] = [
  [{ label: '打开', icon: FolderOpen, shortcut: 'Enter' }, …],
  'separator'  // 或分组数组间自动加分隔线
  [{ label: '删除', icon: Trash2, danger: true }]
]`}
          >
            <div className="space-y-2">
              {[
                ['分组', '相关操作归组，组间细分隔线', 'border-line'],
                ['快捷键', '右对齐 kbd 徽标提示键盘操作', 'border-line'],
                ['危险项', '删除类红字 + 红底 hover', 'border-rose-200 dark:border-rose-500/30'],
                ['禁用项', '置灰不可点（如未开通的下载）', 'border-line'],
              ].map(([t, d, border]) => (
                <div key={t} className={cn('rounded-lg border px-3.5 py-2.5', border)}>
                  <div className="text-[11.5px] font-medium text-ink">{t}</div>
                  <div className="mt-0.5 text-[10px] text-muted">{d}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
              关闭时机有三个：按 <kbd className="rounded border border-line bg-canvas/60 px-1 font-mono text-[9px] text-soft">Esc</kbd>、
              点击菜单外任意位置、页面滚动（含内层滚动容器，capture 监听）。
            </p>
          </DemoBlock>
        </div>
      </div>

      <ContextMenu pos={pos} groups={groups} onClose={() => setPos(null)} />
    </>
  )
}
