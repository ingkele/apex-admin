import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input, Textarea } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { AppSwitch } from '@/components/ui/switch'
import { DemoBlock } from '@/components/shared/demo-block'
import { Field, check, rules } from '@/components/shared/form-kit'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/examples/form/basic')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 表单 › 基础表单 · 三段式字段骨架</span>}
        title="基础表单"
        description="最常用的表单骨架：标签 / 控件 / 提示行三段式，必填校验即时反馈，右侧实时预览提交载荷。"
      />
      <BasicForm />
    </>
  )
}

const ROLES = [
  { value: 'admin', label: '管理员' },
  { value: 'dev', label: '开发者' },
  { value: 'viewer', label: '访客' },
]

function BasicForm() {
  const [form, setForm] = React.useState({
    username: '',
    name: '',
    email: '',
    dept: 'rd',
    role: 'dev',
    notify: ['email'] as string[],
    enabled: true,
    remark: '',
  })
  const [submitted, setSubmitted] = React.useState<Record<string, unknown> | null>(null)

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))
  const toggleNotify = (k: string) =>
    setForm((f) => ({
      ...f,
      notify: f.notify.includes(k) ? f.notify.filter((x) => x !== k) : [...f.notify, k],
    }))

  const errs = {
    username: check(form.username, [rules.required('请输入用户名'), rules.minLen(3)]),
    name: check(form.name, [rules.required('请输入姓名')]),
    email: check(form.email, [rules.required('请输入邮箱'), rules.email()]),
    remark: check(form.remark, [rules.maxLen(120)]),
  }
  const valid = !errs.username && !errs.name && !errs.email && !errs.remark

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">
        <DemoBlock
          id="form-basic"
          title="开通账号"
          desc="带必填校验的常见字段组合，错误信息贴在对应字段下方"
          code={`<Field label="用户名" required error={errs.username} hint="3-16 位字母数字">
  <Input value={form.username} onChange={(e) => set('username', e.target.value)} />
</Field>
// 校验：check(form.username, [rules.required('请输入用户名'), rules.minLen(3)])`}
        >
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="用户名" required error={errs.username} hint="3-16 位字母数字">
              <Input
                value={form.username}
                onChange={(e) => set('username', e.target.value)}
                placeholder="如 zhangsan"
              />
            </Field>
            <Field label="姓名" required error={errs.name} hint="用于工单署名">
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="如 张三" />
            </Field>
            <Field label="邮箱" required error={errs.email} hint="接收通知与找回密码">
              <Input
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="name@company.com"
              />
            </Field>
            <Field label="部门" hint="决定可见的数据范围">
              <AppSelect
                value={form.dept}
                onValueChange={(v) => set('dept', v)}
                options={[
                  { value: 'rd', label: '研发部' },
                  { value: 'ops', label: '运维部' },
                  { value: 'fin', label: '财务部' },
                ]}
              />
            </Field>
            <Field label="角色" hint="单选，影响默认权限集">
              <div className="flex gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => set('role', r.value)}
                    className={
                      form.role === r.value
                        ? 'rounded-md bg-brand-600 px-3 py-1.5 text-[11.5px] text-white'
                        : 'rounded-md border border-line px-3 py-1.5 text-[11.5px] text-muted hover:bg-hover'
                    }
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="通知方式" hint="可多选，至少保留一种">
              <div className="flex flex-wrap gap-4 pt-1.5">
                {[
                  { k: 'email', label: '邮件' },
                  { k: 'sms', label: '短信' },
                  { k: 'site', label: '站内信' },
                ].map((n) => (
                  <Checkbox
                    key={n.k}
                    checked={form.notify.includes(n.k)}
                    onCheckedChange={() => toggleNotify(n.k)}
                    label={n.label}
                  />
                ))}
              </div>
            </Field>
            <Field label="启用账号" hint="关闭后账号不可登录">
              <div className="pt-1.5">
                <AppSwitch checked={form.enabled} onCheckedChange={(v) => set('enabled', v)} />
              </div>
            </Field>
            <Field label="备注" error={errs.remark} hint={`已输入 ${form.remark.length} / 120 字`} className="col-span-2">
              <Textarea
                value={form.remark}
                onChange={(e) => set('remark', e.target.value)}
                placeholder="补充说明账号用途、审批人…"
              />
            </Field>
          </div>

          <div className="mt-2 flex items-center justify-end gap-2 border-t border-line pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setForm({ username: '', name: '', email: '', dept: 'rd', role: 'dev', notify: ['email'], enabled: true, remark: '' })
                setSubmitted(null)
              }}
            >
              重置
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (!valid) {
                  toast.error('请先修正表单中的错误')
                  return
                }
                setSubmitted(form)
                toast.success('账号开通申请已提交')
              }}
            >
              提交
            </Button>
          </div>
        </DemoBlock>
      </div>

      <div className="col-span-4">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>提交载荷</CardTitle>
            <Badge variant={submitted ? 'green' : 'gray'}>{submitted ? '已提交' : '待提交'}</Badge>
          </CardHeader>
          <pre className="overflow-x-auto px-5 py-4 text-[11px] leading-relaxed text-muted">
            <code>{submitted ? JSON.stringify(submitted, null, 2) : '// 点击「提交」后在这里查看载荷'}</code>
          </pre>
        </Card>
      </div>
    </div>
  )
}
