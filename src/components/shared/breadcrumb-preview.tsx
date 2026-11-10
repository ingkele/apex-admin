import { ChevronsRight } from 'lucide-react'

/** 面包屑实时预览条（面包屑演示页共用）：复刻顶栏面包屑的渲染外观 */
export function BreadcrumbPreview({ parts }: { parts: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-canvas px-3.5 py-2.5">
      {parts.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 ? <ChevronsRight className="h-3 w-3 text-soft" /> : null}
          <span className={i === parts.length - 1 ? 'text-[12px] font-medium text-ink' : 'text-[12px] text-muted'}>
            {p}
          </span>
        </span>
      ))}
    </div>
  )
}
