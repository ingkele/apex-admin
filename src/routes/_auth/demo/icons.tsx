import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import {
  AppWindow, Blocks, BookMarked, Brain, Braces, ChartNoAxesCombined, CircleAlert, CircleDashed,
  ClipboardCheck, ClipboardCopy, Component, Download, Droplets, ExternalLink, EyeOff,
  FlaskConical, Footprints, Frame, Info, KeyRound, Layers, LayoutDashboard, Link2, ListChecks,
  ListTree, LogOut, Maximize, Menu, MenuSquare, MessageSquareDot, MoonStar, Network, Palette,
  PanelLeft, PanelLeftClose, ScrollText, Search, Server, Settings, ShieldCheck, SlidersHorizontal,
  Sparkles, SquareArrowOutUpRight, Table2, Tag, TextCursorInput, TimerOff, Users, Zap,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/demo/icons')({
  component: Page,
})

/** 图标清单：与侧边栏 ICONS 映射同源 + 常用操作图标 */
const ICONS: { name: string; node: React.ComponentType<{ className?: string }> }[] = [
  { name: 'LayoutDashboard · 工作台', node: LayoutDashboard },
  { name: 'ChartNoAxesCombined · 分析', node: ChartNoAxesCombined },
  { name: 'ListChecks · 任务', node: ListChecks },
  { name: 'Server · 服务', node: Server },
  { name: 'Brain · 模型', node: Brain },
  { name: 'KeyRound · 密钥', node: KeyRound },
  { name: 'Users · 用户', node: Users },
  { name: 'ShieldCheck · 权限', node: ShieldCheck },
  { name: 'MenuSquare · 菜单', node: MenuSquare },
  { name: 'Network · 组织', node: Network },
  { name: 'BookMarked · 字典', node: BookMarked },
  { name: 'ScrollText · 审计', node: ScrollText },
  { name: 'Settings · 设置', node: Settings },
  { name: 'Blocks · 组件', node: Blocks },
  { name: 'Layers · 示例', node: Layers },
  { name: 'CircleAlert · 异常', node: CircleAlert },
  { name: 'Component · 基础', node: Component },
  { name: 'TextCursorInput · 输入', node: TextCursorInput },
  { name: 'MessageSquareDot · 反馈', node: MessageSquareDot },
  { name: 'Menu · 导航', node: Menu },
  { name: 'Table2 · 表格', node: Table2 },
  { name: 'ClipboardCheck · 校验', node: ClipboardCheck },
  { name: 'Footprints · 流程', node: Footprints },
  { name: 'CircleDashed · 占位', node: CircleDashed },
  { name: 'Info · 关于', node: Info },
  { name: 'FlaskConical · 演示', node: FlaskConical },
  { name: 'Tag · 徽标', node: Tag },
  { name: 'Sparkles · 激活', node: Sparkles },
  { name: 'ExternalLink · 外链', node: ExternalLink },
  { name: 'ListTree · 嵌套', node: ListTree },
  { name: 'Frame · 内嵌', node: Frame },
  { name: 'Zap · 功能', node: Zap },
  { name: 'TimerOff · 过期', node: TimerOff },
  { name: 'Palette · 主题', node: Palette },
  { name: 'Droplets · 水印', node: Droplets },
  { name: 'SlidersHorizontal · 偏好', node: SlidersHorizontal },
  { name: 'AppWindow · 标签页', node: AppWindow },
  { name: 'EyeOff · 隐藏', node: EyeOff },
  { name: 'Maximize · 全屏', node: Maximize },
  { name: 'Download · 下载', node: Download },
  { name: 'ClipboardCopy · 剪贴板', node: ClipboardCopy },
  { name: 'Link2 · 带参', node: Link2 },
  { name: 'SquareArrowOutUpRight · 新窗口', node: SquareArrowOutUpRight },
  { name: 'Braces · 序列化', node: Braces },
  { name: 'LogOut · 退出', node: LogOut },
  { name: 'MoonStar · 明暗', node: MoonStar },
  { name: 'PanelLeft · 侧栏', node: PanelLeft },
  { name: 'PanelLeftClose · 收起', node: PanelLeftClose },
  { name: 'Search · 搜索', node: Search },
]

function Page() {
  const [keyword, setKeyword] = React.useState('')

  const list = React.useMemo(
    () =>
      ICONS.filter((i) => i.name.toLowerCase().includes(keyword.trim().toLowerCase())),
    [keyword],
  )

  const copy = async (name: string) => {
    const exportName = name.split(' ·')[0]
    try {
      await navigator.clipboard.writeText(exportName)
      toast.success(`已复制：${exportName}`)
    } catch {
      toast.error('复制失败，请手动选择')
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 功能</span>}
        title="图标"
        description="项目图标统一来自 lucide-react，点击任意图标复制其导出名；侧边栏图标在 app.config.ts 的 NavIcon 里集中登记。"
      />

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="relative w-72 max-w-full">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soft" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索图标名，如：download"
              className="pl-8"
            />
          </div>
          <span className="text-[11px] text-soft">{list.length} / {ICONS.length}</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
          {list.map(({ name, node: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => copy(name)}
              title={`点击复制：${name.split(' ·')[0]}`}
              className="flex flex-col items-center gap-2 rounded-lg border border-line bg-surface px-2 py-3.5 transition-colors hover:border-brand-300 hover:bg-brand-50/60 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10"
            >
              <Icon className="h-5 w-5 text-ink" />
              <span className="w-full truncate text-center text-[10px] text-muted">{name.split(' ·')[0]}</span>
            </button>
          ))}
          {list.length === 0 ? (
            <div className="col-span-full py-10 text-center text-[12px] text-soft">没有匹配的图标</div>
          ) : null}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-soft">
          使用方式：<code className="font-mono">import {'{ Download }'} from 'lucide-react'</code>，
          按需引入只会打包用到的图标。新菜单项需要新图标时，先在{' '}
          <code className="font-mono">app.config.ts</code> 的 <code className="font-mono">NavIcon</code>{' '}
          联合类型里登记名字，再到 <code className="font-mono">sidebar.tsx</code> 的 ICONS 映射里补一行。
        </p>
      </Card>
    </>
  )
}
