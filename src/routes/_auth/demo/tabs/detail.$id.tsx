import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Layers, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { BreadcrumbPreview } from '@/components/shared/breadcrumb-preview'
import { useTabsStore } from '@/stores/tabs.store'
import { resolveBreadcrumb } from '@/lib/route-meta'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/demo/tabs/detail/$id')({
  component: Page,
})

function Page() {
  const { id } = Route.useParams()
  const tabs = useTabsStore((s) => s.tabs)
  const groupTabs = tabs.filter((t) => t.path.startsWith('/demo/tabs/detail'))
  const parts = resolveBreadcrumb(`/demo/tabs/detail/${id}`)

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 功能 › 标签页</span>}
        title={`标签页详情 #${id}`}
        description="动态路由详情页：不进菜单（hideInMenu），侧边栏高亮「标签页」（激活让渡 activePath）；同组页签受 maxNumOfOpenTab 限制。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="三个能力叠在一页上"
            desc="左侧菜单没有本页入口 —— 它只从「标签页」页内的链接进入；注意侧边栏高亮、面包屑链与页签数量"
            code={`// 隐藏菜单：route-tree 里正常注册，NavNode 渲染时跳过
{ label: '标签页详情', hideInMenu: true,
  activePath: '/demo/tabs' }   // ← 激活让渡：高亮「标签页」

// 页签上限：打开第 4 个详情时最早的自动关闭
const TAB_GROUP_LIMITS = [
  { prefix: '/demo/tabs/detail', max: 3 },
]`}
          >
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 rounded-lg border border-line px-3.5 py-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <div>
                  <div className="text-[12.5px] font-medium text-ink">
                    侧边栏「标签页」保持高亮（激活让渡）
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted">
                    隐藏页命中时把激活态让渡给 activePath 指向的菜单项，用户始终知道「我在哪个模块」。
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-line px-3.5 py-2.5">
                <Layers className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <div className="text-[12.5px] font-medium text-ink">
                    本组页签 {groupTabs.length} / 3
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted">
                    当前打开：{groupTabs.map((t) => t.title).join('、') || '（无）'}。
                    再开一个超过上限的详情，最早的会被自动关闭。
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <Link
                to="/demo/tabs"
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[12px] text-ink transition hover:border-brand-300 hover:bg-brand-50/60 hover:text-brand-700"
              >
                <ArrowLeft className="h-3 w-3" />
                返回标签页
              </Link>
              {['1', '2', '3', '4'].map((n) => (
                <Link
                  key={n}
                  to="/demo/tabs/detail/$id"
                  params={{ id: n }}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] transition',
                    n === id
                      ? 'border-brand-300 bg-brand-50/70 text-brand-700'
                      : 'border-line text-ink hover:border-brand-300 hover:bg-brand-50/60 hover:text-brand-700',
                  )}
                >
                  <Layers className="h-3 w-3" />
                  详情 #{n}
                </Link>
              ))}
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink">实时面包屑（本页）</div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              动态路由的面包屑与页签标题共用{' '}
              <code className="font-mono">resolveRouteMeta</code> 正则分支，标题带{' '}
              <code className="font-mono">#{id}</code> 便于多页签区分。
            </p>
            <div className="mt-3">
              <BreadcrumbPreview parts={parts} />
            </div>
            <div className="mt-3 rounded-lg border border-line bg-canvas px-3 py-2.5 font-mono text-[11px] leading-relaxed text-muted">
              resolveBreadcrumb('/demo/tabs/detail/{id}')<br />
              → {JSON.stringify(parts)}
            </div>
            <p className="mt-3 border-t border-line pt-3 text-[10.5px] leading-relaxed text-soft">
              对照 vben 的 <code className="font-mono">hideInMenu + activePath + maxNumOfOpenTab</code>{' '}
              三件套：本模板用「隐藏导航项 + 激活让渡 + 页签上限配置」等价实现。
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
