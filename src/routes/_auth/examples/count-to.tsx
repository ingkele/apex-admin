import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { AppSwitch } from '@/components/ui/switch'
import { Play, RotateCcw } from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/count-to')({
  component: Page,
})

type Easing = 'linear' | 'easeOut' | 'easeOutCubic' | 'bounce'

const EASINGS: Record<Easing, (t: number) => number> = {
  linear: (t) => t,
  easeOut: (t) => 1 - (1 - t) ** 2,
  easeOutCubic: (t) => 1 - (1 - t) ** 3,
  bounce: (t) => {
    const n = 7.5625
    const d = 2.75
    if (t < 1 / d) return n * t * t
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375
    return n * (t -= 2.625 / d) * t + 0.984375
  },
}

/** 数字滚动 —— requestAnimationFrame + 缓动函数，零依赖 */
function useCountTo(target: number, duration: number, easing: Easing, running: boolean) {
  const [value, setValue] = React.useState(0)
  const rafRef = React.useRef(0)

  React.useEffect(() => {
    if (!running) return
    const ease = EASINGS[easing]
    const start = performance.now()
    const from = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setValue(from + (target - from) * ease(t))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration, easing, running])

  return value
}

function formatNumber(n: number, decimals: number, separator: boolean) {
  const fixed = n.toFixed(decimals)
  if (!separator) return fixed
  const [int, frac] = fixed.split('.')
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return frac ? `${grouped}.${frac}` : grouped
}

function Page() {
  const [target, setTarget] = React.useState(125800)
  const [duration, setDuration] = React.useState(1600)
  const [easing, setEasing] = React.useState<Easing>('easeOutCubic')
  const [separator, setSeparator] = React.useState(true)
  const [decimals, setDecimals] = React.useState(0)
  const [running, setRunning] = React.useState(true)
  const [runKey, setRunKey] = React.useState(0)

  const value = useCountTo(target, duration, easing, running)

  const replay = () => {
    setRunning(false)
    // 下一帧再启动，确保 effect 清理后重新从 0 计数
    requestAnimationFrame(() => {
      setRunKey((k) => k + 1)
      setRunning(true)
    })
  }

  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › CountTo · 数字滚动计数器</span>}
        title="CountTo"
        description="rAF 驱动的数字滚动动画；目标值、时长、缓动、千分位、小数位全部外置可调（对齐 vben CountTo 配置面板）。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            id="count-to-preview"
            title="计数预览"
            desc="修改右侧配置后点「重新计数」生效"
            code={`const tick = (now: number) => {
  const t = Math.min(1, (now - start) / duration)
  setValue(from + (target - from) * ease(t))
  if (t < 1) raf = requestAnimationFrame(tick)
}`}
          >
            <div className="rounded-xl border border-line bg-gradient-to-br from-brand-500/8 to-transparent px-6 py-8 text-center">
              <div className="text-[11px] text-soft">累计调用次数（次）</div>
              <div key={runKey} className="mt-2 font-mono text-[44px] font-semibold leading-none tracking-tight text-ink">
                {formatNumber(value, decimals, separator)}
              </div>
              <div className="mt-2 text-[10.5px] text-soft">
                0 → {formatNumber(target, decimals, separator)} · {duration}ms · {easing}
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <Button size="sm" onClick={replay}>
                  <Play className="h-3.5 w-3.5" /> 重新计数
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTarget(125800)
                    setDuration(1600)
                    setEasing('easeOutCubic')
                    setSeparator(true)
                    setDecimals(0)
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" /> 重置配置
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: '服务实例', value: '328', suffix: ' 台' },
                { label: '今日调用', value: '1.24', suffix: ' 亿' },
                { label: '平均延迟', value: '86.5', suffix: ' ms' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-line px-3.5 py-2.5">
                  <div className="text-[10px] text-soft">{s.label}</div>
                  <div className="mt-0.5 text-[16px] font-semibold text-ink">
                    {s.value}
                    <span className="text-[10px] font-normal text-muted">{s.suffix}</span>
                  </div>
                </div>
              ))}
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <DemoBlock
            id="count-to-config"
            title="配置面板"
            desc="全部动画参数外置，实时修改、手动触发"
            code={`<Input value={target} onChange={…} label="目标值" />
<AppSelect value={easing} options={['linear','easeOut',…]} />
<AppSwitch checked={separator} label="千分位" />`}
          >
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>目标值</Label>
                  <Input
                    type="number"
                    value={target}
                    min={0}
                    onChange={(e) => setTarget(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
                <div>
                  <Label>时长（ms）</Label>
                  <Input
                    type="number"
                    value={duration}
                    min={100}
                    step={100}
                    onChange={(e) => setDuration(Math.max(100, Number(e.target.value) || 100))}
                  />
                </div>
              </div>

              <div>
                <Label>缓动函数</Label>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(EASINGS) as Easing[]).map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEasing(e)}
                      className={
                        'rounded-md border px-2.5 py-1 text-[10.5px] transition-colors ' +
                        (easing === e
                          ? 'border-brand-500 bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                          : 'border-line text-muted hover:bg-hover hover:text-ink')
                      }
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>小数位数：{decimals}</Label>
                <input
                  id="count-to-decimals"
                  type="range"
                  min={0}
                  max={4}
                  value={decimals}
                  onChange={(e) => setDecimals(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-line px-3.5 py-2.5">
                <div>
                  <div className="text-[11.5px] font-medium text-ink">千分位分隔</div>
                  <div className="text-[10px] text-soft">125,800 vs 125800</div>
                </div>
                <AppSwitch checked={separator} onCheckedChange={setSeparator} />
              </div>
            </div>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
