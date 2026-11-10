import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import { Megaphone, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AppSwitch } from '@/components/ui/switch'
import { DemoBlock, Row } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { useDemoPrefStore } from '@/stores/demo-pref.store'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/demo/preference')({
  component: Page,
})

const ROW_HEIGHT = { compact: 'h-8', default: 'h-11', roomy: 'h-14' } as const

const SAMPLE_ROWS = [
  { name: '图像超分流水线', owner: '林小满', status: '运行中' },
  { name: '语音转写批处理', owner: '赵子昂', status: '排队中' },
  { name: '数据清洗 · 周期任务', owner: '陈默', status: '已完成' },
]

function Page() {
  const pref = useDemoPrefStore()
  const bannerAtTop = pref.bannerEnabled && pref.bannerPosition === 'top'
  const bannerAtBottom = pref.bannerEnabled && pref.bannerPosition === 'bottom'

  const banner = (
    <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-[12px] text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
      <Megaphone className="h-3.5 w-3.5 shrink-0" />
      这是一条由「扩展偏好」驱动的演示横幅 —— 关掉开关或换个位置试试。
    </div>
  )

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 功能</span>}
        title="偏好扩展示例"
        description="模板自带偏好（主题/密度/圆角）在 theme.store；业务项目扩展自己的偏好时，照本页的独立 store 模式做，互不干扰。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 space-y-4">
          <DemoBlock
            title="偏好驱动的 UI（实时生效 + 刷新保持）"
            desc="三个偏好项：横幅开关 / 横幅位置 / 表格行高，改动立刻反映到下方示例区"
            code={`// stores/demo-pref.store.ts（节选）
export const useDemoPrefStore = create<DemoPrefState>()(
  persist(
    (set) => ({
      ...DEFAULT_DEMO_PREF,
      setBannerEnabled: (v) => set({ bannerEnabled: v }),
      // ...
    }),
    { name: 'apex-demo-pref' },  // localStorage 键
  ),
)`}
          >
            <div className="space-y-3">
              {bannerAtTop ? banner : null}
              <div className="overflow-hidden rounded-lg border border-line">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-line bg-canvas text-left text-[11px] text-soft">
                      <th className="px-3.5 py-2.5 font-medium">任务名</th>
                      <th className="px-3.5 py-2.5 font-medium">负责人</th>
                      <th className="px-3.5 py-2.5 font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_ROWS.map((r) => (
                      <tr key={r.name} className="border-b border-line/60 last:border-0">
                        <td className={cn('px-3.5 align-middle text-ink', ROW_HEIGHT[pref.tableSize])}>{r.name}</td>
                        <td className={cn('px-3.5 align-middle text-muted', ROW_HEIGHT[pref.tableSize])}>{r.owner}</td>
                        <td className={cn('px-3.5 align-middle text-muted', ROW_HEIGHT[pref.tableSize])}>{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {bannerAtBottom ? banner : null}
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-semibold text-ink">扩展偏好</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  pref.reset()
                  toast.success('已还原默认偏好')
                }}
              >
                <RotateCcw className="h-3 w-3" />
                还原默认
              </Button>
            </div>
            <div className="mt-2">
              <Row label="演示横幅">
                <AppSwitch checked={pref.bannerEnabled} onCheckedChange={pref.setBannerEnabled} />
              </Row>
              <Row label="横幅位置">
                {(['top', 'bottom'] as const).map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant={pref.bannerPosition === p ? 'primary' : 'outline'}
                    onClick={() => pref.setBannerPosition(p)}
                  >
                    {p === 'top' ? '顶部' : '底部'}
                  </Button>
                ))}
              </Row>
              <Row label="表格行高">
                {(['compact', 'default', 'roomy'] as const).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={pref.tableSize === s ? 'primary' : 'outline'}
                    onClick={() => pref.setTableSize(s)}
                  >
                    {s === 'compact' ? '紧凑' : s === 'default' ? '默认' : '宽松'}
                  </Button>
                ))}
              </Row>
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink">扩展原则</div>
            <ul className="mt-2.5 space-y-2 text-[11.5px] leading-relaxed text-muted">
              <li>· 一个域一个 store，不要往 theme.store 里塞业务偏好；</li>
              <li>· 默认值集中成 <code className="font-mono">DEFAULT</code> 对象，reset 一键还原；</li>
              <li>· localStorage 键带 <code className="font-mono">apex-</code> 前缀，多应用共存不冲突；</li>
              <li>· 需要跨设备同步时，把 set 动作再挂到{' '}
                <code className="font-mono">PUT /user/preferences/xxx</code>（工作台布局就是这么做的）。
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
