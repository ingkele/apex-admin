import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'

/** 搜索参数白名单解析：类型不合法的字段直接丢弃 */
export const Route = createFileRoute('/_auth/demo/query-param')({
  validateSearch: (search: Record<string, unknown>): { user?: string; tab?: string } => ({
    user: typeof search.user === 'string' ? search.user : undefined,
    tab: typeof search.tab === 'string' ? search.tab : undefined,
  }),
  component: Page,
})

function Page() {
  const navigate = useNavigate()
  const { user, tab } = Route.useSearch()
  const curUser = user ?? '（未指定）'
  const curTab = tab ?? '1'

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 功能</span>}
        title="带参菜单"
        description="菜单项配置 query 字段，点击跳转时自动携带搜索参数；页面用 validateSearch 做白名单解析。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="菜单配置与参数解析"
            desc={'左侧菜单「带参菜单」点击后 URL 是 /demo/query-param?user=apex&tab="1" —— tab 是数字样字符串，序列化时会加引号保证解析回字符串类型（浏览器地址栏显示为 %221%22）'}
            code={`// app.config.ts —— 菜单项带参
{ label: '带参菜单', to: '/demo/query-param',
  query: { user: 'apex', tab: '1' } }

// 路由侧 —— validateSearch 白名单解析
validateSearch: (s) => ({
  user: typeof s.user === 'string' ? s.user : undefined,
  tab: typeof s.tab === 'string' ? s.tab : undefined,
})

// 页面侧 —— 类型安全的读取
const { user, tab } = Route.useSearch()`}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-line bg-canvas px-3 py-2.5">
                  <div className="text-[10.5px] text-soft">user 参数</div>
                  <div className="mt-1 font-mono text-[13px] font-medium text-ink">{curUser}</div>
                </div>
                <div className="rounded-lg border border-line bg-canvas px-3 py-2.5">
                  <div className="text-[10.5px] text-soft">tab 参数</div>
                  <div className="mt-1 font-mono text-[13px] font-medium text-ink">{curTab}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {['apex', 'witchc', 'guest'].map((u) => (
                  <Button
                    key={u}
                    size="sm"
                    variant={curUser === u ? 'primary' : 'outline'}
                    onClick={() => void navigate({ to: '/demo/query-param', search: { user: u, tab: curTab } })}
                  >
                    user={u}
                  </Button>
                ))}
                {['1', '2', '3'].map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={curTab === t ? 'primary' : 'outline'}
                    onClick={() => void navigate({ to: '/demo/query-param', search: { user: curUser, tab: t } })}
                  >
                    tab={t}
                  </Button>
                ))}
              </div>
            </div>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-brand-600" />
              <div className="text-[13px] font-semibold text-ink">设计要点</div>
            </div>
            <ul className="mt-2.5 space-y-2 text-[11.5px] leading-relaxed text-muted">
              <li>· <span className="font-medium text-ink">参数不进页签键：</span>多页签以 pathname 为键，<code className="font-mono">?user=</code> 变化不会开出新页签，回到本页参数保持；</li>
              <li>· <span className="font-medium text-ink">白名单解析：</span>validateSearch 里做类型校验，URL 手改乱值只会得到 <code className="font-mono">undefined</code>，不会把脏数据带进组件；</li>
              <li>· <span className="font-medium text-ink">分享友好：</span>带参 URL 可直接发给同事，打开即还原到同一视图。</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
