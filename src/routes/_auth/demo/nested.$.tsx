import { createFileRoute, useLocation } from '@tanstack/react-router'
import { ChevronsRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { resolveRouteMeta } from '@/lib/route-meta'

export const Route = createFileRoute('/_auth/demo/nested/$')({
  component: Page,
})

/** splat 参数是「menu3/menu3-2/menu3-2-1」这样的路径串 */
function Page() {
  const params = Route.useParams() as { _splat?: string }
  const segments = (params._splat ?? '').split('/').filter(Boolean)
  // 标题取 nav 元数据（与页签/面包屑同源），而不是 URL 片段
  const { pathname } = useLocation()
  const { title } = resolveRouteMeta(pathname)

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 嵌套菜单</span>}
        title={title}
        description="菜单树支持任意层级：父级只负责展开，叶子跳转；面包屑、页签标题、命令面板路径全部递归生成。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            id="demo-nested"
            title="当前菜单路径"
            desc="从 URL splat 参数解析出的层级，与左侧菜单的展开链一一对应"
            code={`{
  label: '菜单 3',
  children: [
    { label: '菜单 3-1', to: '/demo/nested/menu3/menu3-1' },
    {
      label: '菜单 3-2',
      children: [
        { label: '菜单 3-2-1', to: '/demo/nested/menu3/menu3-2/menu3-2-1' },
      ],
    },
  ],
}`}
          >
            <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
              <span className="text-muted">演示 › 嵌套菜单</span>
              {segments.map((seg) => (
                <span key={seg} className="flex items-center gap-2">
                  <ChevronsRight className="h-3.5 w-3.5 text-soft" />
                  <span className="rounded-md bg-brand-50 px-2 py-1 font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    {seg}
                  </span>
                </span>
              ))}
            </div>
            <p className="mt-5 text-[11.5px] leading-relaxed text-muted">
              层级数不设上限——递归渲染 + 激活链路自动展开，三层、四层都同样工作。
              唯一要注意的是「父级节点不要填 to」，否则它会同时承担展开与跳转两个语义，交互会歧义。
            </p>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink">配套能力（都已打通）</div>
            <ul className="mt-3 space-y-2 text-[11.5px] leading-relaxed text-muted">
              <li>· 面包屑：分组 › 父级链 › 页面，任意深度自动拼</li>
              <li>· 页签标题：取自同一份 nav 元数据，不会出现「页签叫 A、面包屑叫 B」</li>
              <li>· 命令面板（⌘K）：显示完整层级路径，按权限过滤</li>
              <li>· 折叠态：父级点开侧弹菜单，平铺其下所有叶子</li>
              <li>· 激活展开：进入深层页面自动展开父级链，手动收起不会被强行打开</li>
            </ul>
            <div className="mt-4 rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-[11px] text-muted">
              segments = [{segments.map((s) => `'${s}'`).join(', ')}]
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
