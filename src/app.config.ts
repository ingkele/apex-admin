/**
 * 框架化预留①：应用集中配置
 * 应用名 / logo / 主题色 / 权限码表 / 导航菜单全部配置化，不写死在组件里。
 * 新项目套用模板时优先只改这个文件。
 */

export interface NavChild {
  label: string
  to: string
  /** 子项独立图标（不填则沿用分组图标） */
  icon?: NavIcon
  permission?: PermissionCode
}

export interface NavGroup {
  label: string
  icon: NavIcon
  children: NavChild[]
}

/** 图标名映射到 lucide-react 导出（集中一处，避免散落魔法字符串） */
export type NavIcon =
  | 'dashboard' | 'analytics' | 'tasks' | 'services' | 'models' | 'keys'
  | 'users' | 'roles' | 'menu' | 'dept' | 'dict' | 'audit' | 'settings'
  | 'components' | 'examples' | 'errors' | 'about'
  | 'component' | 'input' | 'feedback' | 'navigation' | 'table' | 'list' | 'form' | 'flow' | 'state'

export const appConfig = {
  /** 应用标识 */
  name: 'Apex AI Studio',
  shortName: 'Apex',
  fullName: 'Apex AI Studio 管理端',
  logoText: 'A',

  /** 版权/登录页脚注 */
  copyright: '© 2026 Apex AI Studio · 基于标准后台管理模板构建',

  /** 默认主题（= 原型 DEFAULT_THEME） */
  defaultTheme: {
    mode: 'light',
    accent: 'blue',
    density: 'comfortable',
    radius: 'medium',
    sidebar: 'light',
  },

  /** 三角色（设计方案 A2：admin / operator / viewer） */
  roles: {
    admin: { label: '超级管理员', permissions: '*' },
    operator: { label: '运维操作员', permissions: ['task:*', 'service:*', 'model:*', 'key:*', 'audit:view'] },
    viewer: { label: '只读访客', permissions: ['dashboard:view', 'task:view', 'task:detail', 'service:view', 'service:log', 'model:view', 'key:view', 'audit:view'] },
  },
} as const

/** 权限码表（路由守卫 / 菜单过滤 / <Can> 按钮级 三处共用；API 级由 .NET 强制校验） */
export type MenuPermission =
  | 'dashboard:view' | 'task:view' | 'task:detail'
  | 'service:view' | 'service:log'
  | 'model:view' | 'key:view'
  | 'user:view' | 'role:view' | 'menu:view' | 'dept:view' | 'dict:view'
  | 'audit:view' | 'setting:view'

export type ActionPermission =
  | 'task:retry' | 'task:cancel'
  | 'service:restart' | 'service:stop'
  | 'model:manage' | 'key:manage'
  | 'user:manage' | 'role:manage' | 'menu:manage' | 'dept:manage' | 'dict:manage'
  | 'setting:manage'

export type PermissionCode = MenuPermission | ActionPermission

/** 权限码中文名（角色矩阵 / 提示文案共用） */
export const PERMISSIONS: Record<PermissionCode, string> = {
  'dashboard:view': '工作台',
  'task:view': '任务列表',
  'task:detail': '任务详情',
  'service:view': '服务列表',
  'service:log': '服务日志',
  'model:view': '模型配置',
  'key:view': 'API Key',
  'user:view': '用户管理',
  'role:view': '角色权限',
  'menu:view': '菜单管理',
  'dept:view': '部门管理',
  'dict:view': '字典管理',
  'audit:view': '审计日志',
  'setting:view': '系统参数',
  'task:retry': '重试任务',
  'task:cancel': '取消任务',
  'service:restart': '重启服务',
  'service:stop': '停止服务',
  'model:manage': '模型管理',
  'key:manage': '密钥管理',
  'user:manage': '用户管理',
  'role:manage': '角色管理',
  'menu:manage': '菜单维护',
  'dept:manage': '部门维护',
  'dict:manage': '字典维护',
  'setting:manage': '修改系统参数',
}

/** 权限码说明（角色矩阵每项副标题） */
export const PERMISSION_HINTS: Record<PermissionCode, string> = {
  'dashboard:view': '查看平台概览与指标',
  'task:view': '查看与筛选任务',
  'task:detail': '查看执行参数与日志',
  'service:view': '查看服务健康与资源',
  'service:log': '检索与下载服务日志',
  'model:view': '查看与编辑模型参数',
  'key:view': '查看密钥列表与用量',
  'user:view': '查看成员列表',
  'role:view': '查看角色与权限树',
  'menu:view': '查看菜单结构与权限标识',
  'dept:view': '查看组织架构与成员归属',
  'dict:view': '查看业务枚举字典',
  'audit:view': '查看系统操作记录',
  'setting:view': '查看平台配置',
  'task:retry': '重新提交失败任务',
  'task:cancel': '停止运行中的任务',
  'service:restart': '执行服务实例滚动重启',
  'service:stop': '停止服务实例',
  'model:manage': '启停模型与调整参数',
  'key:manage': '签发与吊销访问凭证',
  'user:manage': '邀请、停用与分配角色',
  'role:manage': '调整角色权限矩阵',
  'menu:manage': '新增、隐藏与删除菜单',
  'dept:manage': '维护部门层级与负责人',
  'dict:manage': '维护字典类型与字典项',
  'setting:manage': '编辑基础、安全与通知参数',
}

/** 权限矩阵分组（菜单级 / 按钮级） */
export const PERMISSION_GROUPS: {
  key: 'menu' | 'action'
  label: string
  desc: string
  icon: 'grid' | 'cursor'
  codes: PermissionCode[]
}[] = [
  {
    key: 'menu',
    label: '菜单权限',
    desc: '控制角色可访问的页面与菜单入口',
    icon: 'grid',
    codes: [
      'dashboard:view', 'task:view', 'task:detail', 'service:view', 'service:log',
      'model:view', 'key:view', 'user:view', 'role:view', 'menu:view', 'dept:view', 'dict:view',
      'audit:view', 'setting:view',
    ],
  },
  {
    key: 'action',
    label: '按钮权限',
    desc: '控制角色可执行的高风险操作',
    icon: 'cursor',
    codes: [
      'task:retry', 'task:cancel', 'service:restart', 'service:stop',
      'model:manage', 'key:manage', 'user:manage', 'role:manage',
      'menu:manage', 'dept:manage', 'dict:manage', 'setting:manage',
    ],
  },
]

/** 侧边栏导航（分组菜单 = 原型侧边栏结构） */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: '概览',
    icon: 'dashboard',
    children: [
      { label: '工作台', to: '/dashboard' },
      { label: '分析页', to: '/analytics' },
    ],
  },
  {
    label: '任务中心',
    icon: 'tasks',
    children: [{ label: '任务列表', to: '/tasks', permission: 'task:view' }],
  },
  {
    label: '服务管理',
    icon: 'services',
    children: [
      { label: '服务列表', to: '/services', permission: 'service:view' },
      { label: '服务日志', to: '/services/logs', permission: 'service:log' },
    ],
  },
  {
    label: '模型与密钥',
    icon: 'models',
    children: [
      { label: '模型配置', to: '/models', permission: 'model:view' },
      { label: 'API Key', to: '/models/keys', permission: 'key:view' },
    ],
  },
  {
    label: '系统管理',
    icon: 'settings',
    children: [
      { label: '用户管理', to: '/system/users', permission: 'user:manage' },
      { label: '角色权限', to: '/system/roles', permission: 'role:manage' },
      { label: '菜单管理', to: '/system/menus', permission: 'menu:view' },
      { label: '部门管理', to: '/system/depts', permission: 'dept:view' },
      { label: '字典管理', to: '/system/dicts', permission: 'dict:view' },
      { label: '审计日志', to: '/system/audit', permission: 'audit:view' },
      { label: '系统参数', to: '/system/settings', permission: 'setting:manage' },
    ],
  },
  {
    label: '演示',
    icon: 'components',
    children: [
      { label: '基础组件', to: '/demo/base', icon: 'component' },
      { label: '表单控件', to: '/demo/form', icon: 'input' },
      { label: '反馈组件', to: '/demo/feedback', icon: 'feedback' },
      { label: '导航组件', to: '/demo/nav', icon: 'navigation' },
      { label: '数据展示', to: '/demo/data', icon: 'table' },
    ],
  },
  {
    label: '示例',
    icon: 'examples',
    children: [
      { label: '列表 CRUD', to: '/examples/list', icon: 'list' },
      { label: '表单校验', to: '/examples/form', icon: 'form' },
      { label: '分步流程', to: '/examples/steps', icon: 'flow' },
      { label: '状态占位', to: '/examples/states', icon: 'state' },
    ],
  },
  {
    label: '其他',
    icon: 'errors',
    children: [
      { label: '403 无权限', to: '/error/403' },
      { label: '404 不存在', to: '/error/404' },
      { label: '500 异常', to: '/error/500' },
      { label: '离线页面', to: '/error/offline' },
      { label: '关于', to: '/about' },
    ],
  },
]
