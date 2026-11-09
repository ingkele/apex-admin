import * as React from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/** 筛选栏：关键词框 + 筛选插槽 + 查询/重置（原型列表页同款范式） */
export function FilterBar({
  keyword,
  onKeywordChange,
  keywordPlaceholder = '输入关键词搜索',
  onSearch,
  onReset,
  children,
  className,
}: {
  keyword: string
  onKeywordChange: (v: string) => void
  keywordPlaceholder?: string
  onSearch: () => void
  onReset: () => void
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-surface p-4',
        className,
      )}
    >
      <div className="relative w-[240px]">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soft" />
        <Input
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder={keywordPlaceholder}
          className="pl-8"
        />
      </div>
      {children}
      <div className="ml-auto flex items-center gap-2">
        <Button variant="primary" size="sm" onClick={onSearch}>
          查询
        </Button>
        <Button variant="outline" size="sm" onClick={onReset}>
          重置
        </Button>
      </div>
    </div>
  )
}
