import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input, Label, Textarea } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { AppSwitch } from '@/components/ui/switch'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/demo/form')({
  component: Page,
})

function Page() {
  const [switches, setSwitches] = React.useState({ mfa: true, notify: false, readonly: true })
  const [checks, setChecks] = React.useState({ a: true, b: false })
  const [city, setCity] = React.useState('sh')
  const [keyword, setKeyword] = React.useState('')

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 表单控件 · 输入、选择、开关与校验态</span>}
        title="表单控件"
        description="统一 36px 控件高度与 12.5px 标签；错误态靠边框 + 副文案双通道提示，不只靠颜色。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <DemoBlock
            id="demo-form"
            title="表单控件 Form Controls"
            desc="输入框 / 多行文本 / 下拉 / 开关 / 复选框，统一 36px 高度与 12.5px 标签"
            code={`<Input placeholder="请输入…" />
<AppSelect value={city} onValueChange={setCity} options={CITIES} />
<AppSwitch checked={on} onCheckedChange={setOn} />
<Checkbox checked={a} onCheckedChange={setA} label="订阅告警" />`}
          >
            <div className="grid grid-cols-3 gap-x-5 gap-y-4">
              <div>
                <Label>任务名称</Label>
                <Input placeholder="例如：知识库增量同步" />
                <p className="mt-1 text-[10.5px] text-soft">仅支持中英文、数字与短横线</p>
              </div>
              <div>
                <Label>带图标的输入框</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soft" />
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="搜索任务、服务、模型…"
                    className="pl-8"
                  />
                </div>
                <p className="mt-1 text-[10.5px] text-soft">当前输入：{keyword || '（空）'}</p>
              </div>
              <div>
                <Label>运行环境</Label>
                <AppSelect
                  value={city}
                  onValueChange={setCity}
                  options={[
                    { value: 'sh', label: '生产环境 · 上海' },
                    { value: 'bj', label: '预发布 · 北京' },
                    { value: 'gz', label: '开发 · 广州' },
                  ]}
                />
                <p className="mt-1 text-[10.5px] text-soft">已选值：{city}</p>
              </div>
              <div>
                <Label>校验失败态</Label>
                <Input placeholder="超出长度限制" className="border-rose-400 focus:border-rose-500 focus:ring-rose-500/15" />
                <p className="mt-1 text-[10.5px] text-rose-600 dark:text-rose-400">名称长度不能超过 32 个字符</p>
              </div>
              <div>
                <Label>禁用态</Label>
                <Input defaultValue="由系统自动生成" disabled />
                <p className="mt-1 text-[10.5px] text-soft">任务 ID 不可修改</p>
              </div>
              <div>
                <Label>带后缀单位</Label>
                <div className="relative">
                  <Input defaultValue="24" className="pr-16" />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11.5px] text-soft">
                    个 / 工作区
                  </span>
                </div>
                <p className="mt-1 text-[10.5px] text-soft">并发上限超出后任务排队</p>
              </div>

              <div className="col-span-2">
                <Label>备注说明</Label>
                <Textarea placeholder="补充本次任务的背景、输入数据来源与预期产物…" />
              </div>

              <div className="space-y-2.5">
                <Label>开关</Label>
                <div className="rounded-lg border border-line bg-canvas/40 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] text-ink">强制多因子认证</span>
                    <AppSwitch checked={switches.mfa} onCheckedChange={(v) => setSwitches((s) => ({ ...s, mfa: v }))} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2">
                  <span className="text-[12px] text-ink">告警通知</span>
                  <AppSwitch checked={switches.notify} onCheckedChange={(v) => setSwitches((s) => ({ ...s, notify: v }))} />
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2">
                  <span className="text-[12px] text-muted">只读模式（禁用）</span>
                  <AppSwitch checked={switches.readonly} disabled onCheckedChange={() => {}} />
                </div>
              </div>

              <div className="col-span-3 space-y-2.5">
                <Label>复选框</Label>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <Checkbox
                    checked={checks.a}
                    onCheckedChange={(v) => setChecks((s) => ({ ...s, a: v }))}
                    label="任务执行失败"
                    description="失败后立即推送"
                  />
                  <Checkbox
                    checked={checks.b}
                    onCheckedChange={(v) => setChecks((s) => ({ ...s, b: v }))}
                    label="服务健康异常"
                    description="连续 3 次探测失败触发"
                  />
                  <Checkbox checked={false} indeterminate onCheckedChange={() => {}} label="部分选中" />
                  <Checkbox checked disabled onCheckedChange={() => {}} label="已锁定" />
                </div>
              </div>
            </div>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
