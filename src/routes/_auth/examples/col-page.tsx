import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppSwitch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { ChevronRight, Columns2, Rows3, Search, User } from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/col-page')({
  component: Page,
})

interface Member {
  id: number
  name: string
  role: string
  dept: string
  email: string
  phone: string
  status: '启用' | '停用'
  joined: string
}

const MEMBERS: Member[] = [
  { id: 1, name: '张伟', role: '运维操作员', dept: '平台工程部', email: 'zhangwei@apex.internal', phone: '138****2210', status: '启用', joined: '2024-03-12' },
  { id: 2, name: '李娜', role: '只读访客', dept: '数据智能部', email: 'lina@apex.internal', phone: '139****8802', status: '启用', joined: '2024-07-01' },
  { id: 3, name: '王强', role: '超级管理员', dept: '平台工程部', email: 'wangqiang@apex.internal', phone: '137****5521', status: '启用', joined: '2023-11-20' },
  { id: 4, name: '陈静', role: '运维操作员', dept: '安全合规部', email: 'chenjing@apex.internal', phone: '135****9903', status: '停用', joined: '2025-01-08' },
  { id: 5, name: '刘洋', role: '只读访客', dept: '数据智能部', email: 'liuyang@apex.internal', phone: '136****4417', status: '启用', joined: '2025-05-30' },
]

function Page() {
  const [selected, setSelected] = React.useState<Member>(MEMBERS[0])
  const [keyword, setKeyword] = React.useState('')
  const [stacked, setStacked] = React.useState(false)

  const filtered = MEMBERS.filter(
    (m) => m.name.includes(keyword) || m.dept.includes(keyword) || m.email.includes(keyword),
  )

  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 双列布局 · 左列选择 + 右侧详情（ColPage）</span>}
        badge={
          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold leading-none text-white">
            Alpha
          </span>
        }
        title="双列布局"
        description="左侧列表选择、右侧详情联动的主从布局；窄屏可切换为上下堆叠，vben 对应 ColPage 组件（Alpha 阶段）。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <DemoBlock
            id="col-page-master"
            title="主从双列"
            desc="左列搜索 + 列表选择，右侧详情随选中项联动；右上角可切换双列 / 堆叠"
            code={`<div className="flex">
  <aside className="w-[280px]">列表（搜索 + 选择）</aside>
  <section className="flex-1">详情（联动）</section>
</div>
// 窄屏：flex-col 堆叠，列表在上详情在下`}
          >
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-[11.5px] text-muted">
                {stacked ? <Rows3 className="h-3.5 w-3.5" /> : <Columns2 className="h-3.5 w-3.5" />}
                布局：{stacked ? '上下堆叠' : '左右双列'}
                <AppSwitch checked={stacked} onCheckedChange={setStacked} />
              </div>
              <span className="text-[10.5px] text-soft">切换模拟窄屏（≤768px）下的堆叠形态</span>
            </div>

            <div
              className={cn(
                'overflow-hidden rounded-lg border border-line bg-surface',
                stacked ? 'flex flex-col' : 'flex',
              )}
            >
              {/* 左列：列表 */}
              <div
                className={cn(
                  'flex flex-col border-line',
                  stacked ? 'h-[220px] w-full border-b' : 'w-[280px] shrink-0 border-r',
                )}
              >
                <div className="border-b border-line p-2.5">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soft" />
                    <Input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="搜索姓名 / 部门 / 邮箱"
                      className="h-8 pl-8 text-[11.5px]"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div className="px-3 py-6 text-center text-[11px] text-soft">无匹配成员</div>
                  ) : (
                    filtered.map((m) => {
                      const active = m.id === selected.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelected(m)}
                          className={cn(
                            'flex w-full items-center gap-2.5 border-b border-line/60 px-3.5 py-2.5 text-left transition-colors',
                            active
                              ? 'bg-brand-50 dark:bg-brand-500/10'
                              : 'hover:bg-hover',
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white',
                              active ? 'bg-brand-600' : 'bg-slate-400 dark:bg-slate-600',
                            )}
                          >
                            {m.name[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={cn('truncate text-[12px] font-medium', active ? 'text-brand-700 dark:text-brand-300' : 'text-ink')}>
                              {m.name}
                            </div>
                            <div className="truncate text-[10px] text-soft">{m.dept} · {m.role}</div>
                          </div>
                          <ChevronRight className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-brand-500' : 'text-soft')} />
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              {/* 右侧：详情 */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between border-b border-line px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[13px] font-semibold text-white">
                      {selected.name[0]}
                    </div>
                    <div>
                      <div className="text-[13.5px] font-semibold text-ink">{selected.name}</div>
                      <div className="text-[10.5px] text-soft">成员 ID #{selected.id}</div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-medium',
                      selected.status === '启用'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                    )}
                  >
                    {selected.status}
                  </span>
                </div>
                <div className="flex-1 px-5 py-4">
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[12px]">
                    {[
                      ['角色', selected.role],
                      ['部门', selected.dept],
                      ['邮箱', selected.email],
                      ['手机号', selected.phone],
                      ['入职日期', selected.joined],
                      ['最近登录', '2026-11-09 18:42'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-[10.5px] text-soft">{k}</dt>
                        <dd className="mt-0.5 text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline"><User className="h-3.5 w-3.5" /> 编辑资料</Button>
                    <Button size="sm" variant="ghost">重置密码</Button>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
              双列布局适合「列表 → 详情」高频切换的管理场景，省去整页跳转；
              窄屏堆叠后列表在上、详情在下，选择行为不变。vben 的 ColPage 组件目前为
              <b className="text-ink"> Alpha 阶段</b>，API 可能调整，这里演示等价交互形态。
            </p>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
