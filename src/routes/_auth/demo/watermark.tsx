import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { Input } from '@/components/ui/input'
import { AppSwitch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { DemoBlock, Row } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Watermark } from '@/components/shared/watermark'

export const Route = createFileRoute('/_auth/demo/watermark')({
  component: Page,
})

function Page() {
  const [content, setContent] = React.useState('Apex Admin · 内部资料')
  const [fontSize, setFontSize] = React.useState(14)
  const [gap, setGap] = React.useState(110)
  const [on, setOn] = React.useState(true)

  const body = (
    <div className="flex min-h-[300px] flex-col justify-between overflow-hidden rounded-lg border border-line bg-canvas p-5">
      <div>
        <div className="text-[14px] font-semibold text-ink">2026 Q4 平台运营报告（示例内容）</div>
        <p className="mt-2 text-[12px] leading-relaxed text-muted">
          这是一段被水印覆盖的示例内容。水印层 pointer-events-none，
          下方所有交互（选中文字、点击按钮、滚动）都不受影响。
          真实场景中可把 content 换成当前登录人「姓名 · 工号」，
          达到截图可溯源的效果。
        </p>
      </div>
      <div className="rounded-lg border border-line bg-surface p-3 text-[11.5px] text-muted">
        嵌套任意内容都没问题 —— 水印是绝对定位的覆盖层，不是内容的一部分。
      </div>
    </div>
  )

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 功能</span>}
        title="水印"
        description="canvas 生成文字瓦片后平铺覆盖，不拦截任何交互；常用于内容防盗与审计留痕（水印里放用户名/工号）。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <DemoBlock
            title="实时预览"
            desc="在下方内容区上叠加水印层，右侧控件实时调整文字、字号与间距"
            code={`import { Watermark } from '@/components/shared/watermark'

<Watermark content="张三 · 10086" fontSize={14} gap={110}>
  <YourContent />
</Watermark>`}
          >
            {on ? (
              <Watermark content={content || ' '} fontSize={fontSize} gap={gap}>
                {body}
              </Watermark>
            ) : (
              body
            )}
          </DemoBlock>
        </div>

        <div className="col-span-4">
          <Card className="space-y-1 p-5">
            <div className="text-[13px] font-semibold text-ink">参数</div>
            <Row label="开启">
              <AppSwitch checked={on} onCheckedChange={setOn} />
            </Row>
            <Row label="文字">
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="水印文字"
                className="h-8 flex-1 text-[12px]"
              />
            </Row>
            <Row label="字号">
              <span className="font-mono text-[11px] text-muted">{fontSize}px</span>
              <input
                id="watermark-font-size"
                type="range"
                min={10}
                max={22}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1 accent-brand-600"
              />
            </Row>
            <Row label="间距">
              <span className="font-mono text-[11px] text-muted">{gap}px</span>
              <input
                id="watermark-gap"
                type="range"
                min={40}
                max={220}
                step={10}
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="flex-1 accent-brand-600"
              />
            </Row>
            <p className="mt-3 border-t border-line pt-3 text-[10.5px] leading-relaxed text-soft">
              {on
                ? '组件按 devicePixelRatio 放大画布，高分屏下文字依然锐利；瓦片尺寸随文字宽度自适应。'
                : '水印已关闭 —— 演示 Watermark 是可选的包装层，关掉后内容完全不受影响。'}
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
