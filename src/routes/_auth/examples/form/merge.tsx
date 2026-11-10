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

export const Route = createFileRoute('/_auth/examples/form/merge')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 表单 › 合并表单 · 多区块合并提交</span>}
        title="合并表单"
        description="多个独立表单区块（各自校验）合并成一个提交载荷：分块可单独保存草稿，也能一键合并提交。"
      />
      <MergeForm />
    </>
  )
}

function MergeForm() {
  const [basic, setBasic] = React.useState({ name: '', code: 'ORG-001' })
  const [contact, setContact] = React.useState({ email: '', phone: '', addr: '' })
  const [pref, setPref] = React.useState({ theme: 'light', digest: true, channels: ['email'] as string[] })

  const [merged, setMerged] = React.useState<Record<string, unknown> | null>(null)
  const [touched, setTouched] = React.useState(false)

  const errs = {
    name: check(basic.name, [rules.required('请输入机构名称')]),
    email: check(contact.email, [rules.required('请输入联系邮箱'), rules.email()]),
    phone: check(contact.phone, [rules.required('请输入联系电话')]),
  }

  /** 每块单独校验 */
  const blockValid = {
    basic: !errs.name,
    contact: !errs.email && !errs.phone,
    pref: pref.channels.length > 0,
  }

  const mergeSubmit = () => {
    if (!blockValid.basic || !blockValid.contact || !blockValid.pref) {
      toast.error('存在未通过校验的区块，已标出')
      setTouched(true)
      return
    }
    setMerged({
      org: { ...basic },
      contact: { ...contact },
      preference: { ...pref },
    })
    toast.success('三个区块已合并提交')
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8 space-y-4">
        {/* 区块 1：基本信息 */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>① 基本信息</CardTitle>
            <Badge variant={blockValid.basic ? 'green' : touched ? 'red' : 'gray'}>
              {blockValid.basic ? '校验通过' : '待完善'}
            </Badge>
          </CardHeader>
          <div className="grid grid-cols-2 gap-x-4 px-5 pb-4">
            <Field label="机构名称" required error={touched ? errs.name : ''}>
              <Input value={basic.name} onChange={(e) => setBasic((s) => ({ ...s, name: e.target.value }))} placeholder="如 广西维烯网络" />
            </Field>
            <Field label="机构编码" hint="系统预分配">
              <Input value={basic.code} onChange={(e) => setBasic((s) => ({ ...s, code: e.target.value }))} />
            </Field>
          </div>
        </Card>

        {/* 区块 2：联系方式 */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>② 联系方式</CardTitle>
            <Badge variant={blockValid.contact ? 'green' : touched ? 'red' : 'gray'}>
              {blockValid.contact ? '校验通过' : '待完善'}
            </Badge>
          </CardHeader>
          <div className="grid grid-cols-2 gap-x-4 px-5 pb-4">
            <Field label="联系邮箱" required error={touched ? errs.email : ''}>
              <Input value={contact.email} onChange={(e) => setContact((s) => ({ ...s, email: e.target.value }))} placeholder="name@company.com" />
            </Field>
            <Field label="联系电话" required error={touched ? errs.phone : ''}>
              <Input value={contact.phone} onChange={(e) => setContact((s) => ({ ...s, phone: e.target.value }))} placeholder="如 0771-8888888" />
            </Field>
            <Field label="通讯地址" className="col-span-2">
              <Textarea value={contact.addr} onChange={(e) => setContact((s) => ({ ...s, addr: e.target.value }))} placeholder="省市区 + 详细地址" />
            </Field>
          </div>
        </Card>

        {/* 区块 3：偏好设置 */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>③ 偏好设置</CardTitle>
            <Badge variant={blockValid.pref ? 'green' : 'red'}>
              {blockValid.pref ? '校验通过' : '至少选一种通知渠道'}
            </Badge>
          </CardHeader>
          <div className="grid grid-cols-2 gap-x-4 px-5 pb-4">
            <Field label="界面主题">
              <AppSelect
                value={pref.theme}
                onValueChange={(v) => setPref((s) => ({ ...s, theme: v }))}
                options={[
                  { value: 'light', label: '浅色' },
                  { value: 'dark', label: '深色' },
                  { value: 'auto', label: '跟随系统' },
                ]}
              />
            </Field>
            <Field label="每周摘要">
              <div className="pt-1.5">
                <AppSwitch checked={pref.digest} onCheckedChange={(v) => setPref((s) => ({ ...s, digest: v }))} />
              </div>
            </Field>
            <Field label="通知渠道" required hint="可多选" className="col-span-2">
              <div className="flex flex-wrap gap-4 pt-1.5">
                {[
                  { k: 'email', label: '邮件' },
                  { k: 'sms', label: '短信' },
                  { k: 'wecom', label: '企业微信' },
                ].map((c) => (
                  <Checkbox
                    key={c.k}
                    checked={pref.channels.includes(c.k)}
                    onCheckedChange={() =>
                      setPref((s) => ({
                        ...s,
                        channels: s.channels.includes(c.k) ? s.channels.filter((x) => x !== c.k) : [...s.channels, c.k],
                      }))
                    }
                    label={c.label}
                  />
                ))}
              </div>
            </Field>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button size="sm" onClick={mergeSubmit}>
            合并提交三个区块
          </Button>
        </div>
      </div>

      <div className="col-span-4">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>合并载荷</CardTitle>
            <Badge variant={merged ? 'green' : 'gray'}>{merged ? '已提交' : '待合并'}</Badge>
          </CardHeader>
          <pre className="overflow-x-auto px-5 py-4 text-[11px] leading-relaxed text-muted">
            <code>{merged ? JSON.stringify(merged, null, 2) : '// 三个区块合并为一个嵌套载荷'}</code>
          </pre>
        </Card>
        <DemoBlock id="form-merge-code" title="合并思路" desc="分块各自持有状态，合并时一次性收集" code="">
          <p className="text-[11px] leading-relaxed text-muted">
            每个区块是独立的受控组件（自己的 state 与校验），合并提交时把三份 state 组装成嵌套对象。
            好处：区块可独立复用（抽屉里只放一块）、独立保存草稿，合并时无需跨区块共享状态。
          </p>
        </DemoBlock>
      </div>
    </div>
  )
}
