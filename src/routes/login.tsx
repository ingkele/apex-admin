import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ArrowRight, Building2, Command, Eye, EyeOff, Info, KeyRound,
  Loader2, LockKeyhole, Mail, ShieldCheck, Workflow,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

/**
 * 登录页 —— 逐像素还原墨刀原型 login.html：
 * 左 56% 浅色玻璃面板（grid-bg + noise-orb + 流水线玻璃卡片 + 底部数据行）
 * 右侧完整表单区（安全徽章 / 账号密码 / 记住设备 / SSO / 提示框 / 条款 / 状态条）。
 * 深色适配走 .login-scope 三元组翻转（slate/white/login-panel），与原型 html.dark 段同源。
 */
function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [account, setAccount] = React.useState('admin@apex.ai')
  const [password, setPassword] = React.useState('Apex@2026')
  const [showPassword, setShowPassword] = React.useState(false)
  const [remember, setRemember] = React.useState(true)
  const [loading, setLoading] = React.useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(account, password)
      toast.success('登录成功')
      void navigate({ to: '/dashboard' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-scope flex min-h-screen w-full overflow-hidden bg-slate-50 text-slate-900">
      {/* ============ 左侧品牌面板（56%，浅色玻璃拟态） ============ */}
      <section className="relative hidden w-[56%] flex-col justify-between overflow-hidden bg-[var(--login-panel)] px-14 py-10 lg:flex xl:px-20 xl:py-12">
        {/* 装饰层 */}
        <div aria-hidden="true" className="grid-bg absolute inset-0 opacity-80" />
        <div aria-hidden="true" className="noise-orb absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full" />
        <div aria-hidden="true" className="absolute -bottom-40 left-28 h-[430px] w-[430px] rounded-full bg-brand-200/30 blur-3xl" />

        {/* logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-[0_10px_24px_rgba(37,99,235,.24)]">
            <Command className="h-[22px] w-[22px]" />
          </div>
          <div>
            <div className="text-[17px] font-semibold tracking-tight text-slate-900">Apex Admin</div>
            <div className="text-[10px] font-medium tracking-[0.16em] text-slate-500">AI PLATFORM CONSOLE</div>
          </div>
        </div>

        {/* 标语区 */}
        <div className="relative z-10 max-w-[600px] py-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-white/70 px-3 py-1.5 text-[12px] font-medium text-brand-700 shadow-sm backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-600" />
            </span>
            平台运行正常 · 全部服务可用
          </div>
          <h1 className="text-[44px] font-semibold leading-[1.16] tracking-[-0.035em] text-slate-900 xl:text-[52px]">
            让每一次 AI 任务
            <br />
            <span className="text-brand-600">清晰、可控、可追溯。</span>
          </h1>
          <p className="mt-6 max-w-[490px] text-[15px] leading-7 text-slate-600">
            统一管理任务编排、模型服务、API 密钥与团队权限。Apex Admin 为 AI
            平台提供稳定、透明、可审计的运营底座。
          </p>

          {/* 流水线玻璃卡片 */}
          <div className="mt-10 rounded-2xl border border-white/90 bg-white/85 p-5 shadow-float backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Workflow className="h-[17px] w-[17px]" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-slate-800">生产环境任务流水线</div>
                  <div className="text-[11px] text-slate-500">过去 24 小时 · 自动刷新</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                运行中
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="rounded-xl bg-slate-50/80 p-3.5">
                <div className="text-[11px] text-slate-500">任务吞吐</div>
                <div className="mt-1.5 text-[20px] font-semibold tabular-nums text-slate-900">12.8k</div>
                <div className="mt-1 text-[10px] font-medium text-emerald-600">↑ 12.4%</div>
              </div>
              <div className="rounded-xl bg-slate-50/80 p-3.5">
                <div className="text-[11px] text-slate-500">成功率</div>
                <div className="mt-1.5 text-[20px] font-semibold tabular-nums text-slate-900">98.6%</div>
                <div className="mt-1 text-[10px] font-medium text-emerald-600">高于基线 0.8%</div>
              </div>
              <div className="rounded-xl bg-slate-50/80 p-3.5">
                <div className="text-[11px] text-slate-500">平均延迟</div>
                <div className="mt-1.5 text-[20px] font-semibold tabular-nums text-slate-900">
                  842<span className="ml-0.5 text-[11px] font-normal text-slate-500">ms</span>
                </div>
                <div className="mt-1 text-[10px] font-medium text-slate-500">P95 · 稳定</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
                GP
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-700">GPT-4o · 报告生成任务</span>
                  <span className="tabular-nums text-slate-500">完成 86%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[86%] rounded-full bg-brand-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部数据行 */}
        <div className="relative z-10 flex items-center gap-8 border-t border-slate-200/70 pt-6 text-[12px]">
          <div>
            <div className="text-[17px] font-semibold tracking-tight text-slate-900">99.99%</div>
            <div className="mt-0.5 text-slate-500">服务可用性</div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="text-[17px] font-semibold tracking-tight text-slate-900">2.4M+</div>
            <div className="mt-0.5 text-slate-500">累计执行任务</div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            企业级安全与审计
          </div>
        </div>
      </section>

      {/* ============ 右侧表单区 ============ */}
      <section className="relative flex flex-1 flex-col bg-white">
        {/* 顶栏 */}
        <div className="flex items-center justify-between px-8 py-7 xl:px-12">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Command className="h-[18px] w-[18px]" />
            </div>
            <span className="text-[15px] font-semibold">Apex Admin</span>
          </div>
          <div className="ml-auto flex items-center gap-2 text-[12px] text-slate-500">
            遇到问题？
            <button
              type="button"
              onClick={() => toast.info('演示环境：支持渠道暂未接入')}
              className="font-medium text-brand-600 transition hover:text-brand-700"
            >
              联系平台支持
            </button>
          </div>
        </div>

        {/* 表单主体 */}
        <div className="flex flex-1 items-center justify-center px-8 pb-12">
          <div className="w-full max-w-[392px]">
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-500">
                <LockKeyhole className="h-[13px] w-[13px] text-brand-600" />
                安全登录 · SSO 已启用
              </div>
              <h2 className="text-[30px] font-semibold tracking-[-0.03em] text-slate-900">登录 Apex Admin</h2>
              <p className="mt-2 text-[13px] leading-6 text-slate-500">使用你的管理账号继续访问平台控制台。</p>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              <div>
                <label className="mb-2 block text-[13px] font-medium text-slate-700" htmlFor="account">
                  账号
                </label>
                <div className="login-input flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5">
                  <Mail className="h-[17px] w-[17px] shrink-0 text-slate-400" />
                  <input
                    id="account"
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="username"
                    className="h-full min-w-0 flex-1 border-0 bg-transparent text-[13px] text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[13px] font-medium text-slate-700" htmlFor="password">
                    密码
                  </label>
                  <button
                    type="button"
                    onClick={() => toast.info('演示环境：请使用预填密码登录')}
                    className="text-[12px] font-medium text-brand-600 transition hover:text-brand-700"
                  >
                    忘记密码？
                  </button>
                </div>
                <div className="login-input flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5">
                  <KeyRound className="h-[17px] w-[17px] shrink-0 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    autoComplete="current-password"
                    className="h-full min-w-0 flex-1 border-0 bg-transparent text-[13px] text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    aria-label="显示密码"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-[17px] w-[17px]" /> : <Eye className="h-[17px] w-[17px]" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2.5 text-[12px] text-slate-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-brand-600"
                  />
                  记住此设备 7 天
                </label>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <ShieldCheck className="h-[13px] w-[13px]" />
                  加密传输
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,.18)] transition hover:bg-brand-700 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    登录控制台
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[11px] text-slate-400">或</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast.info('企业 SSO 认证服务正在连接，请稍候')}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Building2 className="h-4 w-4 text-slate-500" />
                使用企业 SSO 登录
              </button>
            </form>

            <div className="mt-7 rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3">
              <div className="flex items-start gap-2.5">
                <Info className="mt-0.5 h-[14px] w-[14px] shrink-0 text-slate-400" />
                <p className="text-[11px] leading-5 text-slate-500">
                  演示账号已预填。登录后可在「系统管理 → 系统参数」中配置 SSO、双因素认证与登录策略。
                </p>
              </div>
            </div>

            <p className="mt-8 text-center text-[11px] leading-5 text-slate-400">
              登录即代表你同意 Apex 的{' '}
              <button type="button" onClick={() => toast.info('演示环境')} className="text-slate-500 transition hover:text-brand-600">
                服务条款
              </button>{' '}
              与{' '}
              <button type="button" onClick={() => toast.info('演示环境')} className="text-slate-500 transition hover:text-brand-600">
                隐私政策
              </button>
            </p>
          </div>
        </div>

        {/* 底部状态条 */}
        <div className="flex items-center justify-between border-t border-slate-100 px-8 py-5 text-[11px] text-slate-400 xl:px-12">
          <span>© 2026 Apex AI Platform</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            所有系统运行正常
          </span>
        </div>
      </section>
    </div>
  )
}
