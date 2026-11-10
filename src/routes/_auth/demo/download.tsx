import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import { FileJson, FileSpreadsheet, FileText, HardDriveDownload } from 'lucide-react'
import { http } from '@/lib/http'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_auth/demo/download')({
  component: Page,
})

/** 前端生成内容并触发下载（Blob + createObjectURL） */
function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  toast.success(`已下载 ${filename}`)
}

function Page() {
  const [serverLoading, setServerLoading] = React.useState(false)

  const downloadFromServer = async () => {
    setServerLoading(true)
    try {
      await http.download('/exports/report', 'apex-export-demo.txt')
      toast.success('服务端文件已下载')
    } catch {
      toast.error('下载失败，请重试')
    } finally {
      setServerLoading(false)
    }
  }

  const now = new Date().toISOString()

  return (
    <>
      <PageHeader
        eyebrow={<span>演示 › 功能</span>}
        title="文件下载"
        description="两种来源：前端生成（Blob 落盘，零请求）与服务端文件（http.download 走传输层）。"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <DemoBlock
            title="① 前端生成 · Blob 下载"
            desc="内容在浏览器里现做现下：TXT / JSON / CSV 三种常见格式，不产生任何网络请求"
            code={`const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'report.csv'
a.click()
URL.revokeObjectURL(url)  // 及时释放`}
          >
            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="outline"
                onClick={() =>
                  downloadBlob(
                    `Apex Admin 前端生成下载演示\n生成时间：${now}\n内容均为浏览器本地生成，未发起请求。`,
                    'apex-demo.txt',
                    'text/plain;charset=utf-8',
                  )
                }
              >
                <FileText className="h-3.5 w-3.5" />
                下载 TXT
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadBlob(
                    JSON.stringify({ app: 'Apex Admin', generatedAt: now, mode: 'client-blob', items: [1, 2, 3] }, null, 2),
                    'apex-demo.json',
                    'application/json',
                  )
                }
              >
                <FileJson className="h-3.5 w-3.5" />
                下载 JSON
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadBlob(
                    '\uFEFF任务,负责人,状态\n图像超分,林小满,运行中\n语音转写,赵子昂,排队中\n数据清洗,陈默,已完成\n',
                    'apex-demo.csv',
                    'text/csv;charset=utf-8',
                  )
                }
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                下载 CSV
              </Button>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-soft">
              CSV 前面加 <code className="font-mono">{'\\uFEFF'}</code>（BOM）是 Excel 打开中文不乱码的关键。
            </p>
          </DemoBlock>
        </div>

        <div className="col-span-5">
          <DemoBlock
            title="② 服务端文件 · http.download"
            desc="传输层统一封装：live 模式 axios 以 Blob 接收后落盘，mock 模式返回模拟内容"
          >
            <Button onClick={downloadFromServer} disabled={serverLoading}>
              <HardDriveDownload className="h-3.5 w-3.5" />
              {serverLoading ? '下载中…' : '下载服务端文件'}
            </Button>
            <p className="mt-3 text-[11px] leading-relaxed text-soft">
              请求地址经 <code className="font-mono">src/api/modules</code> 统一管理，
              需要进度回调或鉴权头时直接用 <code className="font-mono">http.raw</code> 自定义。
              大文件分片下载同理在传输层扩展。
            </p>
          </DemoBlock>
        </div>
      </div>
    </>
  )
}
