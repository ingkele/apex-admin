import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, Mail, MoreHorizontal, Search, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AppMenu } from '@/components/ui/menu'
import { AppTabPanel, AppTabs } from '@/components/ui/tabs'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/demo/nav')({
  component: Page,
})

function Page() {
  const [tab, setTab] = React.useState('basic')

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 导航组件 · 选项卡与下拉菜单</span>}
        title="导航组件"
        description="选项卡用于同层级内容切换，下拉菜单收纳低频操作；两者都保留键盘可达性。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <DemoBlock
            id="demo-tabs"
            title="选项卡 Tabs"
            desc="下划线风格，与详情页四个 Tab 同款"
            code={`<AppTabs value={tab} onValueChange={setTab} tabs={TABS}>
  <AppTabPanel value="basic">…</AppTabPanel>
</AppTabs>`}
          >
            <AppTabs
              value={tab}
              onValueChange={setTab}
              tabs={[
                { value: 'basic', label: '执行参数' },
                { value: 'log', label: '执行日志' },
                { value: 'output', label: '产物输出' },
                { value: 'service', label: '关联服务' },
              ]}
            >
              {['basic', 'log', 'output', 'service'].map((v) => (
                <AppTabPanel key={v} value={v}>
                  <div className="rounded-lg border border-dashed border-line bg-canvas/40 px-4 py-6 text-center text-[11.5px] text-muted">
                    当前面板：<span className="font-medium text-ink">{v}</span> · 切换不影响其他面板状态
                  </div>
                </AppTabPanel>
              ))}
            </AppTabs>
          </DemoBlock>
        </div>
        <div className="col-span-6">
          <DemoBlock
            id="demo-nav"
            title="下拉菜单 Menu"
            desc="Base UI Menu，支持图标、禁用与危险项"
            code={`<AppMenu trigger={<Button variant="outline">更多操作 <ChevronDown /></Button>} items={items} />`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <AppMenu
                trigger={
                  <Button variant="outline" size="sm">
                    更多操作 <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                }
                items={[
                  { label: '查看详情', icon: <Search className="h-3.5 w-3.5" />, onSelect: () => toast.info('查看详情') },
                  { label: '复制 ID', icon: <Mail className="h-3.5 w-3.5" />, onSelect: () => toast.success('已复制') },
                  { label: '暂不可用', icon: <X className="h-3.5 w-3.5" />, disabled: true, onSelect: () => {} },
                  { label: '删除任务', icon: <Trash2 className="h-3.5 w-3.5" />, danger: true, onSelect: () => toast.error('已删除') },
                ]}
              />
              <Button variant="ghost" size="icon" aria-label="行操作">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
              菜单在 Portal 内渲染，自动避让视口边界；危险项使用 rose 语义色，需配合二次确认使用。
            </p>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
