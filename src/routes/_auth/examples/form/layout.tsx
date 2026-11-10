import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { DemoBlock } from '@/components/shared/demo-block'
import { Field } from '@/components/shared/form-kit'
import { PageHeader } from '@/components/shared/page-header'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/form/layout')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 表单 › 自定义布局 · 栅格 / 分组 / 行内</span>}
        title="自定义布局"
        description="同一份表单数据换三种排版：多列栅格、分组标题区块、行内紧凑表单，布局与字段解耦。"
      />
      <div className="space-y-4">
        <GridDemo />
        <GroupDemo />
        <InlineDemo />
      </div>
    </>
  )
}

/** ① 栅格布局：列数可切换 */
function GridDemo() {
  const [cols, setCols] = React.useState(2)
  const [env, setEnv] = React.useState('prod')
  return (
    <DemoBlock
      id="form-layout-grid"
      title="栅格布局"
      desc="字段等宽排布，列数在 2 / 3 之间切换；文本域类字段跨整行"
      code={`<div className={cols === 2 ? 'grid grid-cols-2 gap-x-4' : 'grid grid-cols-3 gap-x-4'}>
  {fields.map((f) => <Field key={f.key} label={f.label}>…</Field>)}
</div>`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[11px] text-soft">列数</span>
        {[2, 3].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setCols(n)}
            className={cn(
              'rounded-md px-3 py-1 text-[11px] transition-colors',
              cols === n ? 'bg-brand-600 text-white' : 'border border-line text-muted hover:bg-hover',
            )}
          >
            {n} 列
          </button>
        ))}
      </div>
      <div className={cols === 2 ? 'grid grid-cols-2 gap-x-4' : 'grid grid-cols-3 gap-x-4'}>
        <Field label="应用名称" hint="展示用名称">
          <Input placeholder="如 订单中心" />
        </Field>
        <Field label="负责人">
          <Input placeholder="如 张三" />
        </Field>
        <Field label="环境">
          <AppSelect
            value={env}
            onValueChange={setEnv}
            options={[
              { value: 'prod', label: '生产' },
              { value: 'staging', label: '预发' },
            ]}
          />
        </Field>
        <Field label="仓库地址" hint="git 仓库 URL" className="col-span-full">
          <Input placeholder="https://git.company.com/…" />
        </Field>
      </div>
    </DemoBlock>
  )
}

/** ② 分组标题 + 跨列字段 */
function GroupDemo() {
  return (
    <DemoBlock
      id="form-layout-group"
      title="分组布局"
      desc="用分组标题切区块，组内多列、组间留白，长表单可读性更好"
      code={`<section>
  <h3>基础信息</h3>
  <div className="grid grid-cols-3 gap-x-4">…</div>
</section>
<section>
  <h3>部署配置</h3>…
</section>`}
    >
      {[
        { title: '基础信息', fields: ['应用名称', '负责人', '所属团队'] },
        { title: '部署配置', fields: ['部署地域', '实例规格', '运行端口'] },
      ].map((group) => (
        <section key={group.title} className="mb-4 last:mb-0">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-[12px] font-semibold text-ink">{group.title}</h3>
            <div className="h-px flex-1 bg-line" />
          </div>
          <div className="grid grid-cols-3 gap-x-4">
            {group.fields.map((label) => (
              <Field key={label} label={label}>
                <Input placeholder={`填写${label}`} />
              </Field>
            ))}
          </div>
        </section>
      ))}
    </DemoBlock>
  )
}

/** ③ 行内表单 */
function InlineDemo() {
  const [kw, setKw] = React.useState('')
  const [status, setStatus] = React.useState('all')
  return (
    <DemoBlock
      id="form-layout-inline"
      title="行内表单"
      desc="筛选条/工具条场景：字段横排一行、标签左置，回车即查"
      code={`<form className="flex flex-wrap items-center gap-2">
  <label>关键字</label><Input … />
  <label>状态</label><AppSelect … />
  <Button>查询</Button>
</form>`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-soft">关键字</span>
        <div className="w-[200px]">
          <Input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="名称 / ID" onKeyDown={(e) => e.key === 'Enter' && toast.success(`查询「${kw || '全部'}」`)} />
        </div>
        <span className="text-[11px] text-soft">状态</span>
        <div className="w-[140px]">
          <AppSelect
            value={status}
            onValueChange={setStatus}
            options={[
              { value: 'all', label: '全部' },
              { value: 'running', label: '运行中' },
              { value: 'success', label: '已完成' },
            ]}
          />
        </div>
        <Button size="sm" onClick={() => toast.success(`查询「${kw || '全部'}」`)}>
          查询
        </Button>
        <Button size="sm" variant="outline" onClick={() => { setKw(''); setStatus('all') }}>
          重置
        </Button>
      </div>
    </DemoBlock>
  )
}
