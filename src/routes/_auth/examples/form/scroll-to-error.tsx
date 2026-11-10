import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { DemoBlock } from '@/components/shared/demo-block'
import { Field, check, rules } from '@/components/shared/form-kit'
import { PageHeader } from '@/components/shared/page-header'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/form/scroll-to-error')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 表单 › 滚动到错误字段 · 长表单定位</span>}
        title="滚动到错误字段"
        description="长表单提交失败时，平滑滚动到第一个错误字段并高亮；顶部错误摘要条可点击直达对应字段。"
      />
      <ScrollForm />
    </>
  )
}

const FIELDS = [
  { key: 'name', label: '项目名称', required: true },
  { key: 'code', label: '项目编号', required: true },
  { key: 'owner', label: '负责人', required: true },
  { key: 'email', label: '联系邮箱', required: true },
  { key: 'budget', label: '预算（万元）', required: true },
  { key: 'start', label: '计划启动日', required: true },
  { key: 'desc', label: '项目描述', required: true },
] as const

function ScrollForm() {
  const [values, setValues] = React.useState<Record<string, string>>({
    name: '', code: '', owner: '', email: '', budget: '', start: '', desc: '',
  })
  const [showErrors, setShowErrors] = React.useState(false)
  const [pulseKey, setPulseKey] = React.useState('')
  const refs = React.useRef<Record<string, HTMLDivElement | null>>({})

  const errs: Record<string, string> = {
    name: check(values.name, [rules.required('请输入项目名称'), rules.minLen(2)]),
    code: check(values.code, [rules.required('请输入项目编号')]),
    owner: check(values.owner, [rules.required('请输入负责人')]),
    email: check(values.email, [rules.required('请输入联系邮箱'), rules.email()]),
    budget: check(values.budget, [rules.required('请输入预算'), rules.range(1, 99999)]),
    start: check(values.start, [rules.required('请选择计划启动日')]),
    desc: check(values.desc, [rules.required('请填写项目描述'), rules.minLen(10, '描述至少 10 个字符')]),
  }
  const errorList = FIELDS.filter((f) => errs[f.key])

  /** 滚动到指定字段并触发一圈高亮脉冲 */
  const focusField = (key: string) => {
    refs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setPulseKey(key)
    setTimeout(() => setPulseKey(''), 900)
  }

  const submit = () => {
    setShowErrors(true)
    if (errorList.length) {
      toast.error(`共 ${errorList.length} 处错误，已定位到第一处`)
      focusField(errorList[0].key)
      return
    }
    toast.success('表单校验通过，已提交')
  }

  return (
    <>
      {showErrors && errorList.length ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 dark:border-rose-500/30 dark:bg-rose-500/10">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span className="text-[11.5px] font-medium text-rose-700 dark:text-rose-300">
            共 {errorList.length} 处错误，点击直达：
          </span>
          {errorList.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => focusField(f.key)}
              className="rounded-md border border-rose-200 bg-white px-2 py-0.5 text-[10.5px] text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-500/30 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/20"
            >
              {f.label} · {errs[f.key]}
            </button>
          ))}
        </div>
      ) : null}

      <DemoBlock
        id="form-scroll"
        title="立项申请（长表单）"
        desc="故意留空直接提交，体验滚动定位 + 高亮脉冲；摘要条每一项都可点击"
        code={`const focusField = (key) => {
  refs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  setPulseKey(key)              // 触发一圈高亮脉冲
  setTimeout(() => setPulseKey(''), 900)
}
submit: setShowErrors(true) → focusField(errorList[0].key)`}
      >
        <div className="space-y-5">
          {FIELDS.map((f) => {
            const err = showErrors ? errs[f.key] : ''
            return (
              <div
                key={f.key}
                ref={(el) => { refs.current[f.key] = el }}
                className={cn(
                  'rounded-lg p-3 transition-all duration-300',
                  pulseKey === f.key && 'bg-rose-50 ring-2 ring-rose-400 dark:bg-rose-500/10',
                )}
              >
                <Field
                  label={f.label}
                  required={f.required}
                  error={err}
                  hint={f.key === 'budget' ? '1 - 99999 之间的数字' : undefined}
                  className="max-w-[420px]"
                >
                  {f.key === 'desc' ? (
                    <Textarea
                      value={values.desc}
                      onChange={(e) => setValues((v) => ({ ...v, desc: e.target.value }))}
                      placeholder="背景、目标、验收标准"
                    />
                  ) : f.key === 'start' ? (
                    <Input type="date" value={values.start} onChange={(e) => setValues((v) => ({ ...v, start: e.target.value }))} />
                  ) : (
                    <Input
                      value={values[f.key]}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      placeholder={`填写${f.label}`}
                    />
                  )}
                </Field>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex justify-end border-t border-line pt-4">
          <Button size="sm" onClick={submit}>
            提交（体验错误定位）
          </Button>
        </div>
      </DemoBlock>
    </>
  )
}
