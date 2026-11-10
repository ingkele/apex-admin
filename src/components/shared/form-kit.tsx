import * as React from 'react'
import { Label } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/** 表单字段行 —— 标签 + 控件 + 提示/错误行三段式，表单组各页共用 */
export function Field({
  label,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label>
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </Label>
      <div className="mt-1.5">{children}</div>
      <p className={cn('mt-1 min-h-[14px] text-[10.5px]', error ? 'text-rose-600 dark:text-rose-400' : 'text-soft')}>
        {error || hint}
      </p>
    </div>
  )
}

/** 校验规则：输入值 → 错误信息（空串为通过） */
export type Rule = (value: string) => string

/** 顺序执行规则数组，返回第一条错误信息 */
export function check(value: string, list: Rule[]): string {
  for (const r of list) {
    const err = r(value)
    if (err) return err
  }
  return ''
}

/** 常用规则工厂 —— 组合使用：check(v, [rules.required('请输入用户名'), rules.minLen(3)]) */
export const rules = {
  required: (msg = '该字段必填'): Rule => (v) => (!v.trim() ? msg : ''),
  minLen: (n: number, msg?: string): Rule => (v) =>
    v.trim().length > 0 && v.trim().length < n ? msg || `至少 ${n} 个字符` : '',
  maxLen: (n: number): Rule => (v) => (v.length > n ? `不超过 ${n} 个字符` : ''),
  email: (msg = '邮箱格式不正确'): Rule => (v) =>
    v.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? msg : '',
  range: (min: number, max: number): Rule => (v) => {
    const n = Number(v)
    return v !== '' && (Number.isNaN(n) || n < min || n > max) ? `需在 ${min} - ${max} 之间` : ''
  },
}
