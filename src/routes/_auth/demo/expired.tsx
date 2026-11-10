import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { toast } from 'sonner'
import { KeyRound, ShieldAlert } from 'lucide-react'
import { http, ApiError } from '@/lib/http'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { useAuthStore } from '@/stores/auth.store'
import { useTabsStore } from '@/stores/tabs.store'

export const Route = createFileRoute('/_auth/demo/expired')({
  component: Page,
})

function Page() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const logout = useAuthStore((s) => s.logout)
  const [errText, setErrText] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  /** 请求一个必然「过期」的接口，观察错误如何冒泡到调用方 */
  const requestExpired = async () => {
    setLoading(true)
    setErrText(null)
    try {
      await http.get('/demo/expired')
    } catch (e) {
      const text =
        e instanceof ApiError
          ? `ApiError · status=${e.status} · ${e.message}`
          : `Error · ${e instanceof Error ? e.message : '请求失败'}`
      setErrText(text)
    } finally {
      setLoading(false)
    }
  }

  /** 模拟 401 拦截器的标准处置：清页签 → 清会话与缓存 → 回登录页 */
  const simulateInterceptor = () => {
    toast.error('登录已过期，请重新登录')
    useTabsStore.getState().reset()
    qc.clear()
    logout()
    void navigate({ to: '/login' })
  }

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 功能</span>}
        title="登录过期"
        description="演示 401 的两段式处理：错误如何归一化冒泡，以及拦截器该做的清场动作（清页签、清缓存、回登录页）。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 space-y-4">
          <DemoBlock
            title="① 请求会过期的接口"
            desc="调用 GET /demo/expired，live 模式下后端返回 401，http 层归一化为 ApiError；mock 模式模拟同样语义"
            code={`try {
  await http.get('/demo/expired')
} catch (e) {
  // live: ApiError · status=401 · 后端 message
  // mock: Error · 登录已过期（401），请重新登录
}`}
          >
            <div className="flex items-center gap-3">
              <Button onClick={requestExpired} disabled={loading}>
                <KeyRound className="h-3.5 w-3.5" />
                {loading ? '请求中…' : '请求过期接口'}
              </Button>
              <span className="text-[11px] text-soft">GET /demo/expired</span>
            </div>
            {errText ? (
              <pre className="mt-3 overflow-x-auto rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 font-mono text-[11.5px] text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                <code>{errText}</code>
              </pre>
            ) : null}
          </DemoBlock>

          <DemoBlock
            title="② 拦截器标准处置（清场动作）"
            desc="真实场景中 401 应在 http.ts 响应拦截器里统一处理，这里手动演示完整流程"
            code={`// lib/http.ts · toApiError 中预留的挂载点
// TODO(对接后端)：401 时可在此挂 token 静默刷新后重放请求
if (ax.response.status === 401) {
  // 刷新成功 → 重放；刷新失败 → 清场回登录页
}`}
          >
            <Button variant="danger" onClick={simulateInterceptor}>
              <ShieldAlert className="h-3.5 w-3.5" />
              模拟拦截器：清会话并回登录页
            </Button>
            <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
              点击后会依次执行：重置多页签 → 清空 React Query 缓存 → 清除登录态 → 跳转登录页。
              真实接入后端后，这一段应放进 401 拦截器，而不是散落在各页面。
            </p>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink">推荐的两段式设计</div>
            <ol className="mt-3 space-y-3 text-[11.5px] leading-relaxed text-muted">
              <li>
                <span className="font-medium text-ink">第一段 · 静默刷新：</span>
                401 时先用 refresh token 换新 token 并重放原请求，用户无感知；刷新也失败才进入第二段。
              </li>
              <li>
                <span className="font-medium text-ink">第二段 · 清场跳转：</span>
                清页签/缓存/登录态，带 <code className="font-mono">redirect</code> 参数回登录页，登录成功后回到原页面。
              </li>
            </ol>
            <div className="mt-4 rounded-lg border border-line bg-canvas px-3 py-2.5 text-[11px] leading-relaxed text-soft">
              当前模板的挂载点在 <code className="font-mono">src/lib/http.ts</code> 的{' '}
              <code className="font-mono">toApiError</code> 函数内（有 TODO 标注），接后端时只改这一处。
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
