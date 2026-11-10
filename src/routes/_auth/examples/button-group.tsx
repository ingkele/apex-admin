import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils'
import { Check, LoaderCircle } from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/button-group')({
  component: Page,
})

const ZONES = ['华东 2', '华北 1', '华南 1', '新加坡']
const CHANNELS = ['渠道 A', '渠道 B', '渠道 C', '灰度渠道']
const VIEWS = ['列表', '看板', '日历']

function Page() {
  const [zone, setZone] = React.useState('华东 2')
  const [channels, setChannels] = React.useState<string[]>(['渠道 A'])
  const [view, setView] = React.useState('列表')
  const [pendingView, setPendingView] = React.useState<string | null>(null)
  const [confirmView, setConfirmView] = React.useState<string | null>(null)
  const [asyncLoading, setAsyncLoading] = React.useState(false)

  const toggleChannel = (c: string) => {
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }

  /** beforeChange：切换前异步校验（模拟接口），失败则不允许切换 */
  const requestViewChange = (next: string) => {
    if (next === view) return
    setPendingView(next)
    setAsyncLoading(true)
    window.setTimeout(() => {
      setAsyncLoading(false)
      if (next === '日历') {
        // 异步校验不通过 → 弹二次确认由用户裁决
        setConfirmView(next)
      } else {
        setView(next)
        setPendingView(null)
        toast.success(`已切换到「${next}」视图`)
      }
    }, 700)
  }

  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 按钮组 · 单选 / 多选 / 异步确认</span>}
        title="按钮组"
        description="分段单选、勾选多选、beforeChange 异步确认与禁用态 —— 筛选器与视图切换的常用形态。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6 space-y-4">
          <DemoBlock
            id="btn-group-single"
            title="单选分段"
            desc="互斥选择，选中项高亮；适合视图切换、区域筛选"
            code={`<div className="flex rounded-lg border border-line p-0.5">
  {options.map((o) => (
    <button className={cn(base, active && 'bg-surface shadow-sm')}>
      {o}
    </button>
  ))}
</div>`}
          >
            <div className="space-y-3.5">
              <div>
                <div className="mb-1.5 text-[10.5px] text-soft">区域（受控单选）</div>
                <div className="inline-flex rounded-lg border border-line bg-canvas/40 p-0.5">
                  {ZONES.map((z) => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => setZone(z)}
                      className={cn(
                        'rounded-md px-3.5 py-1.5 text-[11.5px] transition-colors',
                        zone === z
                          ? 'bg-surface font-medium text-ink shadow-sm'
                          : 'text-muted hover:text-ink',
                      )}
                    >
                      {z}
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 text-[10.5px] text-muted">当前区域：<b className="text-ink">{zone}</b></div>
              </div>

              <div>
                <div className="mb-1.5 text-[10.5px] text-soft">视图（紧凑型 pill）</div>
                <div className="inline-flex overflow-hidden rounded-full border border-line">
                  {VIEWS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      className={cn(
                        'px-4 py-1.5 text-[11.5px] transition-colors',
                        view === v
                          ? 'bg-brand-600 font-medium text-white'
                          : 'bg-surface text-muted hover:bg-hover hover:text-ink',
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DemoBlock>

          <DemoBlock
            id="btn-group-multi"
            title="多选勾选"
            desc="可同时选中多项，选中项带勾选图标"
            code={`const toggle = (c) =>
  setSel((prev) =>
    prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])`}
          >
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((c) => {
                const active = channels.includes(c)
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleChannel(c)}
                    disabled={c === '灰度渠道'}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11.5px] transition-colors',
                      active
                        ? 'border-brand-500 bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                        : 'border-line text-muted hover:bg-hover hover:text-ink',
                      c === '灰度渠道' && 'cursor-not-allowed opacity-45',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-3.5 w-3.5 items-center justify-center rounded border transition-colors',
                        active ? 'border-brand-500 bg-brand-500 text-white' : 'border-line bg-surface',
                      )}
                    >
                      {active ? <Check className="h-2.5 w-2.5" /> : null}
                    </span>
                    {c}
                  </button>
                )
              })}
            </div>
            <div className="mt-3 text-[10.5px] text-muted">
              已选 {channels.length} 项：{channels.length ? channels.join('、') : '（空）'}
              {' · '}
              「灰度渠道」为禁用态（权限不足）
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-6 space-y-4">
          <DemoBlock
            id="btn-group-before-change"
            title="beforeChange 异步确认"
            desc="切换前先异步校验：通过直接切换，不通过弹二次确认由用户裁决"
            code={`const requestChange = (next) => {
  setLoading(true)
  validate(next).then((ok) => {
    if (ok) apply(next)
    else setConfirm(next) // 交给用户确认
  })
}`}
          >
            <div className="inline-flex rounded-lg border border-line bg-canvas/40 p-0.5">
              {VIEWS.map((v) => {
                const active = view === v
                const loading = asyncLoading && pendingView === v
                return (
                  <button
                    key={v}
                    type="button"
                    disabled={asyncLoading}
                    onClick={() => requestViewChange(v)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[11.5px] transition-colors',
                      active
                        ? 'bg-surface font-medium text-ink shadow-sm'
                        : 'text-muted hover:text-ink disabled:opacity-50',
                    )}
                  >
                    {loading ? <LoaderCircle className="h-3 w-3 animate-spin" /> : null}
                    {v}
                  </button>
                )
              })}
            </div>
            <div className="mt-3 rounded-lg border border-line bg-canvas/40 px-3.5 py-2.5 text-[10.5px] leading-relaxed text-muted">
              切换到「列表」「看板」→ 异步校验通过后直接切换；
              切换到<b className="text-ink">「日历」</b> → 校验失败（视图未开通），弹二次确认让用户决定是否强制切换。
              校验期间按钮禁用并显示 spinner。
            </div>

            <ConfirmDialog
              open={confirmView !== null}
              onOpenChange={(v) => !v && setConfirmView(null)}
              title={`「${confirmView ?? ''}」视图未开通`}
              description="当前工作区尚未开通日历视图，强制切换后部分功能不可用。是否继续？"
              confirmText="强制切换"
              onConfirm={() => {
                if (confirmView) {
                  setView(confirmView)
                  setPendingView(null)
                  toast.success(`已强制切换到「${confirmView}」视图`)
                }
              }}
            />
          </DemoBlock>

          <DemoBlock
            id="btn-group-disabled"
            title="禁用态"
            desc="整组禁用与单项禁用"
            code={`<button disabled={locked}>…</button>
<div className="opacity-50 pointer-events-none">…</div>`}
          >
            <div className="space-y-3">
              <div>
                <div className="mb-1.5 text-[10.5px] text-soft">单项禁用</div>
                <div className="inline-flex rounded-lg border border-line bg-canvas/40 p-0.5">
                  {ZONES.map((z, i) => (
                    <button
                      key={z}
                      type="button"
                      disabled={i === 3}
                      onClick={() => setZone(z)}
                      className={cn(
                        'rounded-md px-3.5 py-1.5 text-[11.5px] transition-colors',
                        zone === z ? 'bg-surface font-medium text-ink shadow-sm' : 'text-muted hover:text-ink',
                        i === 3 && 'cursor-not-allowed opacity-45',
                      )}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1.5 text-[10.5px] text-soft">整组禁用</div>
                <div className="pointer-events-none inline-flex rounded-lg border border-line bg-canvas/40 p-0.5 opacity-45">
                  {VIEWS.map((v) => (
                    <span key={v} className="rounded-md px-3.5 py-1.5 text-[11.5px] text-muted">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
