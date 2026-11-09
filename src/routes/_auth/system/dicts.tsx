import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { BookMarked, Lock, Plus, Search, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { AppDialog } from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/page-header'
import { Can } from '@/components/shared/can'
import { useCreateDictItem, useDicts } from '@/api'
import type { DictItem } from '@/mocks/db'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/system/dicts')({
  component: DictsPage,
})

const TONE_CLASS: Record<DictItem['tone'], string> = {
  brand: 'bg-blue-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
}

function DictsPage() {
  const dicts = useDicts()
  const createItem = useCreateDictItem()
  const [keyword, setKeyword] = React.useState('')
  const [activeCode, setActiveCode] = React.useState('task_status')
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({ label: '', value: '', tone: 'slate', remark: '' })

  const types = dicts.data ?? []
  const current = types.find((t) => t.code === activeCode) ?? types[0]
  const filtered = types.filter(
    (t) => !keyword.trim() || t.name.includes(keyword) || t.code.includes(keyword.toLowerCase()),
  )

  const submit = () => {
    if (!current) return
    if (!form.label.trim() || !form.value.trim()) {
      toast.error('标签与键值均不能为空')
      return
    }
    createItem.mutate(
      { code: current.code, body: { ...form, label: form.label.trim(), value: form.value.trim() } },
      {
        onSuccess: () => {
          toast.success('字典项已新增', { description: `${current.name} · ${form.label}` })
          setOpen(false)
          setForm({ label: '', value: '', tone: 'slate', remark: '' })
        },
        onError: (e) => toast.error(e.message),
      },
    )
  }

  return (
    <div>
      <PageHeader
        title="字典管理"
        description="维护业务枚举字典（任务状态、健康度、风险等级等），前后端共用同一份取值来源。"
        actions={
          <Can permission="dict:manage">
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> 新增字典项
            </Button>
          </Can>
        }
      />

      <div className="grid grid-cols-12 items-start gap-5">
        {/* 左：字典类型 */}
        <div className="col-span-12 overflow-hidden rounded-xl border border-line bg-surface lg:col-span-4">
          <div className="border-b border-line px-4 py-3.5">
            <h2 className="text-[13px] font-semibold text-ink">字典类型</h2>
            <p className="mt-0.5 text-[10.5px] text-muted">共 {types.length} 类 · 内置类型不可删除</p>
          </div>
          <div className="border-b border-line px-3 py-2.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soft" />
              <Input
                placeholder="搜索字典名称 / 编码"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="h-8 pl-8 text-[12px]"
              />
            </div>
          </div>
          <div className="divide-y divide-line">
            {filtered.map((t) => {
              const active = t.code === current?.code
              return (
                <button
                  key={t.code}
                  type="button"
                  onClick={() => setActiveCode(t.code)}
                  className={cn(
                    'flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors',
                    active ? 'bg-brand-50/70 dark:bg-brand-500/10' : 'hover:bg-hover/60',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                      active ? 'bg-brand-600 text-white' : 'bg-canvas text-soft',
                    )}
                  >
                    <BookMarked className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className={cn('text-[12.5px] font-medium', active ? 'text-brand-700 dark:text-brand-300' : 'text-ink')}>
                        {t.name}
                      </span>
                      {t.builtin ? <Lock className="h-2.5 w-2.5 text-soft" /> : null}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[10.5px] text-soft">{t.code}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-canvas px-1.5 py-0.5 text-[10px] tabular-nums text-muted">
                    {t.items.length}
                  </span>
                </button>
              )
            })}
            {filtered.length === 0 ? (
              <div className="px-4 py-10 text-center text-[12px] text-soft">没有匹配的字典类型</div>
            ) : null}
          </div>
        </div>

        {/* 右：字典项 */}
        <div className="col-span-12 overflow-hidden rounded-xl border border-line bg-surface lg:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-line px-5 py-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[13.5px] font-semibold text-ink">{current?.name ?? '—'}</h2>
                <span className="rounded-md bg-canvas px-1.5 py-0.5 font-mono text-[10.5px] text-muted">{current?.code}</span>
                {current?.builtin ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-muted dark:bg-slate-800">内置</span>
                ) : null}
              </div>
              <p className="mt-1 text-[11px] text-muted">{current?.desc}</p>
            </div>
            <span className="text-[11px] text-soft">{current?.items.length ?? 0} 个字典项</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-canvas/60">
                  {['标签', '键值', '排序', '状态', '备注'].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11.5px] font-medium text-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(current?.items ?? []).map((it) => (
                  <tr key={it.value} className="border-b border-line last:border-0 transition-colors hover:bg-hover/60">
                    <td className="td-py px-4">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', TONE_CLASS[it.tone])}>
                        <Tag className="h-2.5 w-2.5" />
                        {it.label}
                      </span>
                    </td>
                    <td className="td-py px-4 font-mono text-[11.5px] text-muted">{it.value}</td>
                    <td className="td-py px-4 text-[12px] tabular-nums text-muted">{it.sort}</td>
                    <td className="td-py px-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 text-[11.5px]',
                          it.status === 'active' ? 'text-emerald-600' : 'text-soft',
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', it.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400')} />
                        {it.status === 'active' ? '启用' : '停用'}
                      </span>
                    </td>
                    <td className="td-py px-4 text-[11.5px] text-soft">{it.remark ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-line px-5 py-3 text-[11px] text-soft">
            键值一经使用不建议修改（历史数据会失去映射）；新增取值请保持语义清晰、全小写
          </div>
        </div>
      </div>

      <AppDialog
        open={open}
        onOpenChange={setOpen}
        title={`新增字典项 · ${current?.name ?? ''}`}
        description="键值保存后作为前后端枚举值使用，建议使用小写下划线风格。"
        width="w-[520px]"
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <Label>标签 <span className="text-rose-500">*</span></Label>
            <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="例如：待审核" />
          </div>
          <div>
            <Label>键值 <span className="text-rose-500">*</span></Label>
            <Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="pending_review" className="font-mono" />
          </div>
          <div>
            <Label>标签色</Label>
            <AppSelect
              value={form.tone}
              onValueChange={(v) => setForm({ ...form, tone: v })}
              options={[
                { value: 'slate', label: '灰（中性）' },
                { value: 'brand', label: '蓝（进行中）' },
                { value: 'green', label: '绿（成功）' },
                { value: 'amber', label: '琥珀（告警）' },
                { value: 'rose', label: '红（失败）' },
              ]}
            />
          </div>
          <div>
            <Label>备注</Label>
            <Input value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} placeholder="可选" />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>取消</Button>
          <Button size="sm" disabled={createItem.isPending} onClick={submit}>确认新增</Button>
        </div>
      </AppDialog>
    </div>
  )
}
