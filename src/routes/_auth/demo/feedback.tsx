import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { AppDialog } from '@/components/ui/dialog'
import { Input, Label } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { cn } from '@/lib/utils'
import { CircleAlert, Info, ShieldCheck, TriangleAlert } from 'lucide-react'

export const Route = createFileRoute('/_auth/demo/feedback')({
  component: Page,
})

const ALERTS = [
  {
    tone: 'info',
    icon: Info,
    title: '调度服务将在今晚 02:00 滚动重启',
    desc: '重启期间新任务进入队列，已运行任务不受影响。',
    action: '查看公告',
    cls: 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300',
  },
  {
    tone: 'success',
    icon: ShieldCheck,
    title: '安全基线检查已通过',
    desc: '全部 8 个服务实例配置与最新基线一致。',
    action: '',
    cls: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
  {
    tone: 'warning',
    icon: TriangleAlert,
    title: '本月调用额度已使用 82%',
    desc: '按当前速率预计 11 天后耗尽，可申请提升配额。',
    action: '申请配额',
    cls: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
  },
  {
    tone: 'danger',
    icon: CircleAlert,
    title: 'gpt-4o 渠道连续 3 次超时',
    desc: '已自动切到备用渠道，请检查上游账号状态。',
    action: '查看详情',
    cls: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400',
  },
] as const

function Page() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 反馈组件 · 对话框、二次确认与轻提示</span>}
        title="反馈组件"
        description="提示统一出现在底部居中，不遮挡页头操作按钮；危险操作一律走二次确认。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            id="demo-feedback"
            title="反馈 Feedback"
            desc="对话框 / 二次确认 / 轻提示，危险操作必须二次确认"
            code={`<AppDialog open={open} onOpenChange={setOpen} title="新建任务">…</AppDialog>
<ConfirmDialog open={c} onOpenChange={setC} title="确认删除？" onConfirm={…} />
toast.success('已保存')`}
          >
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
                打开对话框
              </Button>
              <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>
                危险操作确认
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success('保存成功')}>
                成功提示
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.error('保存失败，请重试')}>
                错误提示
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.info('已复制到剪贴板')}>
                普通提示
              </Button>
            </div>
            <div className="mt-4 rounded-lg border border-line bg-canvas/40 px-4 py-3 text-[11px] leading-relaxed text-muted">
              提示统一出现在<b className="text-ink">底部居中</b>，不遮挡页头操作按钮；危险操作一律走
              <code className="mx-1 rounded bg-surface px-1 py-0.5 text-[10.5px] text-ink">ConfirmDialog</code>
              二次确认。
            </div>

            <AppDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              title="新建任务"
              description="填写基础信息后提交，任务将进入调度队列。"
            >
              <div className="mt-3 space-y-3">
                <div>
                  <Label>任务名称</Label>
                  <Input placeholder="例如：知识库增量同步" />
                </div>
                <div>
                  <Label>执行模型</Label>
                  <AppSelect
                    value="gpt-4o"
                    onValueChange={() => {}}
                    options={[
                      { value: 'gpt-4o', label: 'gpt-4o' },
                      { value: 'qwen-max', label: 'qwen-max' },
                    ]}
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setDialogOpen(false)
                    toast.success('任务已创建')
                  }}
                >
                  提交
                </Button>
              </div>
            </AppDialog>

            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="确认删除该任务？"
              description="删除后执行记录与产物将一并清除，且不可恢复。"
              confirmText="确认删除"
              onConfirm={() => toast.success('已删除')}
            />
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <DemoBlock
            title="提示条 Alert"
            desc="页面级说明与结果反馈，四种语义色各配独立图标"
            code={`<Alert tone="success" title="已保存" desc="配置将在 1 分钟内生效" />`}
          >
            <div className="space-y-2.5">
              {ALERTS.map((a) => (
                <div
                  key={a.tone}
                  className={cn('flex items-start gap-2.5 rounded-lg border px-3 py-2.5', a.cls)}
                >
                  <a.icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-medium">{a.title}</div>
                    <p className="mt-0.5 text-[10.5px] leading-relaxed opacity-80">{a.desc}</p>
                  </div>
                  {a.action ? (
                    <button type="button" className="shrink-0 text-[11px] font-medium hover:underline">
                      {a.action}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
              提示条常驻在内容区顶部，不自动消失；需要自动消失的短反馈用底部居中的轻提示。
            </p>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
