import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { DemoBlock, Row } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/demo/badge/$variant')({
  component: Page,
})

const VARIANTS = {
  dot: {
    title: '点徽标 · 数字',
    desc: '未读数、待办数这类会变动的量，放在数字徽标里；菜单里配 badge.text 为纯数字即自动走紧凑样式。',
  },
  text: {
    title: '文本徽标 · 短词',
    desc: '状态标记（Hot / New / Beta）用短文本徽标，配 brand 色调即可，长度建议 ≤ 4 个字符。',
  },
  color: {
    title: '徽标颜色 · 语义色',
    desc: '四种语义色调：rose（警示/未读）、brand（主色/新功能）、amber（提醒）、slate（中性）。',
  },
} as const

function Page() {
  const { variant } = Route.useParams()
  const meta = VARIANTS[variant as keyof typeof VARIANTS] ?? VARIANTS.dot

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 菜单徽标</span>}
        title={meta.title}
        description="徽标由 nav 配置的 badge 字段驱动，侧边栏自动渲染，无需改组件；数字与文本两种形态自动切换。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            id="demo-badge-nav"
            title="菜单配置方式"
            desc="在 app.config.ts 的导航节点上加 badge，tone 可选 brand / rose / amber / slate"
            code={`{
  label: '点徽标 10',
  to: '/demo/badge/dot',
  badge: { text: '10', tone: 'rose' },
},
{
  label: '文本徽标 Hot',
  to: '/demo/badge/text',
  badge: { text: 'Hot', tone: 'brand' },
}`}
          >
            <div className="space-y-2 text-[12.5px] text-muted">
              <p>
                左侧菜单「演示 › 菜单徽标」下三项分别演示三种形态，点开即可对照右上角与左侧的渲染结果。
              </p>
              <Row label="数字">
                <Badge variant="red">10</Badge>
                <Badge variant="red">99+</Badge>
              </Row>
              <Row label="文本">
                <Badge variant="brand">Hot</Badge>
                <Badge variant="amber">new</Badge>
                <Badge variant="gray">beta</Badge>
              </Row>
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink">当前页面对应的菜单项</div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              三个菜单项指向三个不同路由（<code className="font-mono">/demo/badge/{'{dot|text|color}'}</code>），
              因此各自独立成页签、激活态互不干扰——这是给「同一份演示配不同徽标」留的正确做法。
            </p>
            <div className="mt-4 rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-[11px] text-muted">
              variant = {variant}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-soft">
              徽标数量一般来自后端（未读数、待办数）。接真实接口后，把 <code className="font-mono">badge.text</code>{' '}
              改成运行时计算的值即可，例如在 Sidebar 里用 <code className="font-mono">useNotifications()</code> 的未读数覆盖静态配置。
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
