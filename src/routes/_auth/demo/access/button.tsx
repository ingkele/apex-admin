import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import { Lock, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Can, useCan } from '@/components/shared/can'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { RoleSwitcher } from '@/components/shared/role-switcher'

export const Route = createFileRoute('/_auth/demo/access/button')({
  component: Page,
})

function Page() {
  const canManage = useCan('user:manage')
  const [deleted, setDeleted] = React.useState(0)

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 前端权限</span>}
        title="按钮控制"
        description="<Can> 按钮级权限的三种形态：直接隐藏、fallback 替换、禁用态。用角色模拟器切换，观察按钮实时变化。"
      />

      <RoleSwitcher className="mb-4" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="三种常见形态"
            desc="隐藏最常用；「可发现」场景用禁用 + 提示；fallback 适合替换为申请入口"
            code={`// ① 无权限直接隐藏（默认 fallback=null）
<Can permission="user:manage">
  <Button>删除</Button>
</Can>

// ② fallback 替换为申请入口
<Can permission="user:manage" fallback={<Button variant="ghost">申请权限</Button>}>
  <Button>删除</Button>
</Can>

// ③ 禁用态（可发现性更好）
<Button disabled={!useCan('user:manage')}>删除</Button>`}
          >
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-[11px] font-medium text-soft">① 无权限直接隐藏</div>
                <div className="flex flex-wrap gap-2.5">
                  <Can permission="user:manage">
                    <Button size="sm" onClick={() => { setDeleted((n) => n + 1); toast.success('删除了 1 条记录（演示）') }}>
                      <Trash2 className="h-3 w-3" />
                      删除记录
                    </Button>
                  </Can>
                  <Button variant="outline" size="sm" onClick={() => toast.success('新建了 1 条记录（演示）')}>
                    <Plus className="h-3 w-3" />
                    新建记录
                  </Button>
                  {!canManage ? (
                    <span className="self-center text-[11px] text-soft">「删除记录」已被隐藏 —— 试试切到超级管理员</span>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[11px] font-medium text-soft">② fallback 替换</div>
                <Can
                  permission="user:manage"
                  fallback={
                    <Button variant="ghost" size="sm" onClick={() => toast.info('已发起权限申请（演示）')}>
                      <Lock className="h-3 w-3" />
                      申请编辑权限
                    </Button>
                  }
                >
                  <Button variant="soft" size="sm" onClick={() => toast.success('进入编辑（演示）')}>
                    <Pencil className="h-3 w-3" />
                    编辑配置
                  </Button>
                </Can>
              </div>

              <div>
                <div className="mb-2 text-[11px] font-medium text-soft">③ 禁用态（按钮始终可见）</div>
                <Button variant="danger" size="sm" disabled={!canManage} onClick={() => toast.success('停用了服务（演示）')}>
                  <Lock className="h-3 w-3" />
                  {canManage ? '停用服务' : '停用服务（无权限）'}
                </Button>
              </div>
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink">实时状态</div>
            <div className="mt-3 space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
                <span className="text-muted">useCan('user:manage')</span>
                <span className={canManage ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                  {String(canManage)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
                <span className="text-muted">演示删除次数</span>
                <span className="text-ink">{deleted}</span>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-[11px] leading-relaxed text-soft">
              <li>· 渲染期判权限用 <code className="font-mono">useCan</code> / <code className="font-mono">&lt;Can&gt;</code>；</li>
              <li>· 事件处理里用 <code className="font-mono">hasPermission()</code>（非 hook 版）；</li>
              <li>· 前端隐藏只是体验，后端必须重复校验权限码。</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
