import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Database, Plus, Webhook } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { PageHeader } from '@/components/shared/page-header'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/steps')({
  component: Page,
})

const STEPS = [
  { title: '选择数据源', desc: '指定待处理的数据范围' },
  { title: '配置参数', desc: '模型、并发与超时设置' },
  { title: '确认提交', desc: '核对配置并创建任务' },
]

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 分步流程 · 向导式表单 + 完成态</span>}
        title="分步流程"
        description="三步向导：数据源 → 参数 → 确认，步骤条随进度变化，提交后切到结果页。"
      />

      <StepsDemo />
    </>
  )
}

function StepsDemo() {
  const [step, setStep] = React.useState(0)
  const [source, setSource] = React.useState('kb')
  const [model, setModel] = React.useState('gpt-4o')
  const [done, setDone] = React.useState(false)

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const active = i === step && !done
            const finished = done || i < step
            return (
              <React.Fragment key={s.title}>
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-medium transition-colors',
                      finished && 'bg-brand-600 text-white',
                      active && 'bg-brand-600 text-white ring-4 ring-brand-500/15',
                      !finished && !active && 'border border-line bg-surface text-soft',
                    )}
                  >
                    {finished ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                  </span>
                  <div className="hidden sm:block">
                    <div className={cn('text-[12.5px] font-medium', active || finished ? 'text-ink' : 'text-soft')}>
                      {s.title}
                    </div>
                    <div className="text-[10.5px] text-soft">{s.desc}</div>
                  </div>
                </div>
                {i < STEPS.length - 1 ? (
                  <div className={cn('mx-3 h-px flex-1', i < step || done ? 'bg-brand-500' : 'bg-line')} />
                ) : null}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      <div className="min-h-[210px] px-5 py-6">
        {done ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <div className="mt-3 text-[14px] font-semibold text-ink">任务已创建</div>
            <p className="mt-1 max-w-[420px] text-[11.5px] leading-relaxed text-muted">
              任务 task_9f21a0c3 已进入调度队列，预计 3 分钟内开始执行。可在「任务列表」中查看实时进度。
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4"
              onClick={() => {
                setDone(false)
                setStep(0)
              }}
            >
              再来一次
            </Button>
          </div>
        ) : step === 0 ? (
          <div className="max-w-[520px] space-y-4">
            <div>
              <Label>数据来源</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'kb', label: '知识库', icon: Database },
                  { value: 'upload', label: '本地文件', icon: Plus },
                  { value: 'api', label: '接口拉取', icon: Webhook },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSource(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border px-3 py-4 text-[12px] transition-colors',
                      source === opt.value
                        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                        : 'border-line bg-surface text-muted hover:border-brand-300',
                    )}
                  >
                    <opt.icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[10.5px] text-soft">当前选择：{source}</p>
            </div>
          </div>
        ) : step === 1 ? (
          <div className="max-w-[520px] space-y-4">
            <div>
              <Label>执行模型</Label>
              <AppSelect
                value={model}
                onValueChange={setModel}
                options={[
                  { value: 'gpt-4o', label: 'gpt-4o · 720ms' },
                  { value: 'qwen-max', label: 'qwen-max · 540ms' },
                  { value: 'deepseek-v3', label: 'deepseek-v3 · 610ms' },
                ]}
              />
            </div>
            <div>
              <Label>超时（秒）</Label>
              <Input defaultValue="300" />
              <p className="mt-1 text-[10.5px] text-soft">超时后任务标记为失败并进入重试队列</p>
            </div>
          </div>
        ) : (
          <div className="max-w-[560px] rounded-lg border border-line bg-canvas/40 p-4 text-[12px]">
            <div className="text-[12.5px] font-medium text-ink">请核对任务配置</div>
            <div className="mt-2.5 space-y-1.5 text-[11.5px] text-muted">
              <div className="flex justify-between">
                <span>数据来源</span>
                <span className="text-ink">{source}</span>
              </div>
              <div className="flex justify-between">
                <span>执行模型</span>
                <span className="text-ink">{model}</span>
              </div>
              <div className="flex justify-between">
                <span>调度队列</span>
                <span className="text-ink">prod-default</span>
              </div>
              <div className="flex justify-between">
                <span>超时设置</span>
                <span className="text-ink">300 秒</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {!done ? (
        <div className="flex items-center justify-between gap-2 border-t border-line px-5 py-3.5">
          <Button variant="outline" size="sm" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="h-3.5 w-3.5" /> 上一步
          </Button>
          <span className="text-[11px] text-soft">
            第 {step + 1} / {STEPS.length} 步
          </span>
          <Button
            size="sm"
            onClick={() => {
              if (step === STEPS.length - 1) {
                setDone(true)
                toast.success('任务已创建')
              } else {
                setStep((s) => s + 1)
              }
            }}
          >
            {step === STEPS.length - 1 ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> 确认创建
              </>
            ) : (
              <>
                下一步 <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>
      ) : null}
    </Card>
  )
}

/* ------------------------------ 4. 状态占位 ------------------------------ */
