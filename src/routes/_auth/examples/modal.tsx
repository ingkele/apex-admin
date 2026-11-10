import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { AppDialog } from '@/components/ui/dialog'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Radio, Server, TriangleAlert } from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/modal')({
  component: Page,
})

function Page() {
  const [basic, setBasic] = React.useState(false)
  const [form, setForm] = React.useState(false)
  const [danger, setDanger] = React.useState(false)
  const [gentle, setGentle] = React.useState(false)
  const [wide, setWide] = React.useState(false)

  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 弹窗 · 对话框的四种典型用法</span>}
        title="弹窗"
        description="对话框统一居中带遮罩；表单类弹窗窗内提交，危险操作一律走二次确认。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6 space-y-4">
          <DemoBlock
            id="modal-basic"
            title="基础弹窗"
            desc="标题 + 说明 + 内容 + 底部操作；点遮罩、右上角 × 或 Esc 关闭"
            code={`<AppDialog open={open} onOpenChange={setOpen}
  title="任务详情" description="最近一次执行结果">
  …
</AppDialog>`}
          >
            <Button size="sm" variant="outline" onClick={() => setBasic(true)}>
              打开基础弹窗
            </Button>
            <AppDialog
              open={basic}
              onOpenChange={setBasic}
              title="任务详情"
              description="最近一次执行结果（2026-11-10 10:24）"
            >
              <div className="mt-3 space-y-2 rounded-lg border border-line bg-canvas/40 px-4 py-3 text-[12px] leading-relaxed text-muted">
                <div className="flex justify-between"><span>任务名称</span><span className="text-ink">知识库增量同步</span></div>
                <div className="flex justify-between"><span>执行耗时</span><span className="text-ink">12.4s</span></div>
                <div className="flex justify-between"><span>结果</span><span className="text-emerald-600">成功 · 新增 38 条</span></div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setBasic(false)}>关闭</Button>
                <Button size="sm" onClick={() => { setBasic(false); toast.success('已重新下发') }}>重新执行</Button>
              </div>
            </AppDialog>
          </DemoBlock>

          <DemoBlock
            id="modal-form"
            title="表单弹窗"
            desc="窗内表单校验提交，成功后自动关闭并轻提示"
            code={`<AppDialog open={form} onOpenChange={setForm} title="新建服务">
  <Input placeholder="服务名称" />
  <Button onClick={submit}>提交</Button>
</AppDialog>`}
          >
            <Button size="sm" variant="outline" onClick={() => setForm(true)}>
              新建服务
            </Button>
            <AppDialog
              open={form}
              onOpenChange={setForm}
              title="新建服务"
              description="注册后自动接入健康检查探针。"
            >
              <div className="mt-3 space-y-3">
                <div>
                  <Label>服务名称</Label>
                  <Input placeholder="例如：vector-index-svc" />
                </div>
                <div>
                  <Label>负责人</Label>
                  <Input placeholder="例如：张伟" />
                </div>
                <div>
                  <Label>备注</Label>
                  <Textarea placeholder="部署区域、依赖组件等" className="min-h-[64px]" />
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setForm(false)}>取消</Button>
                <Button size="sm" onClick={() => { setForm(false); toast.success('服务已创建') }}>提交</Button>
              </div>
            </AppDialog>
          </DemoBlock>
        </div>

        <div className="col-span-6 space-y-4">
          <DemoBlock
            id="modal-confirm"
            title="二次确认（双语气）"
            desc="danger 带警示图标的危险语气；danger=false 为普通确认语气"
            code={`<ConfirmDialog open={c} onOpenChange={setC}
  title="确认重启服务？" danger confirmText="确认重启"
  onConfirm={…} />

<ConfirmDialog … danger={false} confirmText="保存草稿" />`}
          >
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="danger" onClick={() => setDanger(true)}>
                <TriangleAlert className="h-3.5 w-3.5" /> 危险操作
              </Button>
              <Button size="sm" variant="outline" onClick={() => setGentle(true)}>
                普通确认
              </Button>
            </div>
            <ConfirmDialog
              open={danger}
              onOpenChange={setDanger}
              title="确认重启 vector-index-svc？"
              description="重启期间该服务暂不可用，进行中的检索请求会失败，预计 30 秒恢复。"
              confirmText="确认重启"
              onConfirm={() => toast.success('重启指令已下发')}
            />
            <ConfirmDialog
              open={gentle}
              onOpenChange={setGentle}
              title="保存当前草稿？"
              description="草稿仅自己可见，可随时继续编辑后再发布。"
              confirmText="保存草稿"
              danger={false}
              onConfirm={() => toast.success('草稿已保存')}
            />
          </DemoBlock>

          <DemoBlock
            id="modal-width"
            title="宽度可控"
            desc="width 属性控制弹窗宽度，内容超出时窗内滚动"
            code={`<AppDialog width="w-[720px]" …>宽弹窗</AppDialog>`}
          >
            <Button size="sm" variant="outline" onClick={() => setWide(true)}>
              打开宽弹窗（720px）
            </Button>
            <AppDialog
              open={wide}
              onOpenChange={setWide}
              width="w-[720px]"
              title="服务实例对比"
              description="宽弹窗适合放表格、对比视图等横向内容。"
            >
              <div className="mt-3 grid grid-cols-3 gap-3">
                {[
                  { zone: '华东 2', icon: Server, ok: 4, total: 4 },
                  { zone: '华北 1', icon: Server, ok: 3, total: 4 },
                  { zone: '华南 1', icon: Radio, ok: 2, total: 2 },
                ].map((z) => (
                  <div key={z.zone} className="rounded-lg border border-line px-3.5 py-3">
                    <div className="flex items-center gap-2 text-[12px] font-medium text-ink">
                      <z.icon className="h-3.5 w-3.5 text-brand-500" /> {z.zone}
                    </div>
                    <div className="mt-1.5 text-[11px] text-muted">健康实例 {z.ok}/{z.total}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-end">
                <Button size="sm" onClick={() => setWide(false)}>知道了</Button>
              </div>
            </AppDialog>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
