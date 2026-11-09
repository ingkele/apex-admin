import { Check, LoaderCircle, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DemoBlock, Row } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { LiveBadge, StatBadge } from '@/components/shared/stat-tile'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/demo/base')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 基础组件 · 按钮、徽章与设计令牌</span>}
        title="基础组件"
        description="语义色、尺寸、状态一屏看全；颜色全部走 CSS 变量，切换主题色与明暗后自动生效。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            id="demo-button"
            title="按钮 Button"
            desc="6 种语义变体 × 4 种尺寸，支持图标、加载态与禁用"
            code={`<Button>主按钮</Button>
<Button variant="outline">次要</Button>
<Button variant="danger">危险</Button>
<Button size="sm"><Plus className="h-3.5 w-3.5" /> 新建</Button>
<Button disabled><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> 提交中</Button>`}
          >
            <div className="space-y-1">
              <Row label="变体">
                <Button>主按钮</Button>
                <Button variant="outline">次要按钮</Button>
                <Button variant="soft">柔和按钮</Button>
                <Button variant="ghost">幽灵按钮</Button>
                <Button variant="danger">危险操作</Button>
                <Button variant="link">文字链接</Button>
              </Row>
              <Row label="尺寸">
                <Button size="sm">小按钮</Button>
                <Button>默认按钮</Button>
                <Button size="lg">大按钮</Button>
                <Button size="icon" variant="outline" aria-label="新增">
                  <Plus className="h-4 w-4" />
                </Button>
              </Row>
              <Row label="带图标">
                <Button size="sm">
                  <Plus className="h-3.5 w-3.5" /> 新建任务
                </Button>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-3.5 w-3.5" /> 刷新
                </Button>
                <Button size="sm" variant="danger">
                  <Trash2 className="h-3.5 w-3.5" /> 删除
                </Button>
              </Row>
              <Row label="状态">
                <Button disabled>
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> 提交中
                </Button>
                <Button variant="outline" disabled>
                  已禁用
                </Button>
              </Row>
            </div>
          </DemoBlock>
        </div>

        {/* 徽章 */}
        <div className="col-span-5">
          <DemoBlock
            id="demo-badge"
            title="徽章 Badge"
            desc="5 种色调 + 业务状态映射 + 趋势徽章"
            code={`<Badge variant="brand">品牌</Badge>
<StatusBadge status="running" />
<StatBadge delta="+12.4%" tone="up" />
<LiveBadge label="实时" />`}
          >
            <div className="space-y-1">
              <Row label="色调">
                <Badge variant="brand">品牌</Badge>
                <Badge variant="green">成功</Badge>
                <Badge variant="red">失败</Badge>
                <Badge variant="amber">告警</Badge>
                <Badge variant="gray">中性</Badge>
              </Row>
              <Row label="状态">
                <StatusBadge status="running" />
                <StatusBadge status="success" />
                <StatusBadge status="failed" />
                <StatusBadge status="queued" />
                <StatusBadge status="healthy" />
                <StatusBadge status="warn" />
                <StatusBadge status="disabled" />
              </Row>
              <Row label="趋势">
                <StatBadge delta="+12.4%" tone="up" />
                <StatBadge delta="-22.1%" tone="down" />
                <LiveBadge label="实时" />
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Check className="h-3 w-3" /> 已通过安全基线
                </span>
              </Row>
            </div>
          </DemoBlock>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <DemoBlock
            id="demo-tokens"
            title="设计令牌 Design Tokens"
            desc="颜色、圆角、间距全部走 CSS 变量，换主题自动生效"
            code={`var(--brand-500)  // 主色
var(--line)        // 描边
var(--surface)     // 卡片底
var(--muted)       // 次要文字`}
          >
            <div className="grid grid-cols-6 gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].slice(0, 6).map((n) => (
                <div key={n} className="text-center">
                  <div
                    className="h-12 rounded-lg border border-line"
                    style={{ background: `var(--brand-${n})` }}
                  />
                  <div className="mt-1 text-[10px] text-soft">{n}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[10.5px] text-muted">
              <span className="rounded-md border border-line bg-surface px-2 py-1">圆角 8 / 12 / 16</span>
              <span className="rounded-md border border-line bg-surface px-2 py-1">间距 4 的倍数</span>
              <span className="rounded-md border border-line bg-surface px-2 py-1">字号 10.5 / 12.5 / 13.5</span>
              <span className="rounded-md border border-line bg-surface px-2 py-1">密度可切 compact</span>
            </div>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
