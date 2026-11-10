import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { AlertTriangle, ArrowRightLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/demo/json-bigint')({
  component: Page,
})

/** 含 BigInt 的示例对象（雪花 ID 一类的大整数在 JS 里必须用 BigInt 才不丢精度） */
const SAMPLE = {
  name: 'batch-task',
  traceId: 9007199254740993n, // Number.MAX_SAFE_INTEGER + 1
  payload: { tags: ['a', 'b'], weight: 0.75 },
}

/** BigInt 安全序列化：字符串化并加 "n" 后缀标记 */
function stringifyWithBigInt(value: unknown): string {
  return JSON.stringify(value, (_k, v) => (typeof v === 'bigint' ? `${v.toString()}n` : v))
}

/** 与上面配对的还原器："...n" 结尾的字符串还原为 BigInt */
function parseWithBigInt(text: string): unknown {
  return JSON.parse(text, (_k, v) =>
    typeof v === 'string' && /^-?\d+n$/.test(v) ? BigInt(v.slice(0, -1)) : v,
  )
}

type Result =
  | { kind: 'idle' }
  | { kind: 'error'; title: string; detail: string }
  | { kind: 'ok'; title: string; query: string; roundTrip: string; preserved: boolean }

function Page() {
  const [result, setResult] = React.useState<Result>({ kind: 'idle' })

  /** 直接 JSON.stringify —— 演示 BigInt 报错 */
  const tryNaive = () => {
    try {
      JSON.stringify(SAMPLE)
      setResult({ kind: 'idle' })
    } catch (e) {
      setResult({
        kind: 'error',
        title: 'TypeError',
        detail: e instanceof Error ? e.message : '序列化失败',
      })
    }
  }

  /** 安全序列化 → URLSearchParams → 还原 → 校验精度 */
  const trySafe = () => {
    const json = stringifyWithBigInt(SAMPLE)
    const query = new URLSearchParams({ name: SAMPLE.name, payload: json }).toString()
    // 模拟对端：从 query 里取回并还原
    const back = new URLSearchParams(query)
    const restored = parseWithBigInt(back.get('payload') ?? '{}') as typeof SAMPLE
    setResult({
      kind: 'ok',
      title: '序列化 → 传输 → 还原 全链路成功',
      query,
      roundTrip: `traceId 还原值：${restored.traceId.toString()}`,
      preserved: restored.traceId === SAMPLE.traceId,
    })
  }

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 功能</span>}
        title="JSON BigInt"
        description="超过 Number.MAX_SAFE_INTEGER 的大整数（雪花 ID）必须用 BigInt；但标准 JSON 不认识 BigInt，需要自定义编解码。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="示例对象与两种做法"
            desc="traceId 是 BigInt（雪花 ID）—— 先看直接序列化怎么翻车"
            code={`// ① 直接序列化 —— 抛 TypeError
JSON.stringify({ traceId: 9007199254740993n })
// TypeError: Do not know how to serialize a BigInt

// ② 安全做法 —— replacer 加 "n" 后缀，reviver 还原
JSON.stringify(obj, (_k, v) =>
  typeof v === 'bigint' ? \`\${v}n\` : v)
JSON.parse(text, (_k, v) =>
  /^-?\\d+n$/.test(v) ? BigInt(v.slice(0, -1)) : v)`}
          >
            <div className="space-y-3">
              <div className="rounded-lg border border-line bg-canvas px-3 py-2.5">
                <div className="text-[10.5px] text-soft">示例对象</div>
                <pre className="mt-1 overflow-x-auto font-mono text-[11.5px] text-ink">
{`{
  name: 'batch-task',
  traceId: 9007199254740993n,  // BigInt
  payload: { tags: ['a','b'], weight: 0.75 }
}`}</pre>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Button variant="outline" onClick={tryNaive}>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  直接 JSON.stringify（预期报错）
                </Button>
                <Button onClick={trySafe}>
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  安全序列化 + 还原
                </Button>
              </div>

              {result.kind === 'error' ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 dark:border-rose-500/30 dark:bg-rose-500/10">
                  <div className="font-mono text-[12px] font-medium text-rose-700 dark:text-rose-300">{result.title}</div>
                  <div className="mt-1 font-mono text-[11px] text-rose-600/90 dark:text-rose-400/90">{result.detail}</div>
                </div>
              ) : null}

              {result.kind === 'ok' ? (
                <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <div className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {result.title}
                  </div>
                  <div className="break-all font-mono text-[10.5px] text-emerald-700/80 dark:text-emerald-400/80">
                    query = {result.query}
                  </div>
                  <div className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
                    {result.roundTrip} · {result.preserved ? '精度无损 ✔' : '精度丢失 ✘'}
                  </div>
                </div>
              ) : null}
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink">为什么不用 Number</div>
            <div className="mt-2.5 rounded-lg border border-line bg-canvas px-3 py-2.5 font-mono text-[11px] leading-relaxed text-muted">
              9007199254740993 === 9007199254740992<br />
              <span className="text-rose-500">// true —— 精度已经丢了，且毫无征兆</span>
            </div>
            <ul className="mt-3 space-y-2 text-[11.5px] leading-relaxed text-muted">
              <li>· <span className="font-medium text-ink">触发条件：</span>雪花号、订单号等超过 <code className="font-mono">2^53-1</code> 的整数；</li>
              <li>· <span className="font-mono text-ink">"…n" 标记法：</span>序列化加后缀、解析时成对还原，跨语言后端只需约定同一规则；</li>
              <li>· <span className="font-medium text-ink">后端配合：</span>接 .NET 时大整数走 string 传输（reviver 统一转 BigInt），比原生 JSON 数字更稳。</li>
            </ul>
            <p className="mt-3 border-t border-line pt-3 text-[10.5px] leading-relaxed text-soft">
              JSON.stringify 对 bigint 报错是规范行为（标准 JSON 不支持 bigint；
              TC39 的 <code className="font-mono">JSON.parse source text access</code> 提案落地前，只能自定义编解码）。
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
