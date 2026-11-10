import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { AppSwitch } from '@/components/ui/switch'
import { DemoBlock } from '@/components/shared/demo-block'
import { Field, check, rules } from '@/components/shared/form-kit'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/examples/form/collapse')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 表单 › 单项表单折叠 · 分组手风琴</span>}
        title="单项表单折叠"
        description="长表单按分组折叠收纳：组头带校验状态，展开的组才渲染字段；可整表单展开/折叠。"
      />
      <CollapseForm />
    </>
  )
}

function CollapseForm() {
  const [open, setOpen] = React.useState<Record<string, boolean>>({ base: true, advance: false, notify: false })
  const [v, setV] = React.useState({ name: '', owner: '', level: 'p1', concurrency: '8', timeout: '30', email: '', webhook: '', digest: true })
  const [submitted, setSubmitted] = React.useState<Record<string, unknown> | null>(null)

  const set = (k: keyof typeof v, val: string | boolean) => setV((s) => ({ ...s, [k]: val }))

  const errs = {
    name: check(v.name, [rules.required('请输入任务名称')]),
    owner: check(v.owner, [rules.required('请输入负责人')]),
    concurrency: check(v.concurrency, [rules.range(1, 64)]),
    timeout: check(v.timeout, [rules.range(5, 600)]),
    email: check(v.email, [rules.email()]),
  }

  /** 组级校验状态 —— 组头徽标用 */
  const groupState: Record<string, boolean> = {
    base: !errs.name && !errs.owner,
    advance: !errs.concurrency && !errs.timeout,
    notify: !errs.email,
  }

  const groups = [
    {
      key: 'base',
      title: '基础信息',
      desc: '名称与负责人',
      fields: (
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="任务名称" required error={errs.name}>
            <Input value={v.name} onChange={(e) => set('name', e.target.value)} placeholder="如 日报生成" />
          </Field>
          <Field label="负责人" required error={errs.owner}>
            <Input value={v.owner} onChange={(e) => set('owner', e.target.value)} placeholder="如 张三" />
          </Field>
          <Field label="优先级" className="col-span-2">
            <AppSelect
              value={v.level}
              onValueChange={(val) => set('level', val)}
              options={[
                { value: 'p0', label: 'P0 紧急' },
                { value: 'p1', label: 'P1 高' },
                { value: 'p2', label: 'P2 中' },
              ]}
            />
          </Field>
        </div>
      ),
    },
    {
      key: 'advance',
      title: '执行参数',
      desc: '并发与超时（折叠时按默认值参与提交）',
      fields: (
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="并发数" error={errs.concurrency} hint="1 - 64">
            <Input value={v.concurrency} onChange={(e) => set('concurrency', e.target.value.replace(/[^\d]/g, ''))} />
          </Field>
          <Field label="超时（秒）" error={errs.timeout} hint="5 - 600">
            <Input value={v.timeout} onChange={(e) => set('timeout', e.target.value.replace(/[^\d]/g, ''))} />
          </Field>
        </div>
      ),
    },
    {
      key: 'notify',
      title: '通知设置',
      desc: '失败告警渠道',
      fields: (
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="告警邮箱" error={errs.email} hint="留空则不发邮件">
            <Input value={v.email} onChange={(e) => set('email', e.target.value)} placeholder="ops@company.com" />
          </Field>
          <Field label="Webhook" hint="企业微信 / 飞书机器人地址">
            <Input value={v.webhook} onChange={(e) => set('webhook', e.target.value)} placeholder="https://qyapi.weixin.qq.com/…" />
          </Field>
          <Field label="每日摘要" className="col-span-2">
            <div className="pt-1.5">
              <AppSwitch checked={v.digest} onCheckedChange={(val) => set('digest', val)} />
            </div>
          </Field>
        </div>
      ),
    },
  ]

  return (
    <DemoBlock
      id="form-collapse"
      title="任务配置（分组折叠）"
      desc="点组头折叠/展开；组头徽标实时反映该组校验状态；折叠组的值依然参与提交"
      code={`// 手风琴：open[key] 控制展开，折叠只是不渲染字段，state 不丢
{groups.map((g) => (
  <section>
    <header onClick={() => toggle(g.key)}>
      {g.title} <Badge>{groupState[g.key] ? '✓' : '!'}</Badge>
    </header>
    {open[g.key] ? g.fields : null}
  </section>
))}`}
    >
      <div className="mb-3 flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => setOpen({ base: true, advance: true, notify: true })}>
          全部展开
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen({ base: false, advance: false, notify: false })}>
          全部折叠
        </Button>
      </div>

      <div className="space-y-3">
        {groups.map((g) => (
          <section key={g.key} className="overflow-hidden rounded-lg border border-line">
            <header
              className="flex cursor-pointer select-none items-center gap-2.5 bg-canvas/40 px-4 py-3 transition-colors hover:bg-hover/50"
              onClick={() => setOpen((s) => ({ ...s, [g.key]: !s[g.key] }))}
            >
              {open[g.key] ? (
                <ChevronDown className="h-4 w-4 text-soft" />
              ) : (
                <ChevronRight className="h-4 w-4 text-soft" />
              )}
              <span className="text-[12.5px] font-semibold text-ink">{g.title}</span>
              <span className="text-[10.5px] text-soft">{g.desc}</span>
              <Badge variant={groupState[g.key] ? 'green' : 'amber'} className="ml-auto">
                {groupState[g.key] ? '校验通过' : '待完善'}
              </Badge>
            </header>
            {open[g.key] ? <div className="border-t border-line px-4 py-4">{g.fields}</div> : null}
          </section>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <p className="text-[10.5px] text-soft">折叠只是隐藏字段渲染，状态保留，提交时一并收集</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setSubmitted(null); setV({ name: '', owner: '', level: 'p1', concurrency: '8', timeout: '30', email: '', webhook: '', digest: true }) }}>
            重置
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (!groupState.base || !groupState.advance || !groupState.notify) {
                toast.error('存在待完善的分组')
                // 自动展开第一组不通过的
                if (!groupState.base) setOpen((s) => ({ ...s, base: true }))
                else if (!groupState.advance) setOpen((s) => ({ ...s, advance: true }))
                else setOpen((s) => ({ ...s, notify: true }))
                return
              }
              setSubmitted(v)
              toast.success('配置已提交')
            }}
          >
            提交
          </Button>
        </div>
      </div>

      {submitted ? (
        <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-canvas px-4 py-3 text-[11px] leading-relaxed text-muted">
          <code>{JSON.stringify(submitted, null, 2)}</code>
        </pre>
      ) : null}
    </DemoBlock>
  )
}
