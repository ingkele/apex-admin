import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Play, RotateCcw } from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/motion')({
  component: Page,
})

/** 动效预设 —— CSS keyframes，零依赖（vben Motion 的等价能力） */
const PRESETS = [
  { key: 'fade', label: '淡入', cls: 'motion-fade' },
  { key: 'fade-up', label: '上浮', cls: 'motion-fade-up' },
  { key: 'zoom', label: '缩放', cls: 'motion-zoom' },
  { key: 'slide-left', label: '左滑', cls: 'motion-slide-left' },
  { key: 'flip', label: '翻转', cls: 'motion-flip' },
  { key: 'bounce', label: '弹跳', cls: 'motion-bounce' },
] as const

const STYLE = `
@keyframes kf-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes kf-fade-up { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
@keyframes kf-zoom { from { opacity: 0; transform: scale(.82) } to { opacity: 1; transform: none } }
@keyframes kf-slide-left { from { opacity: 0; transform: translateX(22px) } to { opacity: 1; transform: none } }
@keyframes kf-flip { from { opacity: 0; transform: rotateY(-70deg) } to { opacity: 1; transform: none } }
@keyframes kf-bounce { 0% { transform: translateY(0) } 35% { transform: translateY(-12px) } 65% { transform: translateY(4px) } 100% { transform: translateY(0) } }
.motion-fade { animation: kf-fade .5s ease both }
.motion-fade-up { animation: kf-fade-up .5s ease both }
.motion-zoom { animation: kf-zoom .45s cubic-bezier(.2,.9,.3,1.2) both }
.motion-slide-left { animation: kf-slide-left .5s ease both }
.motion-flip { animation: kf-flip .6s ease both; perspective: 500px }
.motion-bounce { animation: kf-bounce .7s ease both }
`

function Page() {
  const [playKey, setPlayKey] = React.useState(0)
  const [staggerKey, setStaggerKey] = React.useState(0)

  return (
    <>
      <style>{STYLE}</style>
      <PageHeader
        eyebrow={<span>示例 › Motion · 入场动效预设与交错动画</span>}
        title="Motion"
        description="六种入场动效预设（CSS keyframes 实现）；交错动画让列表按序进场。点「重播」再次触发。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            id="motion-presets"
            title="动效预设"
            desc="点击任意卡片单独重播，或一键重播全部"
            code={`@keyframes kf-fade-up {
  from { opacity: 0; transform: translateY(14px) }
  to   { opacity: 1; transform: none }
}
.motion-fade-up { animation: kf-fade-up .5s ease both }
// 重播：key 变化触发 React 重新挂载 → 动画重新执行`}
          >
            <div className="mb-3 flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setPlayKey((k) => k + 1)}>
                <Play className="h-3.5 w-3.5" /> 重播全部
              </Button>
              <span className="text-[10.5px] text-soft">key 变化 → 组件重挂载 → 动画从头播放</span>
            </div>
            <div key={playKey} className="grid grid-cols-3 gap-3">
              {PRESETS.map((p) => (
                <div
                  key={p.key}
                  className={cn(
                    'flex h-[88px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-line bg-surface transition-colors hover:border-brand-300 hover:bg-brand-50/50 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5',
                    p.cls,
                  )}
                  onClick={() => setPlayKey((k) => k + 1)}
                >
                  <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                  <div className="text-[11.5px] font-medium text-ink">{p.label}</div>
                  <div className="font-mono text-[9.5px] text-soft">{p.key}</div>
                </div>
              ))}
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <DemoBlock
            id="motion-stagger"
            title="交错动画"
            desc="列表项按序延迟进场（animation-delay 递增）"
            code={`items.map((item, i) => (
  <li key={item.id}
    className="motion-fade-up"
    style={{ animationDelay: \`\${i * 90}ms\` }}>
    …
  </li>
))`}
          >
            <div className="mb-3 flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setStaggerKey((k) => k + 1)}>
                <RotateCcw className="h-3.5 w-3.5" /> 重播
              </Button>
              <span className="text-[10.5px] text-soft">每项延迟 90ms 依次进场</span>
            </div>
            <ul key={staggerKey} className="space-y-2">
              {[
                '任务「知识库增量同步」执行成功',
                '服务 vector-index-svc 扩容完成',
                'API Key sk-***8f2c 即将过期',
                '审计导出已生成（CSV · 1.2MB）',
                '模型 gpt-4o 切换到备用渠道',
              ].map((text, i) => (
                <li
                  key={text}
                  className="motion-fade-up flex items-center gap-2.5 rounded-lg border border-line bg-surface px-3.5 py-2.5"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[9.5px] font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    {i + 1}
                  </span>
                  <span className="text-[11px] text-muted">{text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
              交错动画适合通知流、步骤条、加载完成后的列表 —— 用
              <code className="mx-1 rounded bg-surface px-1 py-0.5 text-[10px] text-ink">animation-delay</code>
              递增即可，无需 JS 时间轴。
            </p>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
