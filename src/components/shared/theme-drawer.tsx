import * as React from 'react'
import { Monitor, Moon, RotateCcw, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ACCENTS,
  ACCENT_LABELS,
  useThemeStore,
  type AccentKey,
  type Density,
  type RadiusSize,
  type SidebarStyle,
  type ThemeMode,
} from '@/stores/theme.store'
import { cn } from '@/lib/utils'

/**
 * 主题设置抽屉 —— 对齐墨刀原型主题抽屉（372px 右侧）。
 * 5 项定制：外观模式 / 主题色 / 界面密度 / 圆角 / 侧边栏风格，实时生效并本地持久化。
 */

function OptionRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: React.ReactNode }[]
  onChange: (v: T) => void
}) {
  return (
    <div>
      <div className="mb-2 text-[12px] font-medium text-muted">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] outline-none transition-colors',
              value === o.value
                ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                : 'border-line bg-surface text-muted hover:border-brand-300 hover:text-ink',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ThemeDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const theme = useThemeStore()

  return (
    <>
      {/* 遮罩 */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-[70] bg-slate-900/30 transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <aside
        aria-hidden={!open}
        className={cn(
          'theme-drawer fixed right-0 top-0 z-[80] flex h-full w-[372px] max-w-full flex-col border-l border-line bg-surface',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ transition: 'transform .28s cubic-bezier(.4,0,.2,1)' }}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <Sun className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[13.5px] font-semibold text-ink">主题设置</div>
              <div className="text-[11px] text-soft">实时生效 · 本地持久化</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={theme.reset} className="gap-1 text-[11.5px]">
            <RotateCcw className="h-3.5 w-3.5" /> 恢复默认
          </Button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <OptionRow<ThemeMode>
            label="外观模式"
            value={theme.mode}
            onChange={theme.setMode}
            options={[
              { value: 'light', label: <><Sun className="h-3.5 w-3.5" /> 浅色</> },
              { value: 'dark', label: <><Moon className="h-3.5 w-3.5" /> 深色</> },
              { value: 'system', label: <><Monitor className="h-3.5 w-3.5" /> 跟随系统</> },
            ]}
          />

          <div>
            <div className="mb-2 text-[12px] font-medium text-muted">主题色</div>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(ACCENTS) as AccentKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => theme.setAccent(key)}
                  title={ACCENT_LABELS[key]}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-lg border p-2 outline-none transition-colors',
                    theme.accent === key
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                      : 'border-line hover:border-brand-300',
                  )}
                >
                  <span
                    className="h-6 w-full rounded-md"
                    style={{ backgroundColor: ACCENTS[key][6] }}
                  />
                  <span className="text-[10.5px] text-muted">{ACCENT_LABELS[key]}</span>
                </button>
              ))}
            </div>
          </div>

          <OptionRow<Density>
            label="界面密度"
            value={theme.density}
            onChange={theme.setDensity}
            options={[
              { value: 'comfortable', label: '舒适' },
              { value: 'compact', label: '紧凑' },
            ]}
          />

          <OptionRow<RadiusSize>
            label="圆角"
            value={theme.radius}
            onChange={theme.setRadius}
            options={[
              { value: 'small', label: '小 4px' },
              { value: 'medium', label: '中 8px' },
              { value: 'large', label: '大 12px' },
            ]}
          />

          <OptionRow<SidebarStyle>
            label="侧边栏风格"
            value={theme.sidebar}
            onChange={theme.setSidebar}
            options={[
              { value: 'light', label: '浅色' },
              { value: 'dark', label: '深色' },
            ]}
          />
        </div>
      </aside>
    </>
  )
}
