import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { AppSwitch } from '@/components/ui/switch'
import { DemoBlock } from '@/components/shared/demo-block'
import { Field, check, rules } from '@/components/shared/form-kit'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/examples/form/dynamic')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 表单 › 动态表单 · 配置驱动渲染</span>}
        title="动态表单"
        description="字段由配置数组驱动：切换模板整组字段跟着换，还能运行时添加自定义字段，提交时统一收集。"
      />
      <DynamicForm />
    </>
  )
}

type FieldType = 'text' | 'select' | 'switch' | 'textarea'
interface FieldConf {
  key: string
  label: string
  type: FieldType
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
}

const TEMPLATES: Record<string, { name: string; fields: FieldConf[] }> = {
  account: {
    name: '开通账号',
    fields: [
      { key: 'username', label: '用户名', type: 'text', required: true, placeholder: '3-16 位字母数字' },
      { key: 'email', label: '邮箱', type: 'text', required: true, placeholder: 'name@company.com' },
      {
        key: 'role',
        label: '角色',
        type: 'select',
        options: [
          { value: 'admin', label: '管理员' },
          { value: 'dev', label: '开发者' },
          { value: 'viewer', label: '访客' },
        ],
      },
      { key: 'notify', label: '邮件通知', type: 'switch' },
    ],
  },
  server: {
    name: '服务器申请',
    fields: [
      { key: 'hostname', label: '主机名', type: 'text', required: true, placeholder: '如 srv-bj-01' },
      {
        key: 'spec',
        label: '规格',
        type: 'select',
        options: [
          { value: 's2', label: '2C4G' },
          { value: 'm4', label: '4C8G' },
          { value: 'l8', label: '8C16G' },
        ],
      },
      {
        key: 'region',
        label: '地域',
        type: 'select',
        options: [
          { value: 'bj', label: '华北 1' },
          { value: 'sh', label: '华东 2' },
          { value: 'gz', label: '华南 1' },
        ],
      },
      { key: 'purpose', label: '用途说明', type: 'textarea', required: true, placeholder: '部署什么服务、访问量预估' },
    ],
  },
  ticket: {
    name: '提交工单',
    fields: [
      { key: 'title', label: '工单标题', type: 'text', required: true, placeholder: '一句话描述问题' },
      {
        key: 'level',
        label: '优先级',
        type: 'select',
        options: [
          { value: 'p0', label: 'P0 紧急' },
          { value: 'p1', label: 'P1 高' },
          { value: 'p2', label: 'P2 中' },
        ],
      },
      { key: 'detail', label: '问题描述', type: 'textarea', required: true, placeholder: '复现步骤、期望结果' },
      { key: 'urgent', label: '电话催办', type: 'switch' },
    ],
  },
}

function DynamicForm() {
  const [tpl, setTpl] = React.useState('account')
  const [values, setValues] = React.useState<Record<string, string | boolean>>({})
  const [custom, setCustom] = React.useState<FieldConf[]>([
    { key: 'custom_1', label: '审批人', type: 'text', placeholder: '自定义字段示例' },
  ])
  const [submitted, setSubmitted] = React.useState<Record<string, unknown> | null>(null)

  // 切模板：清空已填值，保留自定义字段
  const switchTpl = (k: string) => {
    setTpl(k)
    setValues({})
    setSubmitted(null)
  }

  const confs = [...TEMPLATES[tpl].fields, ...custom]

  const errs: Record<string, string> = {}
  for (const c of confs) {
    if (c.required) errs[c.key] = check(String(values[c.key] ?? ''), [rules.required(`请填写${c.label}`)])
    if (c.type === 'text' && c.key === 'email')
      errs[c.key] = check(String(values[c.key] ?? ''), [rules.email()]) || errs[c.key]
  }
  const valid = Object.values(errs).every((e) => !e)

  const setVal = (k: string, v: string | boolean) => setValues((s) => ({ ...s, [k]: v }))

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">
        <DemoBlock
          id="form-dynamic"
          title="配置驱动的表单"
          desc="切换模板整组字段跟着换；「加字段」可运行时扩展，配置即渲染"
          code={`// 一份配置就是一张表单：
{ key: 'hostname', label: '主机名', type: 'text', required: true }
// 渲染：confs.map((c) => <Field label={c.label}>…按 c.type 分发控件…</Field>)
// 收集：values[c.key] 统一进一个对象`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-soft">表单模板</span>
            <div className="w-[180px]">
              <AppSelect value={tpl} onValueChange={switchTpl} options={Object.entries(TEMPLATES).map(([k, v]) => ({ value: k, label: v.name }))} />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setCustom((c) => [
                  ...c,
                  { key: `custom_${c.length + 1}`, label: `自定义字段 ${c.length + 1}`, type: 'text', placeholder: '运行时添加' },
                ])
              }
            >
              <Plus className="h-3.5 w-3.5" /> 加字段
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-4">
            {confs.map((c) => (
              <Field
                key={c.key}
                label={c.label}
                required={c.required}
                error={errs[c.key]}
                hint={c.type === 'switch' ? '布尔字段' : undefined}
                className={c.type === 'textarea' ? 'col-span-2' : undefined}
              >
                {c.type === 'text' ? (
                  <Input
                    value={String(values[c.key] ?? '')}
                    onChange={(e) => setVal(c.key, e.target.value)}
                    placeholder={c.placeholder}
                  />
                ) : c.type === 'select' ? (
                  <AppSelect
                    value={String(values[c.key] ?? c.options?.[0]?.value ?? '')}
                    onValueChange={(v) => setVal(c.key, v)}
                    options={c.options ?? []}
                  />
                ) : c.type === 'textarea' ? (
                  <Textarea
                    value={String(values[c.key] ?? '')}
                    onChange={(e) => setVal(c.key, e.target.value)}
                    placeholder={c.placeholder}
                  />
                ) : (
                  <div className="pt-1.5">
                    <AppSwitch checked={Boolean(values[c.key])} onCheckedChange={(v) => setVal(c.key, v)} />
                  </div>
                )}
              </Field>
            ))}
          </div>

          {custom.length ? (
            <div className="mt-2 rounded-lg border border-dashed border-line p-3">
              <p className="mb-2 text-[10.5px] text-soft">自定义字段（可删除，删除后表单同步移除）</p>
              <div className="flex flex-wrap gap-2">
                {custom.map((c, i) => (
                  <div key={c.key} className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-[11px]">
                    <span className="text-ink">{c.label}</span>
                    <button
                      type="button"
                      aria-label={`删除字段 ${c.label}`}
                      onClick={() => setCustom((list) => list.filter((x) => x.key !== c.key))}
                      className="text-soft transition-colors hover:text-rose-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex justify-end gap-2 border-t border-line pt-4">
            <Button size="sm" variant="outline" onClick={() => { setValues({}); setSubmitted(null) }}>
              清空
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (!valid) {
                  toast.error('请先修正表单中的错误')
                  return
                }
                setSubmitted({ template: TEMPLATES[tpl].name, ...values })
                toast.success('动态表单已提交')
              }}
            >
              提交
            </Button>
          </div>
        </DemoBlock>
      </div>

      <div className="col-span-4">
        <DemoBlock id="form-dynamic-payload" title="提交载荷" desc="模板名 + 字段值统一收集" code="">
          <pre className="overflow-x-auto text-[11px] leading-relaxed text-muted">
            <code>{submitted ? JSON.stringify(submitted, null, 2) : '// 提交后查看载荷'}</code>
          </pre>
        </DemoBlock>
      </div>
    </div>
  )
}
