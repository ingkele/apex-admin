import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { Braces, ListFilter, Repeat } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/demo/serialize')({
  component: Page,
})

/** 同一份筛选条件，三种进 URL 的姿势 */
const FILTER = {
  status: ['failed', 'timeout'],
  model: 'qwen-max',
  page: 1,
  createdAfter: '2026-11-01T00:00:00Z',
}

type Style = 'repeat' | 'comma' | 'json'

const STYLES: { key: Style; label: string; icon: React.ComponentType<{ className?: string }>; hint: string }[] = [
  { key: 'repeat', label: '重复键', icon: Repeat, hint: '标准 REST 姿势，后端数组绑定天然支持' },
  { key: 'comma', label: '逗号拼接', icon: ListFilter, hint: 'URL 短、可读性好，后端需手动 split' },
  { key: 'json', label: 'JSON 单参数', icon: Braces, hint: '结构复杂时最省事，整段 encodeURIComponent' },
]

/** 三种序列化实现（与输出一一对应，演示页里展示的就是真实代码路径） */
function serialize(style: Style): string {
  const p = new URLSearchParams()
  if (style === 'repeat') {
    for (const s of FILTER.status) p.append('status', s)
    p.set('model', FILTER.model)
    p.set('page', String(FILTER.page))
    p.set('createdAfter', FILTER.createdAfter)
    return p.toString()
  }
  if (style === 'comma') {
    p.set('status', FILTER.status.join(','))
    p.set('model', FILTER.model)
    p.set('page', String(FILTER.page))
    p.set('createdAfter', FILTER.createdAfter)
    return p.toString()
  }
  p.set('filter', JSON.stringify(FILTER))
  return p.toString()
}

function Page() {
  const [style, setStyle] = React.useState<Style>('repeat')
  const query = serialize(style)

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 功能</span>}
        title="参数序列化"
        description="URL 查询参数只能是字符串：数组、对象、日期进 URL 之前都要先定序列化规则 —— 前后端按同一约定解析才不会各说各话。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="同一份筛选条件，三种进 URL 的姿势"
            desc="点上面的按钮切换序列化风格，下方输出实时变化 —— 内容完全等价，只是编码约定不同"
            code={`const FILTER = {
  status: ['failed', 'timeout'],
  model: 'qwen-max',
  page: 1,
  createdAfter: '2026-11-01T00:00:00Z',
}

// ① 重复键   ?status=failed&status=timeout&…
// ② 逗号拼接 ?status=failed%2Ctimeout&…
// ③ JSON     ?filter=%7B%22status%22%3A…`}
          >
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStyle(s.key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] transition',
                    style === s.key
                      ? 'border-brand-300 bg-brand-50/70 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300'
                      : 'border-line text-muted hover:border-brand-300 hover:text-ink',
                  )}
                >
                  <s.icon className="h-3 w-3" />
                  {s.label}
                </button>
              ))}
            </div>

            <div className="mt-3 rounded-lg border border-line bg-canvas px-3 py-2.5">
              <div className="text-[10.5px] text-soft">序列化输出</div>
              <div className="mt-1 break-all font-mono text-[11.5px] text-ink">{query}</div>
            </div>

            <div className="mt-2.5 rounded-lg border border-line px-3 py-2.5">
              <div className="text-[10.5px] text-soft">后端解析口径（ASP.NET Core 示例）</div>
              <div className="mt-1 font-mono text-[11px] leading-relaxed text-muted">
                {style === 'repeat' && 'public IActionResult List([FromQuery] string[] status, ...)\n// 模型绑定自动聚合同名参数'}
                {style === 'comma' && 'status.Split(",", StringSplitOptions.RemoveEmptyEntries)\n// 手动拆，注意编码后是 %2C'}
                {style === 'json' && 'JsonSerializer.Deserialize<FilterDto>(filter)\n// 一个参数装下全部结构'}
              </div>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-soft">
              当前风格：{STYLES.find((s) => s.key === style)!.hint}。
              大整数（雪花 ID）参数不在这三种里 —— 见「JSON BigInt」页。
            </p>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink">选型建议</div>
            <ul className="mt-2.5 space-y-2 text-[11.5px] leading-relaxed text-muted">
              <li>· <span className="font-medium text-ink">普通筛选条件：</span>逐字段写入 <code className="font-mono">URLSearchParams</code>，可读可分享可缓存；</li>
              <li>· <span className="font-medium text-ink">数组：</span>后端框架支持就用重复键，API 面向第三方用逗号拼接更友好；</li>
              <li>· <span className="font-medium text-ink">嵌套对象 / 动态结构：</span>整段 <code className="font-mono">JSON.stringify</code> 进单参数，别硬拍平；</li>
              <li>· <span className="font-medium text-ink">日期：</span>固定 ISO 8601（UTC），前后端都省心；</li>
              <li>· <span className="font-medium text-ink">大整数：</span>走 <code className="font-mono">JSON BigInt</code> 页的编解码约定。</li>
            </ul>
            <p className="mt-3 border-t border-line pt-3 text-[10.5px] leading-relaxed text-soft">
              模板 <code className="font-mono">src/lib/http.ts</code> 的{' '}
              <code className="font-mono">toQueryString</code> 已按「重复键」口径统一处理
              （undefined / 空串跳过、值统一 String()），分页查询全链路共用这一份实现。
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
