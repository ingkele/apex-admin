/**
 * 示例页共用演示数据 —— 「列表 CRUD」「状态占位」两个子页都基于同一份任务记录，
 * 集中在此避免两处各写一份导致字段对不上。
 */

export interface RecordRow {
  id: string
  name: string
  type: string
  status: string
  owner: string
  createdAt: string
}

export const INITIAL_ROWS: RecordRow[] = [
  { id: 'task_2b7e04dd', name: '产品手册向量化', type: '文档处理', status: 'running', owner: '陈昊', createdAt: '11-08 14:32' },
  { id: 'task_8f1c90ab', name: '客服问答模型微调', type: '模型微调', status: 'success', owner: '林晓', createdAt: '11-08 11:05' },
  { id: 'task_5d3e77c2', name: '周报摘要生成', type: '文本生成', status: 'failed', owner: '周可', createdAt: '11-07 22:18' },
  { id: 'task_1a9b44f0', name: '知识库增量同步', type: '数据同步', status: 'queued', owner: '苏禾', createdAt: '11-07 20:44' },
  { id: 'task_c72d10ee', name: '合同关键信息抽取', type: '信息抽取', status: 'success', owner: '赵岚', createdAt: '11-07 16:02' },
  { id: 'task_44e81b6d', name: '质检图片打标', type: '图像处理', status: 'running', owner: '王宁', createdAt: '11-07 09:26' },
  { id: 'task_9037aa51', name: '日志异常聚类', type: '数据分析', status: 'success', owner: '李思', createdAt: '11-06 21:15' },
  { id: 'task_be1029c8', name: '发票识别批处理', type: '信息抽取', status: 'cancelled', owner: '陈昊', createdAt: '11-06 15:40' },
]

export const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: 'running', label: '运行中' },
  { value: 'success', label: '已完成' },
  { value: 'failed', label: '失败' },
  { value: 'queued', label: '排队中' },
]
