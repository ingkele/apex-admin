/**
 * Mock 数据库 —— 模板阶段的数据真源（演示数据，字段与 .NET DTO camelCase 对齐）。
 * 对接真后端时整体替换为 API 调用，页面代码不动。
 */

export type TaskStatus = 'running' | 'success' | 'failed' | 'queued' | 'cancelled'

export interface TaskProgress {
  /** 当前步骤说明：正在处理第 4 / 6 批文档 */
  step: string
  /** 明细：已向量化 84,120 / 124,600 个文本块 · 预计剩余 00:12:40 */
  detail: string
  throughput: string
  throughputUnit: string
  elapsed: string
  percent: number
}

export interface TaskParam {
  key: string
  value: string
  source: string
  /** 布尔值以绿色标签展示 */
  isBool?: boolean
}

export interface Task {
  id: string
  name: string
  status: TaskStatus
  type: string
  model: string
  submitter: string
  durationSec: number
  createdAt: string
  failReason?: string
  input?: Record<string, unknown>
  metrics?: { gpu: number; tokens: number; cost: number }
  timeline?: { label: string; at: string; state: 'done' | 'current' | 'pending'; note?: string }[]
  /** 详情页：优先级 / 队列 / 环境 / 重试 / 超时 / 开始时间 */
  priority?: string
  queue?: string
  env?: string
  retries?: string
  timeout?: string
  startedAt?: string
  progress?: TaskProgress
  params?: TaskParam[]
}

export type ServiceHealth = 'healthy' | 'warn' | 'maintenance' | 'down'

export interface ServiceItem {
  id: string
  name: string
  /** 卡片副标题：命名空间 · 中文定位 */
  desc: string
  ns: 'prod' | 'observability'
  version: string
  instances: [number, number]
  health: ServiceHealth
  cpu: number
  memory: number
  uptime: string
  endpoint: string
  /** 行首彩色图标（lucide 名称） */
  icon: string
}

export interface ModelItem {
  id: string
  name: string
  modelId: string
  provider: string
  status: 'enabled' | 'disabled'
  isDefault: boolean
  contextWindow: number
  callsToday: number
  updatedAt: string
  params: { temperature: number; maxTokens: number; topP: number }
}

export interface ApiKeyItem {
  id: string
  name: string
  maskedKey: string
  createdAt: string
  status: 'active' | 'revoked'
  callsMonth: number
  lastUsedAt: string
  owner: string
  env: 'prod' | 'staging' | 'dev'
  /** 剩余有效天数（缺省 = 长期有效） */
  expiresInDays?: number
}

export interface UserItem {
  id: string
  name: string
  email: string
  /** 多角色（一人可兼多角色） */
  roles: string[]
  /** 副标题：usr_0001 · 平台负责人 */
  sub: string
  status: 'active' | 'invited' | 'disabled'
  lastLoginAt: string
}

export interface RoleItem {
  id: string
  name: string
  desc: string
  permissions: number
  members: number
  builtin: boolean
  /** 角色图标（lucide 名称）+ 色系 */
  icon: 'crown' | 'server' | 'brain' | 'scan' | 'eye'
  tone: 'brand' | 'cyan' | 'violet' | 'amber' | 'slate'
}

export interface AuditItem {
  id: string
  at: string
  operator: string
  ip: string
  action: string
  target: string
  result: 'success' | 'fail'
  risk: 'low' | 'medium' | 'high'
  detail: string
}

export interface LogLine {
  at: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  service: string
  /** trace=xxxx，无链路时为 trace=-- */
  trace: string
  message: string
}

const now = Date.now()
const ago = (min: number) => new Date(now - min * 60_000).toISOString()
const dayAgo = (d: number, h = 9) => new Date(now - d * 86400_000).setHours(h, 12, 0, 0) && new Date(now - d * 86400_000 + h * 3600_000).toISOString()

export const tasks: Task[] = [
  {
    id: 'tsk_8f3a91c2', name: '年度财报摘要生成', status: 'failed', type: '批处理推理', model: 'gpt-4o',
    submitter: '林晓', durationSec: 34, createdAt: ago(12), failReason: 'Upstream timeout after 30s',
    input: { files: ['财报-2025-全年.pdf'], language: 'zh-CN', maxWords: 2000 },
    metrics: { gpu: 0, tokens: 12840, cost: 0.42 },
  },
  {
    id: 'tsk_2b7e04dd', name: '客服知识库向量化', status: 'running', type: 'Embedding / 批处理', model: 'text-embedding-3-large',
    submitter: '周可', durationSec: 206, createdAt: ago(68),
    input: { corpus: '客服知识库 v3', chunkSize: 512, batchSize: 256 },
    metrics: { gpu: 1, tokens: 1240000, cost: 3.18 },
    priority: '高优先级',
    queue: 'embedding-prod',
    env: '生产环境 · cn-east',
    retries: '0 / 3',
    timeout: '1800s',
    startedAt: '2026-11-08 08:31:28',
    progress: {
      step: '正在处理第 4 / 6 批文档',
      detail: '已向量化 84,120 / 124,600 个文本块 · 预计剩余 00:12:40',
      throughput: '1,284',
      throughputUnit: 'chunks/s',
      elapsed: '00:03:26',
      percent: 67.5,
    },
    params: [
      { key: 'model', value: 'text-embedding-3-large', source: '任务配置' },
      { key: 'dimensions', value: '3072', source: '任务配置' },
      { key: 'batch_size', value: '256', source: '任务配置' },
      { key: 'source_uri', value: 'oss://apex-kb/customer-service/2026-11/*.md', source: '输入数据' },
      { key: 'overwrite', value: 'true', source: '任务配置', isBool: true },
      { key: 'api_key', value: 'sk-••••••••••••••••7f2a', source: '密钥引用' },
    ],
    timeline: [
      { label: '任务已提交', at: '08:31:24', state: 'done' },
      { label: '调度器分配完成', at: '08:31:28', state: 'done', note: '4s' },
      { label: '向量化执行中', at: '08:31:30', state: 'current', note: '进行中' },
      { label: '写入向量库', at: '', state: 'pending', note: '等待执行' },
    ],
  },
  { id: 'tsk_5c1d90aa', name: '合同要素抽取（11 月批次）', status: 'running', type: '信息抽取', model: 'claude-sonnet-4', submitter: '王悦', durationSec: 611, createdAt: ago(22) },
  { id: 'tsk_71ba33f0', name: '产品图生图 · 营销素材', status: 'running', type: '图像生成', model: 'flux-1.1-pro', submitter: '赵一鸣', durationSec: 132, createdAt: ago(14) },
  { id: 'tsk_93e2c1b7', name: '每日舆情摘要', status: 'queued', type: '定时任务', model: 'gpt-4o-mini', submitter: '系统', durationSec: 0, createdAt: ago(5) },
  { id: 'tsk_a4f7d2e1', name: '多语言文档翻译（英→中）', status: 'success', type: '翻译', model: 'gpt-4o', submitter: '周敏', durationSec: 96, createdAt: ago(140) },
  { id: 'tsk_b8e1f4c3', name: 'SQL 生成与校验', status: 'success', type: '代码辅助', model: 'deepseek-v3', submitter: '陈昊', durationSec: 27, createdAt: ago(190) },
  { id: 'tsk_c2a9e8d5', name: '培训视频字幕生成', status: 'failed', type: '语音转写', model: 'whisper-large-v3', submitter: '林晓', durationSec: 415, createdAt: ago(260), failReason: '音频源文件损坏（无法解码）' },
  { id: 'tsk_d7b3a1f6', name: '用户反馈情感分析（10 月）', status: 'success', type: '批处理推理', model: 'gpt-4o-mini', submitter: '王悦', durationSec: 322, createdAt: ago(380) },
  { id: 'tsk_e5c8b2a9', name: '知识库问答评测集构建', status: 'queued', type: 'Embedding', model: 'text-embedding-3-large', submitter: '系统', durationSec: 0, createdAt: ago(3) },
  { id: 'tsk_6c11d9a4', name: '营销素材多模态审核', status: 'failed', type: '多模态', model: 'gpt-4o', submitter: '苏禾', durationSec: 58, createdAt: ago(53), failReason: 'Invalid image format: heic' },
  { id: 'tsk_f4b2a9d7', name: '知识库增量重嵌入', status: 'failed', type: 'Embedding', model: 'text-embedding-3-large', submitter: '周可', durationSec: 172, createdAt: ago(37), failReason: 'Token limit exceeded: 131072' },
  { id: 'tsk_9d8e7f60', name: '语音质检批量转写', status: 'failed', type: '语音转写', model: 'whisper-large-v3', submitter: '王悦', durationSec: 233, createdAt: ago(96), failReason: 'Audio decode failed: codec unsupported' },
  { id: 'tsk_3a4b5c6d', name: '合同条款比对 · 11 月', status: 'failed', type: '信息抽取', model: 'claude-sonnet-4', submitter: '陈昊', durationSec: 143, createdAt: ago(150), failReason: 'JSON schema validation error at field "parties"' },
]

export const taskSummary = { total: 128, running: 12, failed: 6, queued: 7 }

/** 工作台 4 张统计卡（与原型逐值一致） */
export const dashboardStats = {
  today: {
    value: 1284, yesterday: 1142, delta: '+12.4%', trend: 'up' as const,
    bars: [12, 16, 14, 20, 18, 24, 28],
  },
  success: {
    value: 98.6, target: 98.0, delta: '+0.8%', trend: 'up' as const,
    note: '近 7 日稳定', verdict: '高于基线',
  },
  failed: {
    value: 18, compare: '较昨日减少 5 个', delta: '-22.1%', trend: 'down' as const,
    pending: 6, oldest: '最快 12 分钟前',
  },
  running: {
    value: 42, queue: 7,
    breakdown: [
      { label: '推理', value: 12 },
      { label: '批处理', value: 21 },
      { label: '微调', value: 9 },
    ],
  },
}

/** 工作台服务健康 6 宫格（与原型逐值一致） */
export type HealthTone = 'ok' | 'warn' | 'down'

export const dashboardHealth: { name: string; metric: string; value: string; tone: HealthTone }[] = [
  { name: 'gateway-api', metric: '延迟', value: '38 ms', tone: 'ok' },
  { name: 'inference-core', metric: 'P95', value: '842 ms', tone: 'ok' },
  { name: 'task-scheduler', metric: '队列', value: '7 jobs', tone: 'ok' },
  { name: 'vector-db', metric: '磁盘', value: '78%', tone: 'warn' },
  { name: 'billing-worker', metric: '吞吐', value: '1.2k/m', tone: 'ok' },
  { name: 'observability', metric: '日志延迟', value: '1.4 s', tone: 'ok' },
]

export const taskTrend = [
  { day: '11-02', total: 962, success: 942, failed: 3 },
  { day: '11-03', total: 978, success: 951, failed: 5 },
  { day: '11-04', total: 953, success: 947, failed: 2 },
  { day: '11-05', total: 1126, success: 1118, failed: 6 },
  { day: '11-06', total: 1154, success: 1147, failed: 4 },
  { day: '11-07', total: 1183, success: 1175, failed: 8 },
  { day: '11-08', total: 1254, success: 1248, failed: 6 },
]

export const services: ServiceItem[] = [
  { id: 'svc_gateway', name: 'gateway-api', desc: 'prod · 入口网关', ns: 'prod', version: 'v2.8.4', instances: [6, 6], health: 'healthy', cpu: 34, memory: 62, uptime: '14d 8h', endpoint: 'https://gateway.apex.internal', icon: 'route' },
  { id: 'svc_infer', name: 'inference-core', desc: 'prod · 推理引擎', ns: 'prod', version: 'v4.2.1', instances: [12, 12], health: 'healthy', cpu: 71, memory: 78, uptime: '9d 2h', endpoint: 'https://infer.apex.internal', icon: 'cpu' },
  { id: 'svc_sch', name: 'task-scheduler', desc: 'prod · 任务调度', ns: 'prod', version: 'v3.1.0', instances: [4, 4], health: 'healthy', cpu: 45, memory: 51, uptime: '14d 8h', endpoint: 'https://scheduler.apex.internal', icon: 'workflow' },
  { id: 'svc_embed', name: 'embedding-worker', desc: 'prod · 向量计算', ns: 'prod', version: 'v2.6.3', instances: [8, 8], health: 'healthy', cpu: 52, memory: 47, uptime: '6d 3h', endpoint: 'https://embed.apex.internal', icon: 'blocks' },
  { id: 'svc_vector', name: 'vector-db', desc: 'prod · 向量存储', ns: 'prod', version: 'v1.9.2', instances: [3, 3], health: 'warn', cpu: 76, memory: 81, uptime: '31d 4h', endpoint: 'https://vector.apex.internal', icon: 'database' },
  { id: 'svc_billing', name: 'billing-worker', desc: 'prod · 计费任务', ns: 'prod', version: 'v2.0.8', instances: [2, 2], health: 'healthy', cpu: 18, memory: 33, uptime: '21d 7h', endpoint: 'https://billing.apex.internal', icon: 'receipt-text' },
  { id: 'svc_obs', name: 'observability', desc: 'observability · 监控告警', ns: 'observability', version: 'v5.0.1', instances: [4, 4], health: 'healthy', cpu: 26, memory: 44, uptime: '12d 1h', endpoint: 'https://obs.apex.internal', icon: 'activity' },
  { id: 'svc_registry', name: 'model-registry', desc: 'prod · 模型仓库', ns: 'prod', version: 'v1.4.7', instances: [2, 2], health: 'maintenance', cpu: 4, memory: 12, uptime: '2d 6h', endpoint: 'https://registry.apex.internal', icon: 'package-search' },
]

export const serviceStats = { total: 8, healthy: 6, abnormal: 2, availability: 99.98, namespaces: 6 }

export const logLines: LogLine[] = [
  { at: '08:34:18.092', level: 'INFO', service: 'gateway-api', trace: 'trace=9f2a1c', message: 'POST /v1/chat/completions 200 in 842ms user=usr_8fa2 route=canary' },
  { at: '08:34:18.114', level: 'INFO', service: 'inference-core', trace: 'trace=9f2a1c', message: 'request accepted model=gpt-4o tokens_in=2841 stream=true node=infer-07' },
  { at: '08:34:18.203', level: 'DEBUG', service: 'task-scheduler', trace: 'trace=71bb0e', message: 'poll queue embedding-prod, pending=7 active=42 concurrency=64' },
  { at: '08:34:18.441', level: 'WARN', service: 'vector-db', trace: 'trace=--', message: 'disk usage reached 78%, compaction recommended for collection kb_customer_service_v3' },
  { at: '08:34:19.015', level: 'INFO', service: 'inference-core', trace: 'trace=9f2a1c', message: 'first token emitted in 218ms, output_tokens=642, finish_reason=stop' },
  { at: '08:34:19.028', level: 'INFO', service: 'gateway-api', trace: 'trace=9f2a1c', message: 'response stream completed status=200 bytes=18420 duration=936ms' },
  { at: '08:34:21.507', level: 'ERROR', service: 'inference-core', trace: 'trace=2c8d10', message: 'upstream connect timeout after 30000ms endpoint=api.openai-proxy.internal retry=1/2' },
  { at: '08:34:22.194', level: 'INFO', service: 'task-scheduler', trace: 'trace=71bb0e', message: 'task tsk_2b7e04dd dispatched to worker-embedding-03, attempt=1' },
  { at: '08:34:22.366', level: 'DEBUG', service: 'gateway-api', trace: 'trace=--', message: 'rate_limiter bucket=usr_8fa2 remaining=1472 reset=42s' },
  { at: '08:34:23.902', level: 'INFO', service: 'vector-db', trace: 'trace=71bb0e', message: 'upsert collection=kb_customer_service_v3 vectors=256 shard=sh-03 latency=18ms' },
  { at: '08:34:24.220', level: 'INFO', service: 'inference-core', trace: 'trace=71bb0e', message: 'embedding batch complete index=39 chunks=12288 tokens=131072 elapsed=1.46s' },
  { at: '08:34:25.031', level: 'WARN', service: 'gateway-api', trace: 'trace=3e90aa', message: 'client disconnected before response completed route=/v1/embeddings client_ip=10.24.8.12' },
  { at: '08:34:26.709', level: 'INFO', service: 'task-scheduler', trace: 'trace=--', message: 'checkpoint saved task=tsk_2b7e04dd progress=67.5% chunks=84120' },
  { at: '08:34:27.114', level: 'ERROR', service: 'vector-db', trace: 'trace=4a70dd', message: 'compaction rejected: concurrent upsert in progress shard=sh-05 retry_after=5s' },
  { at: '08:34:28.442', level: 'INFO', service: 'gateway-api', trace: 'trace=--', message: 'GET /healthz 200 in 2ms upstream=ready' },
  { at: '08:34:31.029', level: 'INFO', service: 'task-scheduler', trace: 'trace=--', message: 'queue stats embedding-prod pending=7 running=42 completed_1h=1284 failed_1h=18' },
  { at: '08:34:32.587', level: 'WARN', service: 'inference-core', trace: 'trace=8be114', message: 'adaptive throttle enabled reason=upstream_rate_limit factor=0.82' },
  { at: '08:34:34.003', level: 'INFO', service: 'gateway-api', trace: 'trace=--', message: 'canary rollout gateway-api v2.8.4 healthy: 6/6 pods ready' },
]

/** 日志页顶部 4 卡（原型为小时级聚合值，不从 18 行明细推导） */
export const logStats = {
  throughput: '1.8k',
  throughputUnit: '条/分钟',
  errorFatal: 3,
  errorDelta: '较上小时 +1',
  warn: 12,
  warnAttention: 2,
  latency: '1.4',
  latencyNote: '秒 · P95',
}

export const models: ModelItem[] = [
  { id: 'md_gpt4o', name: 'GPT-4o', modelId: 'gpt-4o-2024-11-20', provider: 'OpenAI', status: 'enabled', isDefault: true, contextWindow: 128000, callsToday: 24510, updatedAt: '11-08 08:20', params: { temperature: 0.7, maxTokens: 4096, topP: 1 } },
  { id: 'md_claude', name: 'Claude Sonnet 4', modelId: 'claude-sonnet-4-20250514', provider: 'Anthropic', status: 'enabled', isDefault: false, contextWindow: 200000, callsToday: 12460, updatedAt: '11-08 07:56', params: { temperature: 0.6, maxTokens: 8192, topP: 0.95 } },
  { id: 'md_qwen', name: 'Qwen2.5-72B', modelId: 'qwen2.5-72b-instruct', provider: '阿里云百炼', status: 'enabled', isDefault: false, contextWindow: 131072, callsToday: 7209, updatedAt: '11-07 22:41', params: { temperature: 0.7, maxTokens: 4096, topP: 1 } },
  { id: 'md_ds', name: 'DeepSeek-V3', modelId: 'deepseek-chat', provider: 'DeepSeek', status: 'enabled', isDefault: false, contextWindow: 64000, callsToday: 3128, updatedAt: '11-07 18:03', params: { temperature: 0.7, maxTokens: 4096, topP: 1 } },
  { id: 'md_gemini', name: 'Gemini 2.0 Flash', modelId: 'gemini-2.0-flash-exp', provider: 'Google Cloud', status: 'disabled', isDefault: false, contextWindow: 1000000, callsToday: 412, updatedAt: '11-06 09:15', params: { temperature: 0.8, maxTokens: 8192, topP: 1 } },
  { id: 'md_apex', name: 'Apex-Embed-7B', modelId: 'apex-embed-7b-v2', provider: '内部部署', status: 'enabled', isDefault: false, contextWindow: 8192, callsToday: 1200, updatedAt: '11-08 06:30', params: { temperature: 0, maxTokens: 0, topP: 1 } },
]

export const apiKeys: ApiKeyItem[] = [
  { id: 'key_01', name: '生产数据管道', maskedKey: 'sk-live-••••••••••f8a2', createdAt: '2026-10-12 14:08', status: 'active', callsMonth: 1240000, lastUsedAt: ago(2), owner: '陈昊', env: 'prod' },
  { id: 'key_02', name: '评测流水线', maskedKey: 'sk-live-••••••••••9c31', createdAt: '2026-10-26 09:32', status: 'active', callsMonth: 842500, lastUsedAt: ago(60), owner: '周可', env: 'staging' },
  { id: 'key_03', name: '客服分析服务', maskedKey: 'sk-live-••••••••••a044', createdAt: '2026-09-18 16:21', status: 'active', callsMonth: 318200, lastUsedAt: ago(180), owner: '林晓', env: 'prod' },
  { id: 'key_04', name: '历史数据迁移', maskedKey: 'sk-test-••••••••••c01d', createdAt: '2026-08-02 11:05', status: 'active', callsMonth: 12800, lastUsedAt: ago(1080), owner: '许知远', env: 'dev', expiresInDays: 7 },
  { id: 'key_05', name: '旧统计表回滚', maskedKey: 'sk-live-••••••••••88de', createdAt: '2026-06-14 18:12', status: 'revoked', callsMonth: 0, lastUsedAt: '2026-09-30 08:09', owner: '苏禾', env: 'prod' },
]

export const users: UserItem[] = [
  { id: 'usr_0001', name: '陈昊', sub: 'usr_0001 · 平台负责人', email: 'chenhao@apex.ai', roles: ['超级管理员'], status: 'active', lastLoginAt: '今天 08:12' },
  { id: 'usr_0042', name: '林晓', sub: 'usr_0042 · AI 应用组', email: 'linxiao@apex.ai', roles: ['模型工程师'], status: 'active', lastLoginAt: '今天 07:58' },
  { id: 'usr_0051', name: '周可', sub: 'usr_0051 · SRE', email: 'zhouke@apex.ai', roles: ['平台运维'], status: 'active', lastLoginAt: '今天 07:41' },
  { id: 'usr_0063', name: '苏禾', sub: 'usr_0063 · 安全合规', email: 'suhe@apex.ai', roles: ['审计员', '模型工程师'], status: 'active', lastLoginAt: '昨天 19:22' },
  { id: 'usr_0089', name: '赵岚', sub: 'usr_0089 · 基础架构', email: 'zhaolan@apex.ai', roles: ['平台运维', '审计员'], status: 'active', lastLoginAt: '昨天 16:40' },
  { id: 'usr_0102', name: '王宁', sub: 'usr_0102 · 待加入', email: 'wangning@apex.ai', roles: ['只读访客'], status: 'invited', lastLoginAt: '尚未登录' },
  { id: 'usr_0110', name: '李思', sub: 'usr_0110 · 实习', email: 'lisi@apex.ai', roles: ['只读访客'], status: 'disabled', lastLoginAt: '10-21 11:02' },
]

export const userStats = { total: 48, active: 42, invited: 3, disabled: 6, admin: 6 }

export const roles: RoleItem[] = [
  {
    id: 'role_admin', name: '超级管理员',
    desc: '拥有平台全部权限，可管理所有资源、成员和系统配置。',
    permissions: 26, members: 6, builtin: true, icon: 'crown', tone: 'brand',
  },
  {
    id: 'role_ops', name: '平台运维',
    desc: '负责服务部署、监控与故障处置，可执行重启等高危运维操作。',
    permissions: 15, members: 8, builtin: true, icon: 'server', tone: 'cyan',
  },
  {
    id: 'role_ml', name: '模型工程师',
    desc: '管理模型接入、参数调优与密钥签发，可查看任务执行明细。',
    permissions: 13, members: 14, builtin: true, icon: 'brain', tone: 'violet',
  },
  {
    id: 'role_audit', name: '审计员',
    desc: '只读访问任务、服务与审计记录，用于合规检查与追溯。',
    permissions: 9, members: 4, builtin: true, icon: 'scan', tone: 'amber',
  },
  {
    id: 'role_guest', name: '只读访客',
    desc: '仅可浏览平台概览、任务列表与服务状态，不可执行任何写操作。',
    permissions: 3, members: 16, builtin: true, icon: 'eye', tone: 'slate',
  },
]

export const auditLogs: AuditItem[] = [
  { id: 'aud_1024', at: '2026-11-08 14:32:11', operator: '陈昊', ip: '203.0.113.18', action: '修改系统参数', target: '安全策略 · 会话超时 30m→45m', result: 'success', risk: 'high', detail: 'settings.security.sessionTimeout: 30 → 45' },
  { id: 'aud_1023', at: '2026-11-08 14:28:02', operator: '林晓', ip: '203.0.113.44', action: '重启服务', target: 'embedding-service prod', result: 'success', risk: 'high', detail: 'rolling restart, 4 instances' },
  { id: 'aud_1022', at: '2026-11-08 13:55:47', operator: '系统', ip: '10.0.2.5', action: '自动扩容', target: 'task-worker 10→12 实例', result: 'success', risk: 'low', detail: 'HPA: cpu > 70% for 5m' },
  { id: 'aud_1021', at: '2026-11-08 11:20:16', operator: '王悦', ip: '203.0.113.52', action: '创建 API Key', target: 'BI 报表助手', result: 'success', risk: 'medium', detail: 'key_03, scope: inference' },
  { id: 'aud_1020', at: '2026-11-08 10:47:33', operator: '赵一鸣', ip: '203.0.113.61', action: '修改模型参数', target: 'Claude Sonnet 4 · temperature', result: 'success', risk: 'medium', detail: 'temperature: 0.7 → 0.6' },
  { id: 'aud_1019', at: '2026-11-08 09:31:08', operator: '李思', ip: '198.51.100.7', action: '登录失败', target: '认证服务', result: 'fail', risk: 'high', detail: 'bad credentials × 3, account locked 15m' },
  { id: 'aud_1018', at: '2026-11-08 08:12:55', operator: '陈昊', ip: '203.0.113.18', action: '登录', target: '认证服务', result: 'success', risk: 'low', detail: 'password + TOTP' },
  { id: 'aud_1017', at: '2026-11-07 22:04:12', operator: '周敏', ip: '203.0.113.33', action: '导出审计日志', target: '2026-10 全量', result: 'success', risk: 'medium', detail: '365d retention, 1,022 records' },
]

export const auditStats = { total: 1284, highRisk: 6, failed: 3, retentionDays: 365 }

export type SettingType = 'text' | 'number' | 'switch' | 'select' | 'url' | 'textarea' | 'time' | 'timerange' | 'checks'

export interface SettingItem {
  key: string
  label: string
  value: string
  type: SettingType
  /** 字段下方说明文字 */
  desc?: string
  options?: string[]
  /** 数字字段右侧单位 */
  unit?: string
  placeholder?: string
  required?: boolean
  /** 输入框内右侧状态徽章（HTTPS 已启用） */
  inlineBadge?: string
  /** 占满整行 */
  full?: boolean
  /** 行内开关卡片（标题 + 说明 + 右侧开关） */
  row?: boolean
  /** 输入框右侧带「测试」按钮（Webhook 等） */
  testable?: boolean
}

export type Settings = Record<string, SettingItem[]>

export const settings: Settings = {
  基础参数: [
    { key: 'platformName', label: '平台名称', value: 'Apex AI 平台', type: 'text', required: true, desc: '显示在浏览器标题、登录页与通知邮件中。' },
    { key: 'platformShort', label: '平台简称', value: 'Apex Admin', type: 'text', desc: '建议不超过 16 个字符，用于侧边栏品牌区。' },
    { key: 'timezone', label: '默认时区', value: '(UTC+08:00) 中国标准时间 · 上海', type: 'select', options: ['(UTC+08:00) 中国标准时间 · 上海', '(UTC+09:00) 日本标准时间 · 东京', '(UTC+00:00) 协调世界时 · UTC', '(UTC-08:00) 太平洋时间 · 洛杉矶'] },
    { key: 'locale', label: '默认语言', value: '简体中文', type: 'select', options: ['简体中文', 'English', '日本語'] },
    { key: 'consoleUrl', label: '控制台地址', value: 'https://console.apex.ai', type: 'url', full: true, inlineBadge: 'HTTPS 已启用' },
    { key: 'workspaceDesc', label: '工作区描述', value: '面向企业 AI 应用的任务编排、模型接入与运行时治理平台。', type: 'textarea', full: true },
    { key: 'concurrency', label: '默认任务并发上限', value: '24', type: 'number', unit: '个 / 工作区', desc: '超出后任务将进入排队状态。' },
    { key: 'retention', label: '任务数据保留时长', value: '90 天', type: 'select', options: ['30 天', '90 天', '180 天', '365 天'], desc: '到期后执行记录与产物将被异步清理。' },
  ],
  安全参数: [
    { key: 'sessionTimeout', label: '会话超时时间', value: '60 分钟', type: 'select', options: ['30 分钟', '60 分钟', '4 小时', '8 小时'], desc: '超过时间无操作将要求重新登录。' },
    { key: 'passwordLength', label: '密码最小长度', value: '12 位', type: 'select', options: ['8 位', '10 位', '12 位', '16 位'], desc: '要求同时包含大小写字母、数字与符号。' },
    { key: 'mfaRequired', label: '强制多因素认证 (MFA)', value: 'true', type: 'switch', full: true, row: true, desc: '所有管理员账号登录时必须完成动态验证码校验。' },
    { key: 'lockCount', label: '登录失败锁定', value: '5 次', type: 'select', options: ['3 次', '5 次', '10 次'], desc: '连续失败后锁定账号 15 分钟。' },
    { key: 'keyValidity', label: 'API Key 最长有效期', value: '365 天', type: 'select', options: ['90 天', '180 天', '365 天', '永不过期'], desc: '创建密钥时不可超过此上限。' },
    { key: 'ipAllowlist', label: 'IP 白名单', value: '203.0.113.0/24\n198.51.100.18/32', type: 'textarea', full: true, placeholder: '每行一个 CIDR，例如 203.0.113.0/24', desc: '留空表示不限制来源 IP；保存后新登录即时生效。' },
    { key: 'keyExpiryAlert', label: '密钥到期提醒', value: 'true', type: 'switch', full: true, row: true, desc: '在密钥过期前 7 天向管理员发送邮件与站内通知。' },
    { key: 'sensitiveConfirm', label: '敏感操作二次确认', value: 'true', type: 'switch', full: true, row: true, desc: '重启服务、撤销密钥与修改安全策略前要求再次确认。' },
  ],
  通知参数: [
    { key: 'notifyEmails', label: '通知邮箱', value: 'ops@apex.ai, security@apex.ai', type: 'text', full: true, desc: '多个邮箱使用英文逗号分隔，建议配置团队邮件组。' },
    { key: 'webhook', label: 'Webhook 地址', value: 'https://hooks.apex.ai/notify/9f2a71c4', type: 'url', full: true, testable: true },
    {
      key: 'events', label: '订阅事件', type: 'checks', full: true,
      value: '任务执行失败,服务健康异常,密钥即将过期,高风险审计事件,周报摘要',
      options: ['任务执行失败', '服务健康异常', '密钥即将过期', '高风险审计事件', '模型调用量异常', '周报摘要'],
    },
    { key: 'quietHours', label: '静默时段', value: '22:00|08:00', type: 'timerange', desc: '静默期间仅高优先级告警会立即触达。' },
    { key: 'dailyDigest', label: '每日摘要', value: 'true', type: 'switch', desc: '每日 09:00 汇总' },
  ],
}

/* ============================ 菜单管理 ============================ */

export type MenuType = 'dir' | 'menu' | 'button'

export interface MenuNode {
  id: string
  name: string
  /** dir 目录 / menu 菜单 / button 按钮权限 */
  type: MenuType
  /** 权限标识（后端鉴权用） */
  perm?: string
  /** 路由地址（dir/menu 有） */
  path?: string
  /** 页面组件路径 */
  component?: string
  /** lucide 图标名 */
  icon?: string
  sort: number
  status: 'active' | 'hidden'
  parentId: string | null
  /** 备注 */
  remark?: string
}

export const systemMenus: MenuNode[] = [
  { id: 'm_dash', name: '概览', type: 'dir', path: '/dashboard', icon: 'dashboard', sort: 1, status: 'active', parentId: null, remark: '平台概览与个人工作台' },
  { id: 'm_dash_home', name: '工作台', type: 'menu', perm: 'dashboard:view', path: '/dashboard', component: 'dashboard/index', icon: 'dashboard', sort: 1, status: 'active', parentId: 'm_dash' },
  { id: 'm_task', name: '任务中心', type: 'dir', path: '/tasks', icon: 'tasks', sort: 2, status: 'active', parentId: null, remark: '任务编排与执行记录' },
  { id: 'm_task_list', name: '任务列表', type: 'menu', perm: 'task:view', path: '/tasks', component: 'tasks/index', icon: 'tasks', sort: 1, status: 'active', parentId: 'm_task' },
  { id: 'm_task_detail', name: '任务详情', type: 'menu', perm: 'task:detail', path: '/tasks/:id', component: 'tasks/detail', sort: 2, status: 'hidden', parentId: 'm_task', remark: '详情页不进菜单，仅路由可达' },
  { id: 'm_task_retry', name: '重试任务', type: 'button', perm: 'task:retry', sort: 3, status: 'active', parentId: 'm_task' },
  { id: 'm_task_cancel', name: '取消任务', type: 'button', perm: 'task:cancel', sort: 4, status: 'active', parentId: 'm_task' },
  { id: 'm_svc', name: '服务管理', type: 'dir', path: '/services', icon: 'services', sort: 3, status: 'active', parentId: null, remark: '在线服务与运行日志' },
  { id: 'm_svc_list', name: '服务列表', type: 'menu', perm: 'service:view', path: '/services', component: 'services/index', icon: 'services', sort: 1, status: 'active', parentId: 'm_svc' },
  { id: 'm_svc_log', name: '服务日志', type: 'menu', perm: 'service:log', path: '/services/logs', component: 'services/logs', icon: 'terminal', sort: 2, status: 'active', parentId: 'm_svc' },
  { id: 'm_svc_restart', name: '重启服务', type: 'button', perm: 'service:restart', sort: 3, status: 'active', parentId: 'm_svc' },
  { id: 'm_svc_stop', name: '停止服务', type: 'button', perm: 'service:stop', sort: 4, status: 'active', parentId: 'm_svc' },
  { id: 'm_model', name: '模型与密钥', type: 'dir', path: '/models', icon: 'models', sort: 4, status: 'active', parentId: null, remark: '模型接入与调用凭证' },
  { id: 'm_model_cfg', name: '模型配置', type: 'menu', perm: 'model:view', path: '/models', component: 'models/index', icon: 'models', sort: 1, status: 'active', parentId: 'm_model' },
  { id: 'm_model_keys', name: 'API Key', type: 'menu', perm: 'key:view', path: '/models/keys', component: 'models/keys', icon: 'keys', sort: 2, status: 'active', parentId: 'm_model' },
  { id: 'm_model_manage', name: '模型管理', type: 'button', perm: 'model:manage', sort: 3, status: 'active', parentId: 'm_model' },
  { id: 'm_key_manage', name: '密钥管理', type: 'button', perm: 'key:manage', sort: 4, status: 'active', parentId: 'm_model' },
  { id: 'm_sys', name: '系统管理', type: 'dir', path: '/system', icon: 'settings', sort: 5, status: 'active', parentId: null, remark: '成员、权限与平台配置' },
  { id: 'm_sys_user', name: '用户管理', type: 'menu', perm: 'user:view', path: '/system/users', component: 'system/users', icon: 'users', sort: 1, status: 'active', parentId: 'm_sys' },
  { id: 'm_sys_role', name: '角色权限', type: 'menu', perm: 'role:view', path: '/system/roles', component: 'system/roles', icon: 'roles', sort: 2, status: 'active', parentId: 'm_sys' },
  { id: 'm_sys_menu', name: '菜单管理', type: 'menu', perm: 'menu:view', path: '/system/menus', component: 'system/menus', icon: 'menu', sort: 3, status: 'active', parentId: 'm_sys' },
  { id: 'm_sys_dept', name: '部门管理', type: 'menu', perm: 'dept:view', path: '/system/depts', component: 'system/depts', icon: 'dept', sort: 4, status: 'active', parentId: 'm_sys' },
  { id: 'm_sys_dict', name: '字典管理', type: 'menu', perm: 'dict:view', path: '/system/dicts', component: 'system/dicts', icon: 'dict', sort: 5, status: 'active', parentId: 'm_sys' },
  { id: 'm_sys_audit', name: '审计日志', type: 'menu', perm: 'audit:view', path: '/system/audit', component: 'system/audit', icon: 'audit', sort: 6, status: 'active', parentId: 'm_sys' },
  { id: 'm_sys_setting', name: '系统参数', type: 'menu', perm: 'setting:view', path: '/system/settings', component: 'system/settings', icon: 'settings', sort: 7, status: 'active', parentId: 'm_sys' },
  { id: 'm_sys_user_manage', name: '成员管理', type: 'button', perm: 'user:manage', sort: 8, status: 'active', parentId: 'm_sys' },
  { id: 'm_sys_role_manage', name: '角色管理', type: 'button', perm: 'role:manage', sort: 9, status: 'active', parentId: 'm_sys' },
  { id: 'm_sys_menu_manage', name: '菜单维护', type: 'button', perm: 'menu:manage', sort: 10, status: 'active', parentId: 'm_sys' },
  { id: 'm_sys_dept_manage', name: '部门维护', type: 'button', perm: 'dept:manage', sort: 11, status: 'active', parentId: 'm_sys' },
  { id: 'm_sys_dict_manage', name: '字典维护', type: 'button', perm: 'dict:manage', sort: 12, status: 'active', parentId: 'm_sys' },
  { id: 'm_sys_setting_manage', name: '修改系统参数', type: 'button', perm: 'setting:manage', sort: 13, status: 'active', parentId: 'm_sys' },
]

export const menuStats = { total: systemMenus.length, dirs: 5, menus: 12, buttons: 12, hidden: 1 }

/* ============================ 部门管理 ============================ */

export interface DeptNode {
  id: string
  name: string
  /** 负责人 */
  owner: string
  members: number
  status: 'active' | 'disabled'
  sort: number
  parentId: string | null
  desc?: string
}

export const depts: DeptNode[] = [
  { id: 'd_root', name: 'Apex AI 平台', owner: '陈昊', members: 48, status: 'active', sort: 1, parentId: null, desc: '顶层组织，覆盖全部工作区' },
  { id: 'd_platform', name: '平台研发中心', owner: '陈昊', members: 18, status: 'active', sort: 1, parentId: 'd_root', desc: '任务编排、服务运行时与调度' },
  { id: 'd_infra', name: '基础架构组', owner: '赵岚', members: 7, status: 'active', sort: 1, parentId: 'd_platform', desc: 'K8s 集群、存储与网络' },
  { id: 'd_sre', name: 'SRE 组', owner: '周可', members: 5, status: 'active', sort: 2, parentId: 'd_platform', desc: '可用性保障与故障处置' },
  { id: 'd_ai', name: 'AI 应用组', owner: '林晓', members: 12, status: 'active', sort: 2, parentId: 'd_root', desc: '模型接入、推理优化与效果评测' },
  { id: 'd_algo', name: '算法组', owner: '苏禾', members: 6, status: 'active', sort: 1, parentId: 'd_ai', desc: '微调、RAG 与提示词工程' },
  { id: 'd_app', name: '应用交付组', owner: '周敏', members: 5, status: 'active', sort: 2, parentId: 'd_ai', desc: '业务侧集成与交付' },
  { id: 'd_sec', name: '安全合规部', owner: '苏禾', members: 6, status: 'active', sort: 3, parentId: 'd_root', desc: '密钥治理、审计与合规检查' },
  { id: 'd_ops', name: '客户成功部', owner: '王宁', members: 8, status: 'active', sort: 4, parentId: 'd_root', desc: '客户支持与培训' },
  { id: 'd_old', name: '数据标注组', owner: '李思', members: 0, status: 'disabled', sort: 5, parentId: 'd_root', desc: '已合并至算法组，暂保留' },
]

export const deptStats = { total: depts.length, members: 48, active: 9, disabled: 1 }

/* ============================ 字典管理 ============================ */

export interface DictItem {
  label: string
  value: string
  /** 标签色 */
  tone: 'brand' | 'green' | 'amber' | 'rose' | 'slate'
  sort: number
  status: 'active' | 'disabled'
  remark?: string
}

export interface DictType {
  code: string
  name: string
  desc: string
  builtin: boolean
  items: DictItem[]
}

export const dictTypes: DictType[] = [
  {
    code: 'task_status', name: '任务状态', desc: '任务生命周期状态枚举', builtin: true,
    items: [
      { label: '排队中', value: 'queued', tone: 'slate', sort: 1, status: 'active', remark: '等待调度器分配实例' },
      { label: '运行中', value: 'running', tone: 'brand', sort: 2, status: 'active' },
      { label: '已完成', value: 'success', tone: 'green', sort: 3, status: 'active' },
      { label: '失败', value: 'failed', tone: 'rose', sort: 4, status: 'active', remark: '需人工介入或重试' },
      { label: '已取消', value: 'canceled', tone: 'slate', sort: 5, status: 'active' },
    ],
  },
  {
    code: 'service_health', name: '服务健康状态', desc: '服务实例健康度枚举', builtin: true,
    items: [
      { label: '健康', value: 'healthy', tone: 'green', sort: 1, status: 'active' },
      { label: '告警', value: 'warn', tone: 'amber', sort: 2, status: 'active', remark: '资源指标超过阈值' },
      { label: '维护中', value: 'maintenance', tone: 'slate', sort: 3, status: 'active' },
      { label: '不可用', value: 'down', tone: 'rose', sort: 4, status: 'active' },
    ],
  },
  {
    code: 'model_provider', name: '模型提供方', desc: '模型接入来源分类', builtin: true,
    items: [
      { label: 'OpenAI', value: 'openai', tone: 'green', sort: 1, status: 'active' },
      { label: 'Anthropic', value: 'anthropic', tone: 'amber', sort: 2, status: 'active' },
      { label: '阿里云百炼', value: 'bailian', tone: 'brand', sort: 3, status: 'active' },
      { label: 'DeepSeek', value: 'deepseek', tone: 'brand', sort: 4, status: 'active' },
      { label: '内部部署', value: 'internal', tone: 'slate', sort: 5, status: 'active' },
    ],
  },
  {
    code: 'audit_risk', name: '审计风险等级', desc: '操作记录风险分级', builtin: true,
    items: [
      { label: '低', value: 'low', tone: 'green', sort: 1, status: 'active' },
      { label: '中', value: 'medium', tone: 'amber', sort: 2, status: 'active' },
      { label: '高', value: 'high', tone: 'rose', sort: 3, status: 'active' },
    ],
  },
  {
    code: 'notify_channel', name: '通知渠道', desc: '告警与摘要推送渠道', builtin: false,
    items: [
      { label: '企业微信', value: 'wecom', tone: 'brand', sort: 1, status: 'active' },
      { label: '邮件', value: 'email', tone: 'slate', sort: 2, status: 'active' },
      { label: 'Webhook', value: 'webhook', tone: 'amber', sort: 3, status: 'active' },
      { label: '短信', value: 'sms', tone: 'slate', sort: 4, status: 'disabled', remark: '暂未开通网关' },
    ],
  },
]

/* ============================ 分析页 ============================ */

export interface AnalyticsKpi {
  key: string
  label: string
  value: string
  unit?: string
  delta: string
  trend: 'up' | 'down' | 'flat'
  note: string
  tone: 'brand' | 'green' | 'rose' | 'amber'
}

export const analyticsKpis: AnalyticsKpi[] = [
  { key: 'tasks', label: '任务总量', value: '12,482', unit: '次', delta: '+12.4%', trend: 'up', note: '较上一周期', tone: 'brand' },
  { key: 'calls', label: '模型调用', value: '38.6k', unit: '次', delta: '+8.2%', trend: 'up', note: '较上一周期', tone: 'green' },
  { key: 'latency', label: '平均响应耗时', value: '842', unit: 'ms', delta: '-6.1%', trend: 'down', note: 'P95 · 越低越好', tone: 'amber' },
  { key: 'error', label: '失败率', value: '1.4', unit: '%', delta: '-0.3pt', trend: 'down', note: '目标 < 2%', tone: 'rose' },
]

export interface AnalyticsPoint {
  day: string
  tasks: number
  calls: number
  failed: number
}

/** 7 天明细（人工对齐工作日波形） */
const trend7: AnalyticsPoint[] = [
  { day: '11-02', tasks: 962, calls: 4820, failed: 24 },
  { day: '11-03', tasks: 978, calls: 5106, failed: 31 },
  { day: '11-04', tasks: 953, calls: 4952, failed: 18 },
  { day: '11-05', tasks: 1126, calls: 5840, failed: 42 },
  { day: '11-06', tasks: 1154, calls: 6120, failed: 33 },
  { day: '11-07', tasks: 1183, calls: 6480, failed: 51 },
  { day: '11-08', tasks: 1254, calls: 6980, failed: 39 },
]

/** 30 天：在 7 天基线上做确定性波动（避免每次刷新数据跳变） */
const trend30: AnalyticsPoint[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 9, 10 + i)
  const base = 880 + i * 12
  const wave = Math.round(Math.sin(i / 2.4) * 62 + Math.cos(i / 1.7) * 28)
  const weekday = (i + 1) % 7
  const dip = weekday === 5 || weekday === 6 ? -78 : 0
  const tasks = base + wave + dip
  return {
    day: `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    tasks,
    calls: Math.round(tasks * 5.2 + (i % 4) * 90),
    failed: Math.max(8, Math.round(tasks * 0.014 + (i % 3) * 4)),
  }
})

export function analyticsTrend(range: '7d' | '30d'): AnalyticsPoint[] {
  return range === '30d' ? trend30 : trend7
}

export const analyticsSources = [
  { name: 'API 调用', value: 46, color: 'var(--brand-500)' },
  { name: '控制台操作', value: 24, color: '#10b981' },
  { name: '定时任务', value: 18, color: '#f59e0b' },
  { name: 'SDK 批量', value: 12, color: '#6366f1' },
]

export const analyticsLatency = [
  { service: 'inference-core', p50: 520, p95: 842 },
  { service: 'gateway-api', p50: 28, p95: 64 },
  { service: 'task-scheduler', p50: 46, p95: 118 },
  { service: 'vector-db', p50: 132, p95: 386 },
  { service: 'embedding-worker', p50: 210, p95: 460 },
  { service: 'model-registry', p50: 18, p95: 42 },
]

export const analyticsErrors = [
  { type: '上游超时', count: 62, share: 41, tone: 'rose' as const },
  { type: '触发限流', count: 38, share: 25, tone: 'amber' as const },
  { type: '参数校验失败', count: 26, share: 17, tone: 'brand' as const },
  { type: '模型返回异常', count: 18, share: 12, tone: 'slate' as const },
  { type: '其他', count: 8, share: 5, tone: 'slate' as const },
]

/** 7 天 × 24 小时调用热力（0-100） */
export const analyticsHeat: number[][] = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => {
    const workday = d < 5
    const peak = h >= 9 && h <= 18 ? 1 : h >= 20 && h <= 22 ? 0.6 : 0.22
    const wave = 0.75 + Math.sin((h + d * 3) / 3.2) * 0.25
    return Math.round(Math.min(100, 100 * peak * wave * (workday ? 1 : 0.55)))
  }),
)

export const analyticsModels = [
  { name: 'gpt-4o', provider: 'OpenAI', calls: 14280, latency: '720 ms', success: '99.2%', cost: '¥486.20', share: 37 },
  { name: 'claude-sonnet-4', provider: 'Anthropic', calls: 9640, latency: '860 ms', success: '98.7%', cost: '¥372.40', share: 25 },
  { name: 'qwen-max', provider: '阿里云百炼', calls: 7420, latency: '540 ms', success: '99.5%', cost: '¥168.90', share: 19 },
  { name: 'deepseek-v3', provider: 'DeepSeek', calls: 4860, latency: '610 ms', success: '98.9%', cost: '¥96.30', share: 13 },
  { name: 'bge-m3', provider: '内部部署', calls: 2400, latency: '120 ms', success: '99.9%', cost: '¥21.60', share: 6 },
]

export const analyticsInsights = [
  { title: '峰值时段', value: '10:00 - 11:30', note: '占全天调用量 23%，建议提前扩容 2 个推理实例', tone: 'brand' as const },
  { title: '最慢链路', value: 'inference-core · P95 842ms', note: '图片类任务平均耗时是文本的 4.6 倍', tone: 'amber' as const },
  { title: '错误集中', value: '上游超时 41%', note: '集中在 14:00-15:00，与批处理任务重叠', tone: 'rose' as const },
]

export interface NotificationItem {
  id: string
  type: 'task' | 'system' | 'security' | 'billing'
  title: string
  desc: string
  at: string
  read: boolean
}

export const notifications: NotificationItem[] = [
  {
    id: 'ntf_1',
    type: 'task',
    title: '任务失败：合同要素抽取（11 月批次）',
    desc: '第 4 批次解析超时，已自动重试 2 次，建议检查上游渠道',
    at: '10 分钟前',
    read: false,
  },
  {
    id: 'ntf_2',
    type: 'security',
    title: '检测到异常登录',
    desc: '账号 lixia@apex.ai 在新设备（Windows · Chrome）登录，IP 归属上海',
    at: '32 分钟前',
    read: false,
  },
  {
    id: 'ntf_3',
    type: 'system',
    title: '调度服务今晚 02:00 滚动重启',
    desc: '重启期间新任务进入队列，已运行任务不受影响',
    at: '2 小时前',
    read: true,
  },
  {
    id: 'ntf_4',
    type: 'billing',
    title: '本月调用额度已使用 82%',
    desc: '按当前速率预计 11 天后耗尽，可提前申请提升配额',
    at: '5 小时前',
    read: true,
  },
  {
    id: 'ntf_5',
    type: 'task',
    title: '知识库增量重嵌入已完成',
    desc: '新增文档 128 篇，嵌入 4.2 万 tokens，用时 6 分钟',
    at: '昨天 19:22',
    read: true,
  },
]
