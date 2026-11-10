import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, ChevronRight, FolderTree, Minus, Square, SquareCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/examples/vxe-table/tree')({
  component: Page,
})

function Page() {
  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › Vxe 表格 › 树形表格 · 层级展开 + 级联勾选</span>}
        title="树形表格"
        description="层级数据递归展开：缩进对齐、展开折叠、父子级联勾选（含半选态）。"
      />
      <TreeTable />
    </>
  )
}

interface TreeNode {
  id: string
  name: string
  owner: string
  size: string
  children?: TreeNode[]
}

const TREE: TreeNode[] = [
  {
    id: 'dep-rd', name: '研发部', owner: '陈昊', size: '—',
    children: [
      { id: 'dep-rd-fe', name: '前端组', owner: '林晓', size: '8 人' },
      {
        id: 'dep-rd-be', name: '后端组', owner: '周可', size: '12 人',
        children: [
          { id: 'dep-rd-be-1', name: '平台服务', owner: '苏禾', size: '5 人' },
          { id: 'dep-rd-be-2', name: '业务服务', owner: '赵岚', size: '7 人' },
        ],
      },
      { id: 'dep-rd-qa', name: '测试组', owner: '王宁', size: '4 人' },
    ],
  },
  {
    id: 'dep-ops', name: '运维部', owner: '李思', size: '—',
    children: [
      { id: 'dep-ops-sre', name: 'SRE', owner: '张阳', size: '6 人' },
      { id: 'dep-ops-sec', name: '安全组', owner: '吴桐', size: '3 人' },
    ],
  },
]

function collectIds(node: TreeNode, out: string[] = []): string[] {
  out.push(node.id)
  node.children?.forEach((c) => collectIds(c, out))
  return out
}

/** 级联勾选：返回新选中集合 */
function cascade(node: TreeNode, checked: Set<string>, on: boolean): Set<string> {
  const next = new Set(checked)
  for (const id of collectIds(node)) {
    if (on) next.add(id)
    else next.delete(id)
  }
  return next
}

/** 节点勾选状态：checked / indeterminate / unchecked */
function nodeState(node: TreeNode, checked: Set<string>): 'checked' | 'mixed' | 'none' {
  const ids = collectIds(node)
  const hit = ids.filter((id) => checked.has(id)).length
  return hit === 0 ? 'none' : hit === ids.length ? 'checked' : 'mixed'
}

function TreeTable() {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(['dep-rd', 'dep-rd-be']))
  const [checked, setChecked] = React.useState<Set<string>>(new Set(['dep-rd-fe']))

  const toggleExpand = (id: string) =>
    setExpanded((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const rows: { node: TreeNode; depth: number }[] = []
  const walk = (list: TreeNode[], depth: number) => {
    for (const n of list) {
      rows.push({ node: n, depth })
      if (n.children && expanded.has(n.id)) walk(n.children, depth + 1)
    }
  }
  walk(TREE, 0)

  return (
    <DemoBlock
      id="vxe-tree"
      title="组织架构（树形）"
      desc="点 chevron 展开折叠；勾选父节点级联全选/全不选，子节点未全选时父节点半选"
      code={`// 级联勾选：父 → 子全量加减
const cascade = (node, checked, on) => {
  const next = new Set(checked)
  for (const id of collectIds(node)) on ? next.add(id) : next.delete(id)
  return next
}
// 半选态：命中数 0 → none；全中 → checked；其余 → mixed`}
    >
      <div className="mb-3 flex items-center gap-2">
        <Badge variant="brand">已勾选 {checked.size} 个节点</Badge>
        <FolderTree className="h-3.5 w-3.5 text-soft" />
        <span className="text-[10.5px] text-soft">共 {rows.length} 行可见 / 全树 {TREE.flatMap((n) => collectIds(n)).length} 个节点</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="border-b border-line bg-canvas/50 text-left text-soft">
              <th className="w-10 px-3 py-2.5" />
              <th className="px-3 py-2.5 font-medium">部门 / 团队</th>
              <th className="px-3 py-2.5 font-medium">负责人</th>
              <th className="px-3 py-2.5 font-medium">规模</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ node, depth }) => {
              const st = nodeState(node, checked)
              return (
                <tr key={node.id} className="border-b border-line/60 last:border-0 hover:bg-hover/50">
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      aria-label={st === 'checked' ? `取消勾选 ${node.name}` : `勾选 ${node.name}`}
                      onClick={() => setChecked((c) => cascade(node, c, st !== 'checked'))}
                      className="text-soft transition-colors hover:text-brand-600"
                    >
                      {st === 'checked' ? (
                        <SquareCheck className="h-3.5 w-3.5 text-brand-600" />
                      ) : st === 'mixed' ? (
                        <Minus className="h-3.5 w-3.5 text-brand-600" />
                      ) : (
                        <Square className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center" style={{ paddingLeft: depth * 22 }}>
                      {node.children ? (
                        <button
                          type="button"
                          aria-label={expanded.has(node.id) ? `收起 ${node.name}` : `展开 ${node.name}`}
                          onClick={() => toggleExpand(node.id)}
                          className="mr-1 text-soft transition-colors hover:text-ink"
                        >
                          {expanded.has(node.id) ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </button>
                      ) : (
                        <span className="mr-1 inline-block h-3.5 w-3.5" />
                      )}
                      <span className={cn('text-ink', node.children ? 'font-semibold' : 'font-normal')}>{node.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted">{node.owner}</td>
                  <td className="px-3 py-2 text-muted">{node.size}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </DemoBlock>
  )
}
