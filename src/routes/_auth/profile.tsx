import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  BadgeCheck, Building2, CalendarClock, CheckCircle2, Clock, KeyRound, Laptop, LogOut,
  Mail, MapPin, Monitor, ShieldCheck, Smartphone, UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/select'
import { AppSwitch } from '@/components/ui/switch'
import { AppTabs, AppTabPanel } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/page-header'
import { useAuthStore } from '@/stores/auth.store'
import { appConfig } from '@/app.config'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/profile')({
  component: ProfilePage,
})

const DEVICES = [
  { id: 1, name: 'MacBook Pro 14"', browser: 'Edge 141 · macOS 15', ip: '203.0.113.18', place: '上海 · 中国', at: '当前在线', current: true, icon: Laptop },
  { id: 2, name: 'iPhone 16 Pro', browser: 'Safari · iOS 19.2', ip: '198.51.100.24', place: '上海 · 中国', at: '2 小时前', current: false, icon: Smartphone },
  { id: 3, name: 'Windows 工作站', browser: 'Chrome 141 · Windows 11', ip: '203.0.113.61', place: '南宁 · 中国', at: '昨天 19:22', current: false, icon: Monitor },
]

const RECENT_ACTIONS = [
  { at: '今天 14:32', action: '修改系统参数', detail: '安全策略 · 会话超时 30m→45m', risk: 'high' },
  { at: '今天 11:20', action: '创建 API Key', detail: 'BI 报表助手 · 生产环境', risk: 'medium' },
  { at: '昨天 19:22', action: '导出审计日志', detail: '2026-10 全量 · 1,022 条', risk: 'medium' },
  { at: '昨天 16:40', action: '重启服务', detail: 'embedding-worker · 8 实例滚动重启', risk: 'high' },
]

/** ISO 时间 → 「今天 14:43」 */
function loginLabel(iso?: string) {
  if (!iso) return '今天 08:12'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const p = (n: number) => String(n).padStart(2, '0')
  const hhmm = `${p(d.getHours())}:${p(d.getMinutes())}`
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  return sameDay ? `今天 ${hhmm}` : `${p(d.getMonth() + 1)}-${p(d.getDate())} ${hhmm}`
}

function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [tab, setTab] = React.useState('basic')
  const [profile, setProfile] = React.useState({
    name: user?.name ?? '陈昊',
    email: user?.email ?? 'chenhao@apex.ai',
    phone: '138****6021',
    title: '平台负责人',
    dept: '平台研发中心 / 基础架构组',
    timezone: '(UTC+08:00) 中国标准时间 · 上海',
    locale: '简体中文',
    bio: '负责 Apex AI 平台的任务编排、模型接入与运行时治理，关注高并发调度与成本优化。',
  })
  const [pwd, setPwd] = React.useState({ current: '', next: '', confirm: '' })
  const [mfa, setMfa] = React.useState(true)
  const [alert, setAlert] = React.useState(true)
  const [events, setEvents] = React.useState<string[]>(['任务执行失败', '安全告警', '密钥即将过期'])

  const roleLabel = user ? appConfig.roles[user.role].label : '超级管理员'
  const initial = (profile.name || 'A').slice(-2)

  const saveProfile = () => toast.success('个人资料已保存')
  const savePwd = () => {
    if (!pwd.current || !pwd.next) return toast.error('请填写当前密码与新密码')
    if (pwd.next !== pwd.confirm) return toast.error('两次输入的新密码不一致')
    if (pwd.next.length < 12) return toast.error('新密码至少 12 位，需含大小写字母、数字与符号')
    setPwd({ current: '', next: '', confirm: '' })
    toast.success('密码已更新', { description: '其他设备上的会话将在 15 分钟内失效' })
  }

  return (
    <div>
      <PageHeader
        title="个人中心"
        description="维护个人资料、安全设置与通知偏好，设置仅作用于当前账号。"
        actions={
          <Button variant="outline" size="sm" onClick={() => { logout(); toast.success('已退出登录') }}>
            <LogOut className="h-3.5 w-3.5" /> 退出登录
          </Button>
        }
      />

      <div className="grid grid-cols-12 items-start gap-5">
        {/* 左：身份卡 + 登录设备 */}
        <div className="col-span-12 space-y-5 lg:col-span-4">
          <section className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="h-20 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700" />
            <div className="px-5 pb-5">
              <div className="-mt-8 flex items-end justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-surface bg-brand-600 text-[20px] font-semibold text-white shadow-sm">
                  {initial}
                </div>
                <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <BadgeCheck className="h-3 w-3" /> 已认证
                </span>
              </div>
              <h2 className="mt-3 text-[16px] font-semibold text-ink">{profile.name}</h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted">
                <ShieldCheck className="h-3 w-3" /> {roleLabel}
              </p>
              <div className="mt-4 space-y-2.5 text-[11.5px]">
                {[
                  { icon: Mail, text: profile.email },
                  { icon: Building2, text: profile.dept },
                  { icon: CalendarClock, text: '加入时间 2024-03-12' },
                  { icon: Clock, text: `上次登录 ${loginLabel(user?.lastLoginAt)}` },
                  { icon: MapPin, text: '上海 · 中国 · 203.0.113.18' },
                ].map((r) => (
                  <div key={r.text} className="flex items-center gap-2 text-muted">
                    <r.icon className="h-3 w-3 shrink-0 text-soft" />
                    <span className="truncate">{r.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
              <div>
                <h2 className="text-[13px] font-semibold text-ink">登录设备</h2>
                <p className="mt-0.5 text-[10.5px] text-muted">最近 30 天内有活动的会话</p>
              </div>
              <span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] text-muted">{DEVICES.length} 台</span>
            </div>
            <div className="divide-y divide-line">
              {DEVICES.map((d) => (
                <div key={d.id} className="flex items-start gap-2.5 px-4 py-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-canvas text-soft">
                    <d.icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[11.5px] font-medium text-ink">{d.name}</span>
                      {d.current ? (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9.5px] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                          当前设备
                        </span>
                      ) : null}
                    </div>
                    <div className="truncate text-[10px] text-soft">{d.browser} · {d.place}</div>
                    <div className="font-mono text-[10px] text-soft">{d.ip} · {d.at}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => toast.success('已通知其他设备下线')}
              className="w-full border-t border-line px-4 py-2.5 text-[11px] font-medium text-rose-600 transition hover:bg-rose-50/60 dark:hover:bg-rose-500/10"
            >
              退出其他所有设备
            </button>
          </section>
        </div>

        {/* 右：设置 Tab */}
        <div className="col-span-12 lg:col-span-8">
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            <AppTabs
              value={tab}
              onValueChange={setTab}
              className="px-4"
              tabs={[
                { value: 'basic', label: '基本资料' },
                { value: 'security', label: '安全设置' },
                { value: 'notify', label: '通知偏好' },
              ]}
            >
              <AppTabPanel value="basic" className="p-5 pt-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <Label>姓名</Label>
                    <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>邮箱</Label>
                    <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="font-mono text-[12px]" />
                  </div>
                  <div>
                    <Label>手机号</Label>
                    <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label>职位</Label>
                    <Input value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <Label>所属部门</Label>
                    <Input value={profile.dept} onChange={(e) => setProfile({ ...profile, dept: e.target.value })} />
                  </div>
                  <div>
                    <Label>时区</Label>
                    <AppSelect
                      value={profile.timezone}
                      onValueChange={(v) => setProfile({ ...profile, timezone: v })}
                      className="text-[12px]"
                      options={[
                        { value: '(UTC+08:00) 中国标准时间 · 上海', label: '(UTC+08:00) 中国标准时间 · 上海' },
                        { value: '(UTC+09:00) 日本标准时间 · 东京', label: '(UTC+09:00) 日本标准时间 · 东京' },
                        { value: '(UTC+00:00) 协调世界时 · UTC', label: '(UTC+00:00) 协调世界时 · UTC' },
                      ]}
                    />
                  </div>
                  <div>
                    <Label>语言</Label>
                    <AppSelect
                      value={profile.locale}
                      onValueChange={(v) => setProfile({ ...profile, locale: v })}
                      className="text-[12px]"
                      options={[
                        { value: '简体中文', label: '简体中文' },
                        { value: 'English', label: 'English' },
                        { value: '日本語', label: '日本語' },
                      ]}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>个人简介</Label>
                    <Textarea
                      rows={3}
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="min-h-0 text-[12px]"
                    />
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                  <span className="text-[11px] text-soft">修改姓名会同步到审计日志的操作人显示</span>
                  <Button size="sm" onClick={saveProfile}>保存资料</Button>
                </div>
              </AppTabPanel>

              <AppTabPanel value="security" className="p-5 pt-4">
                <div className="rounded-lg border border-line px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-3.5 w-3.5 text-soft" />
                    <h3 className="text-[12.5px] font-medium text-ink">修改登录密码</h3>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-3">
                    <div>
                      <Label>当前密码</Label>
                      <Input type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} placeholder="••••••••" />
                    </div>
                    <div>
                      <Label>新密码</Label>
                      <Input type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} placeholder="至少 12 位" />
                    </div>
                    <div>
                      <Label>确认新密码</Label>
                      <Input type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} placeholder="再次输入" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10.5px] text-soft">要求含大小写字母、数字与符号；修改后其他设备会话 15 分钟内失效</span>
                    <Button size="sm" onClick={savePwd}>更新密码</Button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
                    <div>
                      <div className="text-[12px] font-medium text-ink">多因素认证 (MFA)</div>
                      <div className="mt-0.5 text-[10.5px] text-muted">登录时需输入动态验证码，当前已绑定 Authenticator</div>
                    </div>
                    <AppSwitch checked={mfa} onCheckedChange={(v) => { setMfa(v); toast.success(v ? '已开启 MFA' : '已关闭 MFA') }} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
                    <div>
                      <div className="text-[12px] font-medium text-ink">异地登录提醒</div>
                      <div className="mt-0.5 text-[10.5px] text-muted">检测到新设备或异常地区登录时发送邮件通知</div>
                    </div>
                    <AppSwitch checked={alert} onCheckedChange={setAlert} />
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-line bg-canvas/40 p-4">
                  <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 最近操作记录
                  </h3>
                  <div className="mt-2.5 space-y-2.5">
                    {RECENT_ACTIONS.map((r) => (
                      <div key={r.at} className="flex items-start justify-between gap-3 text-[11.5px]">
                        <div className="min-w-0">
                          <span className="font-medium text-ink">{r.action}</span>
                          <span className="ml-1.5 text-muted">{r.detail}</span>
                        </div>
                        <span className="shrink-0 text-[10.5px] text-soft">{r.at}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/system/audit" className="mt-3 inline-block text-[11px] font-medium text-brand-600 hover:text-brand-700">
                    查看完整审计日志 →
                  </Link>
                </div>
              </AppTabPanel>

              <AppTabPanel value="notify" className="p-5 pt-4">
                <h3 className="text-[12.5px] font-medium text-ink">订阅事件</h3>
                <p className="mt-0.5 text-[10.5px] text-muted">仅影响当前账号的接收范围，平台级通知配置在「系统参数 · 通知参数」中维护。</p>
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {['任务执行失败', '服务健康异常', '安全告警', '密钥即将过期', '模型调用量异常', '周报摘要'].map((ev) => {
                    const checked = events.includes(ev)
                    return (
                      <label
                        key={ev}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-[11.5px] text-ink transition hover:bg-hover"
                      >
                        <input
                          name="notify-events"
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setEvents((prev) => (checked ? prev.filter((p) => p !== ev) : [...prev, ev]))
                          }
                          className="h-3.5 w-3.5 shrink-0 rounded accent-brand-600"
                        />
                        <span className="flex-1">{ev}</span>
                      </label>
                    )
                  })}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <Label>偏好渠道</Label>
                    <AppSelect
                      value="邮件 + 站内信"
                      onValueChange={() => toast.info('渠道设置已保存')}
                      className="text-[12px]"
                      options={[
                        { value: '邮件 + 站内信', label: '邮件 + 站内信' },
                        { value: '仅站内信', label: '仅站内信' },
                        { value: '邮件 + 企业微信', label: '邮件 + 企业微信' },
                      ]}
                    />
                  </div>
                  <div>
                    <Label>静默时段</Label>
                    <div className="flex items-center gap-2">
                      <Input type="time" defaultValue="22:00" className="text-[12px]" />
                      <span className="shrink-0 text-[10px] text-soft">至</span>
                      <Input type="time" defaultValue="08:00" className="text-[12px]" />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                  <span className="flex items-center gap-1.5 text-[11px] text-soft">
                    <UserRound className="h-3 w-3" /> 已选择 {events.length} 个事件
                  </span>
                  <Button size="sm" onClick={() => toast.success('通知偏好已保存')}>保存偏好</Button>
                </div>
              </AppTabPanel>
            </AppTabs>
          </div>

          {/* 账号状态条 */}
          <div
            className={cn(
              'mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-5 py-3.5',
              'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/5',
            )}
          >
            <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> 账号安全状态良好 · MFA 已开启 · 密码 42 天前更新
            </span>
            <span className="text-[11px] text-emerald-700/70 dark:text-emerald-400/70">下次建议更新：2026-12-20</span>
          </div>
        </div>
      </div>
    </div>
  )
}
