import { createFileRoute, useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import { Home, Layers, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { useTabsStore } from '@/stores/tabs.store'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/demo/tabs')({
  component: Page,
})

function Page() {
  const navigate = useNavigate()
  const tabs = useTabsStore((s) => s.tabs)
  const { close, closeLeft, closeRight, closeOthers, closeAll } = useTabsStore.getState()
  const currentPath = '/demo/tabs'

  const act = (label: string, fn: () => void | string | null) => {
    const next = fn()
    toast.success(`${label} · 当前 ${useTabsStore.getState().tabs.length} 个页签`)
    if (typeof next === 'string') void navigate({ to: next })
  }

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 功能</span>}
        title="标签页"
        description="页签状态由 tabs.store 统一管理（sessionStorage 持久化）；本页演示程序化操作页签的完整 API。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 space-y-4">
          <DemoBlock
            title="页签操作 API"
            desc="与页签右键菜单同一套动作，页面里也能程序化调用（如向导流程走完自动收起中间页签）"
            code={`const tabs = useTabsStore.getState()

tabs.open({ path: '/tasks', title: '任务列表' })   // 登记/更新
tabs.close('/tasks')        // → 返回应跳转的路径（关的不是当前页则返回 null）
tabs.closeLeft(path)        // 关闭左侧（固定页签「工作台」保留）
tabs.closeRight(path)       // 关闭右侧
tabs.closeOthers(path)      // 只留固定页签与目标
tabs.closeAll()             // 全关，回工作台`}
          >
            <div className="flex flex-wrap gap-2.5">
              <Button variant="outline" size="sm" onClick={() => act('关闭当前页签', () => close(currentPath))}>
                <X className="h-3 w-3" />
                关闭当前页签
              </Button>
              <Button variant="outline" size="sm" onClick={() => act('关闭左侧', () => closeLeft(currentPath))}>
                关闭左侧
              </Button>
              <Button variant="outline" size="sm" onClick={() => act('关闭右侧', () => closeRight(currentPath))}>
                关闭右侧
              </Button>
              <Button variant="outline" size="sm" onClick={() => act('关闭其他', () => closeOthers(currentPath))}>
                关闭其他
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  closeAll()
                  toast.success('已关闭全部页签')
                  void navigate({ to: '/dashboard' })
                }}
              >
                关闭全部（回工作台）
              </Button>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-soft">
              「关闭当前」会自动跳到相邻页签；固定页签「工作台」永远保留，不可被任何 API 关闭。
            </p>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-semibold text-ink">当前会话的页签</div>
              <span className="text-[10.5px] text-soft">{tabs.length} 个 · sessionStorage 持久化</span>
            </div>
            <div className="mt-3 space-y-1.5">
              {tabs.map((t) => (
                <div
                  key={t.path}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px]',
                    t.path === currentPath
                      ? 'border-brand-300 bg-brand-50/70 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300'
                      : 'border-line text-muted',
                  )}
                >
                  {t.path === '/dashboard' ? <Home className="h-3.5 w-3.5 shrink-0" /> : <Layers className="h-3.5 w-3.5 shrink-0" />}
                  <span className="min-w-0 flex-1 truncate">{t.title}</span>
                  <code className="shrink-0 font-mono text-[10px] text-soft">{t.path}</code>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[10.5px] leading-relaxed text-soft">
              刷新浏览器页签不丢（sessionStorage）；关掉浏览器标签后重开会从工作台重新开始。
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
