import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { DemoBlock } from '@/components/shared/demo-block'
import { Field, check, rules } from '@/components/shared/form-kit'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/examples/form/api')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 表单 › Api · 异步数据源与提交态</span>}
        title="Api"
        description="表单里的接口交互：级联下拉异步加载、提交按钮 loading 与防重复、失败路径与重试。"
      />
      <ApiForm />
    </>
  )
}

/** 模拟接口 —— 600ms 延迟返回 */
const PROVINCES = [
  { value: 'bj', label: '北京市' },
  { value: 'sh', label: '上海市' },
  { value: 'gd', label: '广东省' },
]
const CITIES: Record<string, { value: string; label: string }[]> = {
  bj: [{ value: 'bj-1', label: '东城区' }, { value: 'bj-2', label: '海淀区' }, { value: 'bj-3', label: '朝阳区' }],
  sh: [{ value: 'sh-1', label: '黄浦区' }, { value: 'sh-2', label: '浦东新区' }, { value: 'sh-3', label: '徐汇区' }],
  gd: [{ value: 'gd-1', label: '广州市' }, { value: 'gd-2', label: '深圳市' }, { value: 'gd-3', label: '珠海市' }],
}

function fetchCities(province: string): Promise<{ value: string; label: string }[]> {
  return new Promise((resolve) => setTimeout(() => resolve(CITIES[province] ?? []), 600))
}

function ApiForm() {
  const [name, setName] = React.useState('')
  const [province, setProvince] = React.useState('bj')
  const [city, setCity] = React.useState('')

  const [cityOpts, setCityOpts] = React.useState<{ value: string; label: string }[]>([])
  const [cityLoading, setCityLoading] = React.useState(false)

  const [submitting, setSubmitting] = React.useState(false)
  const [failMode, setFailMode] = React.useState(false)
  const [lastResult, setLastResult] = React.useState<string>('')

  // 级联加载：省份变化 → 拉城市，竞态用序号丢弃过期响应
  const reqSeq = React.useRef(0)
  React.useEffect(() => {
    const seq = ++reqSeq.current
    setCityLoading(true)
    setCity('')
    fetchCities(province).then((opts) => {
      if (seq !== reqSeq.current) return // 过期响应丢弃
      setCityOpts(opts)
      setCityLoading(false)
    })
  }, [province])

  const errs = {
    name: check(name, [rules.required('请输入门店名称')]),
    city: check(city, [rules.required('请选择城市')]),
  }
  const valid = !errs.name && !errs.city

  const submit = async () => {
    if (!valid) {
      toast.error('请先修正表单中的错误')
      return
    }
    if (submitting) return // 防重复提交
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 900))
    setSubmitting(false)
    if (failMode) {
      setLastResult('HTTP 500 · Internal Server Error（模拟失败）')
      toast.error('提交失败，可点击「重试」')
      return
    }
    setLastResult(JSON.stringify({ name, province, city }, null, 2))
    toast.success('提交成功')
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">
        <DemoBlock
          id="form-api"
          title="门店入驻（异步数据源）"
          desc="城市选项按省份异步加载；提交走 loading 态并防重复；可切换失败模式演练重试"
          code={`// 级联加载 + 竞态丢弃：
const seq = ++reqSeq.current
fetchCities(province).then((opts) => {
  if (seq !== reqSeq.current) return // 过期响应丢弃
  setCityOpts(opts)
})
// 防重复：if (submitting) return
// 失败路径：failMode → 提示重试`}
        >
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="门店名称" required error={errs.name} hint="将展示在地图页">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如 望京旗舰店" />
            </Field>
            <Field label="省份" hint="切换后城市选项异步刷新">
              <AppSelect value={province} onValueChange={setProvince} options={PROVINCES} />
            </Field>
            <Field label="城市" required error={errs.city} hint={cityLoading ? '选项加载中…' : `已加载 ${cityOpts.length} 个城市`}>
              {cityLoading ? (
                <div className="flex h-[34px] items-center gap-2 rounded-md border border-line px-3 text-[11px] text-soft">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> 加载中…
                </div>
              ) : (
                <AppSelect value={city} onValueChange={setCity} options={cityOpts} placeholder="请选择城市" />
              )}
            </Field>
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-line pt-4">
            <label className="flex cursor-pointer items-center gap-2 text-[11px] text-muted">
              <input id="form-api-fail-mode" type="checkbox" checked={failMode} onChange={(e) => setFailMode(e.target.checked)} className="accent-rose-600" />
              模拟接口失败（演练错误与重试路径）
            </label>
            <Button size="sm" disabled={submitting} onClick={submit}>
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> 提交中…
                </>
              ) : lastResult.startsWith('HTTP 500') ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5" /> 重试
                </>
              ) : (
                '提交'
              )}
            </Button>
          </div>
        </DemoBlock>
      </div>

      <div className="col-span-4">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>接口响应</CardTitle>
            <Badge variant={lastResult.startsWith('HTTP 500') ? 'red' : lastResult ? 'green' : 'gray'}>
              {lastResult.startsWith('HTTP 500') ? '失败' : lastResult ? '成功' : '等待'}
            </Badge>
          </CardHeader>
          <pre className="overflow-x-auto px-5 py-4 text-[11px] leading-relaxed text-muted">
            <code>{lastResult || '// 提交后在这里查看响应'}</code>
          </pre>
        </Card>
      </div>
    </div>
  )
}
