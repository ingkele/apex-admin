import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowDown, ArrowUp, Plus, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { DemoBlock } from '@/components/shared/demo-block'
import { check, rules } from '@/components/shared/form-kit'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/examples/form/array')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 表单 › 表单数组 · 动态增删行</span>}
        title="表单数组"
        description="数组字段的增删改排：每行独立校验、可上下移动调整顺序，提交时收集为对象数组。"
      />
      <ArrayForm />
    </>
  )
}

interface Member {
  name: string
  role: string
  email: string
}

const ROLES = [
  { value: 'owner', label: '负责人' },
  { value: 'dev', label: '开发' },
  { value: 'viewer', label: '观察者' },
]

function ArrayForm() {
  const [members, setMembers] = React.useState<Member[]>([
    { name: '张三', role: 'owner', email: 'zhangsan@apex.ai' },
    { name: '', role: 'dev', email: '' },
  ])
  const [submitted, setSubmitted] = React.useState<Member[] | null>(null)
  const [touched, setTouched] = React.useState(false)

  const rowErr = (m: Member) => ({
    name: check(m.name, [rules.required('请输入姓名')]),
    email: check(m.email, [rules.required('请输入邮箱'), rules.email()]),
  })
  const rowsValid = members.map((m) => {
    const e = rowErr(m)
    return !e.name && !e.email
  })
  const allValid = members.length > 0 && rowsValid.every(Boolean)

  const update = (i: number, patch: Partial<Member>) =>
    setMembers((list) => list.map((m, idx) => (idx === i ? { ...m, ...patch } : m)))
  const remove = (i: number) => setMembers((list) => list.filter((_, idx) => idx !== i))
  const move = (i: number, dir: -1 | 1) =>
    setMembers((list) => {
      const j = i + dir
      if (j < 0 || j >= list.length) return list
      const next = [...list]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">
        <DemoBlock
          id="form-array"
          title="项目成员（数组字段）"
          desc="增行 / 删行 / 上下移动；每行姓名与邮箱独立校验，空数组不允许提交"
          code={`// 数组字段的核心：按索引更新，key 用稳定 id 而非索引
const update = (i, patch) =>
  setMembers((list) => list.map((m, idx) => (idx === i ? { ...m, ...patch } : m)))
// 提交载荷：members = [{ name, role, email }, …]`}
        >
          <div className="space-y-2.5">
            {members.map((m, i) => {
              const e = touched ? rowErr(m) : { name: '', email: '' }
              return (
                <div key={i} className="rounded-lg border border-line p-3">
                  <div className="flex items-start gap-2.5">
                    <div className="flex w-[150px] shrink-0 flex-col">
                      <Input
                        value={m.name}
                        onChange={(ev) => update(i, { name: ev.target.value })}
                        placeholder="姓名"
                        className={e.name ? 'border-rose-400' : undefined}
                      />
                      {e.name ? <p className="mt-1 text-[10px] text-rose-600 dark:text-rose-400">{e.name}</p> : null}
                    </div>
                    <div className="w-[120px] shrink-0">
                      <AppSelect value={m.role} onValueChange={(v) => update(i, { role: v })} options={ROLES} />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <Input
                        value={m.email}
                        onChange={(ev) => update(i, { email: ev.target.value })}
                        placeholder="邮箱"
                        className={e.email ? 'border-rose-400' : undefined}
                      />
                      {e.email ? <p className="mt-1 text-[10px] text-rose-600 dark:text-rose-400">{e.email}</p> : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1 pt-0.5">
                      <button
                        type="button"
                        aria-label={`上移 ${m.name || '第 ' + (i + 1) + ' 行'}`}
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        className="rounded p-1 text-soft transition-colors hover:bg-hover hover:text-ink disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`下移 ${m.name || '第 ' + (i + 1) + ' 行'}`}
                        onClick={() => move(i, 1)}
                        disabled={i === members.length - 1}
                        className="rounded p-1 text-soft transition-colors hover:bg-hover hover:text-ink disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`删除 ${m.name || '第 ' + (i + 1) + ' 行'}`}
                        onClick={() => remove(i)}
                        className="rounded p-1 text-soft transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
            {members.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-line py-8">
                <Users className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                <p className="text-[11px] text-soft">还没有成员，点下方「加一行」添加</p>
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-line pt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMembers((list) => [...list, { name: '', role: 'dev', email: '' }])}
            >
              <Plus className="h-3.5 w-3.5" /> 加一行
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setTouched(true)
                if (!allValid) {
                  toast.error(members.length ? '请先修正成员信息' : '至少添加一行成员')
                  return
                }
                setSubmitted(members)
                toast.success(`已提交 ${members.length} 名成员`)
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
            <CardTitle>数组载荷</CardTitle>
            <Badge variant={allValid ? 'green' : 'amber'}>{allValid ? '校验通过' : `${members.length} 行`}</Badge>
          </CardHeader>
          <pre className="overflow-x-auto px-5 py-4 text-[11px] leading-relaxed text-muted">
            <code>{submitted ? JSON.stringify(submitted, null, 2) : '// 提交后在这里查看数组载荷'}</code>
          </pre>
        </Card>
      </div>
    </div>
  )
}
