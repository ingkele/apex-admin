import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Check, Copy, Heading1, Heading2,
  Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, Strikethrough, Underline, Undo2,
} from 'lucide-react'

export const Route = createFileRoute('/_auth/examples/rich-text')({
  component: Page,
})

interface Tool {
  key: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  cmd: string
  arg?: string
  group: number
}

const TOOLS: Tool[] = [
  { key: 'undo', icon: Undo2, title: '撤销', cmd: 'undo', group: 0 },
  { key: 'redo', icon: Redo2, title: '重做', cmd: 'redo', group: 0 },
  { key: 'h1', icon: Heading1, title: '一级标题', cmd: 'formatBlock', arg: 'h1', group: 1 },
  { key: 'h2', icon: Heading2, title: '二级标题', cmd: 'formatBlock', arg: 'h2', group: 1 },
  { key: 'quote', icon: Quote, title: '引用', cmd: 'formatBlock', arg: 'blockquote', group: 1 },
  { key: 'bold', icon: Bold, title: '加粗', cmd: 'bold', group: 2 },
  { key: 'italic', icon: Italic, title: '斜体', cmd: 'italic', group: 2 },
  { key: 'underline', icon: Underline, title: '下划线', cmd: 'underline', group: 2 },
  { key: 'strike', icon: Strikethrough, title: '删除线', cmd: 'strikeThrough', group: 2 },
  { key: 'ul', icon: List, title: '无序列表', cmd: 'insertUnorderedList', group: 3 },
  { key: 'ol', icon: ListOrdered, title: '有序列表', cmd: 'insertOrderedList', group: 3 },
  { key: 'left', icon: AlignLeft, title: '左对齐', cmd: 'justifyLeft', group: 4 },
  { key: 'center', icon: AlignCenter, title: '居中', cmd: 'justifyCenter', group: 4 },
  { key: 'right', icon: AlignRight, title: '右对齐', cmd: 'justifyRight', group: 4 },
  { key: 'hr', icon: Minus, title: '分隔线', cmd: 'insertHorizontalRule', group: 5 },
]

function Page() {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState<Set<string>>(new Set())
  const [html, setHtml] = React.useState('')
  const [showSource, setShowSource] = React.useState(false)
  const [linkOpen, setLinkOpen] = React.useState(false)
  const [linkText, setLinkText] = React.useState('')

  /** 刷新工具栏激活态（queryCommandState） */
  const refreshActive = React.useCallback(() => {
    const next = new Set<string>()
    for (const t of TOOLS) {
      try {
        if (t.cmd === 'formatBlock') {
          const block = String(document.queryCommandValue('formatBlock') || '').toLowerCase()
          if (block === (t.arg ?? '')) next.add(t.key)
        } else if (['bold', 'italic', 'underline', 'strikeThrough'].includes(t.cmd)) {
          if (document.queryCommandState(t.cmd)) next.add(t.key)
        }
      } catch {
        // queryCommand* 在部分环境抛错，忽略即可（激活态是锦上添花）
      }
    }
    setActive(next)
  }, [])

  const exec = (cmd: string, arg?: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, arg)
    refreshActive()
  }

  const insertLink = () => {
    if (!linkText.trim()) return
    const url = linkText.startsWith('http') ? linkText : `https://${linkText}`
    const selection = window.getSelection()?.toString()
    editorRef.current?.focus()
    if (selection) document.execCommand('createLink', false, url)
    else document.execCommand('insertHTML', false, `<a href="${url}" target="_blank">${url}</a>`)
    setLinkOpen(false)
    setLinkText('')
    refreshActive()
  }

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html)
      toast.success('HTML 源码已复制')
    } catch {
      toast.error('复制失败，请手动选择')
    }
  }

  const wordCount = html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim().length

  return (
    <>
      <PageHeader
        eyebrow={<span>示例 › 富文本编辑器 · 工具栏 + contenteditable</span>}
        title="富文本编辑器"
        description="工具栏 + contenteditable 富文本编辑：标题 / 强调 / 列表 / 对齐 / 链接 / 分隔线，实时输出 HTML 源码。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            id="rich-editor"
            title="编辑器"
            desc="点击工具栏格式化选区；激活态随光标位置实时刷新"
            code={`<div contenteditable onInput={sync} onKeyUp={refreshActive} />
// 工具栏：document.execCommand('bold' / 'formatBlock' / …)
// 激活态：document.queryCommandState('bold')`}
          >
            {/* 工具栏 */}
            <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-line bg-canvas/40 px-2 py-1.5">
              {[0, 1, 2, 3, 4, 5].map((group) => (
                <React.Fragment key={group}>
                  {group > 0 ? <div className="mx-1 h-4 w-px bg-line" /> : null}
                  {TOOLS.filter((t) => t.group === group).map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      title={t.title}
                      onClick={() => exec(t.cmd, t.arg)}
                      className={cn(
                        'rounded-md p-1.5 text-[11px] transition-colors',
                        active.has(t.key)
                          ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'
                          : 'text-muted hover:bg-hover hover:text-ink',
                      )}
                    >
                      <t.icon className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </React.Fragment>
              ))}
              <div className="mx-1 h-4 w-px bg-line" />
              <button
                type="button"
                title="插入链接"
                onClick={() => {
                  const sel = window.getSelection()?.toString() ?? ''
                  setLinkText(sel)
                  setLinkOpen((v) => !v)
                }}
                className={cn(
                  'rounded-md p-1.5 transition-colors',
                  linkOpen ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300' : 'text-muted hover:bg-hover hover:text-ink',
                )}
              >
                <Link2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* 链接输入条 */}
            {linkOpen ? (
              <div className="flex items-center gap-2 border-x border-line bg-canvas/40 px-3 py-2">
                <input
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && insertLink()}
                  placeholder="粘贴或输入链接地址，选中文字后插入则生成超链接"
                  className="h-7 flex-1 rounded-md border border-line bg-surface px-2.5 text-[11px] text-ink outline-none focus:border-brand-500"
                />
                <Button size="sm" className="h-7 px-2.5 text-[11px]" onClick={insertLink}>插入</Button>
                <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[11px]" onClick={() => setLinkOpen(false)}>取消</Button>
              </div>
            ) : null}

            {/* 编辑区 */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              onInput={(e) => setHtml(e.currentTarget.innerHTML)}
              onKeyUp={refreshActive}
              onMouseUp={refreshActive}
              onFocus={refreshActive}
              className="min-h-[300px] rounded-b-lg border border-t-0 border-line bg-surface px-5 py-4 text-[13px] leading-relaxed text-ink outline-none focus:border-brand-500/50 [&_a]:text-brand-600 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-brand-300 [&_blockquote]:pl-3 [&_blockquote]:text-muted [&_h1]:mb-2 [&_h1]:text-[20px] [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:text-[16px] [&_h2]:font-semibold [&_hr]:my-3 [&_hr]:border-line [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{
                __html:
                  '<h1>Apex Admin 富文本示例</h1><p>选中文字后点工具栏 <b>加粗</b>、<i>斜体</i>、<u>下划线</u> 即可格式化。</p><blockquote>引用块适合放重要说明或摘录。</blockquote><ul><li>无序列表项一</li><li>无序列表项二</li></ul>',
              }}
            />

            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-soft">
                字数（纯文本）：<b className="text-ink">{wordCount}</b>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="text-[10.5px] text-brand-600 hover:underline dark:text-brand-400"
                  onClick={() => setShowSource((v) => !v)}
                >
                  {showSource ? '返回编辑' : '查看 HTML 源码'}
                </button>
                <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px]" onClick={copyHtml}>
                  <Copy className="h-3 w-3" /> 复制 HTML
                </Button>
              </div>
            </div>

            {showSource ? (
              <pre className="mt-2 max-h-[220px] overflow-auto rounded-lg border border-line bg-canvas px-4 py-3 font-mono text-[10.5px] leading-relaxed text-muted">
                <code>{html || '<!-- 在编辑器输入内容后这里会显示 HTML -->'}</code>
              </pre>
            ) : null}
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <DemoBlock
            id="rich-spec"
            title="能力清单"
            desc="execCommand 覆盖的格式操作与适用边界"
            code={`document.execCommand('bold')
document.execCommand('formatBlock', false, 'h1')
document.execCommand('createLink', false, url)
document.queryCommandState('bold')  // 激活态`}
          >
            <div className="space-y-2">
              {[
                ['标题/引用', 'formatBlock：h1 / h2 / blockquote'],
                ['强调', 'bold / italic / underline / strikeThrough'],
                ['列表', 'insertUnorderedList / insertOrderedList'],
                ['对齐', 'justifyLeft / Center / Right'],
                ['插入', 'createLink / insertHorizontalRule'],
                ['历史', 'undo / redo（浏览器原生栈）'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-line px-3.5 py-2.5">
                  <div className="text-[11.5px] font-medium text-ink">{k}</div>
                  <div className="mt-0.5 font-mono text-[9.5px] text-muted">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 dark:border-amber-500/30 dark:bg-amber-500/10">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-[10px] leading-relaxed text-amber-700 dark:text-amber-300">
                execCommand 已进入维护态但全浏览器可用，适合后台富文本场景；
                产品级编辑器建议换 Lexical / TipTap（本页为零依赖演示等价能力）。
              </p>
            </div>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
