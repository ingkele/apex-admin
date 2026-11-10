import { createFileRoute } from '@tanstack/react-router'
import { BookOpen, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/demo/active-icon/$variant')({
  component: Page,
})

function Page() {
  const { variant } = Route.useParams()
  const isSub = variant === 'sub'

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 菜单激活图标</span>}
        title={isSub ? '子级激活图标' : '一级激活图标'}
        description="菜单项可配 activeIcon：当前路由命中时图标换成强调样式，用来强化「你在这儿」的反馈。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            id="demo-active-icon"
            title="配置方式"
            desc="icon 为常态图标，activeIcon 为激活态图标，二者都是 nav 图标名（NavIcon 联合类型，有 TS 校验）"
            code={`{
  label: '一级激活图标',
  to: '/demo/active-icon/menu',
  icon: 'list',
  activeIcon: 'sparkles',
},
{
  label: '子级激活图标',
  to: '/demo/active-icon/sub',
  icon: 'list',
  activeIcon: 'sparkles',
}`}
          >
            <div className="space-y-3 text-[12.5px] leading-relaxed text-muted">
              <p>
                侧边栏渲染逻辑：命中激活态（含父级链）时优先取 <code className="font-mono">activeIcon</code>，
                否则回落 <code className="font-mono">icon</code>，再回落分组图标——
                所以只配 activeIcon 不配 icon 也不会空白。
              </p>
              <div className="flex items-center gap-6 rounded-lg border border-line bg-canvas px-4 py-3">
                <div className="flex items-center gap-2 text-[12px] text-muted">
                  <BookOpen className="h-4 w-4" />
                  常态
                </div>
                <div className="flex items-center gap-2 text-[12px] font-medium text-brand-600">
                  <Sparkles className="h-4 w-4" />
                  激活态
                </div>
              </div>
              <p className="text-[11.5px]">
                当前页面是「{isSub ? '子级' : '一级'}激活图标」演示页，看左侧菜单对应项——图标此时应显示为星形强调图标。
              </p>
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink">为什么分「一级 / 子级」两个入口</div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              vben 用两个菜单项演示同一能力在不同层级的表现。子级菜单的图标尺寸、与引导线的对齐方式都与一级不同，
              <code className="mx-1 font-mono">activeIcon</code> 在两层都要走同一套「激活优先」逻辑，容易被漏测。
            </p>
            <p className="mt-3 text-[11px] leading-relaxed text-soft">
              折叠态（64px）下只显示图标——此时激活态换图标的价值最大：用户看不到文字，只能靠图标与高亮底色辨认当前位置。
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
