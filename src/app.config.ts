/**
 * 框架化预留①：应用集中配置
 * 应用名 / logo / 主题色 / 权限码表 / 导航菜单全部配置化，不写死在组件里。
 * 新项目套用模板时优先只改这个文件。
 */

export interface NavChild {
  label: string
  /** 叶子路由；父级节点（有 children）可不填，点击只负责展开/收起 */
  to?: string
  /** 子项独立图标（不填则沿用分组图标） */
  icon?: NavIcon
  /** 激活态图标（当前页命中时替换 icon） */
  activeIcon?: NavIcon
  /** 右侧徽标：数字或短文本 */
  badge?: { text: string; tone?: NavBadgeTone }
  /** 外链：新窗口打开，不走站内路由 */
  external?: string
  /** 链接携带的查询参数（带参菜单） */
  query?: Record<string, string | number>
  /** 站内路由以新窗口打开（新窗口打开菜单项） */
  target?: '_blank'
  /** 隐藏子菜单：有 children 但侧边栏折叠为单链接，子页面仅 URL 直达 */
  hideChildren?: boolean
  /** 隐藏菜单项：侧边栏与命令面板均不渲染，页面仅 URL / 页内链接直达（详情页常用） */
  hideInMenu?: boolean
  /** 激活让渡：隐藏项命中时，侧边栏改为高亮此路径指向的菜单项（对齐 vben activePath） */
  activePath?: string
  /** 面包屑平级模式：只显示当前页标题，不带分组/父级链 */
  breadcrumbFlat?: boolean
  /** 面包屑追加父级标签（详情页保留层级链用，如 ['层级模式']） */
  breadcrumbParents?: string[]
  permission?: PermissionCode
  /** 子菜单（递归嵌套，支持任意层级） */
  children?: NavChild[]
}

export type NavBadgeTone = 'brand' | 'rose' | 'amber' | 'slate'

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
  | 'demo' | 'badge' | 'sparkles' | 'external' | 'nested' | 'embed'
  | 'feature' | 'expired' | 'palette' | 'watermark' | 'preference' | 'tabs' | 'hideMenu'
  | 'fullscreen' | 'download' | 'clipboard' | 'param' | 'newWindow' | 'tanstack' | 'serialize'
  | 'access' | 'breadcrumb' | 'guarded' | 'bigint'
  | 'modal' | 'drawer' | 'ellipsis' | 'resize' | 'colPage' | 'tippy' | 'json'
  | 'motion' | 'countTo' | 'loading' | 'buttons'
  | 'tableOps' | 'contextMenu' | 'imageCrop' | 'richText'

export const appConfig = {
  /** 应用标识 */
  name: 'Apex Admin',
  shortName: 'Apex',
  fullName: 'Apex Admin',
  logoText: 'A',

  /** 版权/登录页脚注 */
  copyright: '© 2026 Apex Admin · 基于标准后台管理模板构建',

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
      {
        label: '成员与权限',
        icon: 'users',
        children: [
          { label: '用户管理', to: '/system/users', permission: 'user:manage' },
          { label: '角色权限', to: '/system/roles', permission: 'role:manage' },
        ],
      },
      {
        label: '组织与字典',
        icon: 'dept',
        children: [
          { label: '菜单管理', to: '/system/menus', permission: 'menu:view' },
          { label: '部门管理', to: '/system/depts', permission: 'dept:view' },
          { label: '字典管理', to: '/system/dicts', permission: 'dict:view' },
        ],
      },
      {
        label: '审计与参数',
        icon: 'audit',
        children: [
          { label: '审计日志', to: '/system/audit', permission: 'audit:view' },
          { label: '系统参数', to: '/system/settings', permission: 'setting:manage' },
        ],
      },
    ],
  },
  {
    label: '组件与示例',
    icon: 'components',
    children: [
      {
        label: '组件演示',
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
        label: '业务示例',
        icon: 'examples',
        children: [
          { label: '列表 CRUD', to: '/examples/list', icon: 'list' },
          { label: '表单校验', to: '/examples/form', icon: 'form' },
          { label: '分步流程', to: '/examples/steps', icon: 'flow' },
          { label: '状态占位', to: '/examples/states', icon: 'state' },
        ],
      },
    ],
  },
  {
    label: '演示',
    icon: 'demo',
    children: [
      {
        label: '功能',
        icon: 'feature',
        children: [
          { label: '登录过期', to: '/demo/expired', icon: 'expired' },
          { label: '图标', to: '/demo/icons', icon: 'palette' },
          { label: '水印', to: '/demo/watermark', icon: 'watermark' },
          { label: '偏好扩展示例', to: '/demo/preference', icon: 'preference' },
          { label: '标签页', to: '/demo/tabs', icon: 'tabs' },
          {
            label: '隐藏子菜单',
            to: '/demo/hide-children',
            icon: 'hideMenu',
            hideChildren: true,
            children: [
              { label: '子菜单 A（隐藏）', to: '/demo/hide-children/a' },
              { label: '子菜单 B（隐藏）', to: '/demo/hide-children/b' },
            ],
          },
          { label: '全屏', to: '/demo/fullscreen', icon: 'fullscreen' },
          { label: '文件下载', to: '/demo/download', icon: 'download' },
          { label: '剪贴板', to: '/demo/clipboard', icon: 'clipboard' },
          { label: '带参菜单', to: '/demo/query-param', icon: 'param', query: { user: 'apex', tab: '1' } },
          { label: '新窗口打开', to: '/demo/new-window', icon: 'newWindow', target: '_blank' },
          { label: 'TanStack Query', to: '/demo/tanstack-query', icon: 'tanstack' },
          { label: '参数序列化', to: '/demo/serialize', icon: 'serialize' },
          { label: 'JSON BigInt', to: '/demo/json-bigint', icon: 'bigint' },
        ],
      },
      {
        label: '前端权限',
        icon: 'access',
        children: [
          { label: '页面访问', to: '/demo/access/page' },
          { label: '按钮控制', to: '/demo/access/button' },
          { label: '菜单可见(403)', to: '/demo/access/menu-403' },
          { label: '受保护页面（守卫）', to: '/demo/access/guarded', icon: 'guarded', permission: 'user:manage' },
          { label: 'Super 可见', to: '/demo/access/super', icon: 'guarded', permission: 'user:manage' },
          { label: 'Admin 可见', to: '/demo/access/admin', permission: 'task:retry' },
          { label: 'User 可见', to: '/demo/access/user' },
        ],
      },
      {
        label: '面包屑导航',
        icon: 'breadcrumb',
        children: [
          { label: '平级模式', to: '/demo/breadcrumb/flat', breadcrumbFlat: true },
          { label: '平级模式详情', to: '/demo/breadcrumb/flat-detail', hideInMenu: true, activePath: '/demo/breadcrumb/flat', breadcrumbFlat: true },
          { label: '层级模式', to: '/demo/breadcrumb/hierarchy' },
          { label: '层级模式详情', to: '/demo/breadcrumb/detail', breadcrumbParents: ['层级模式'] },
        ],
      },
      {
        label: '缺省页',
        icon: 'errors',
        children: [
          { label: '403 无权限', to: '/error/403' },
          { label: '404 不存在', to: '/error/404' },
          { label: '500 异常', to: '/error/500' },
          { label: '离线页面', to: '/error/offline' },
        ],
      },
      {
        label: '菜单徽标',
        icon: 'badge',
        children: [
          { label: '点徽标 10', to: '/demo/badge/dot', badge: { text: '10', tone: 'rose' } },
          { label: '文本徽标 Hot', to: '/demo/badge/text', badge: { text: 'Hot', tone: 'brand' } },
          { label: '徽标颜色', to: '/demo/badge/color', badge: { text: 'new', tone: 'amber' } },
        ],
      },
      {
        label: '菜单激活图标',
        icon: 'sparkles',
        children: [
          { label: '一级激活图标', to: '/demo/active-icon/menu', icon: 'list', activeIcon: 'sparkles' },
          { label: '子级激活图标', to: '/demo/active-icon/sub', icon: 'list', activeIcon: 'sparkles' },
        ],
      },
      {
        label: '外部页面',
        icon: 'external',
        children: [
          { label: '内嵌 · 本地演示页', to: '/demo/iframe/local', icon: 'embed' },
          { label: '内嵌 · Tailwindcss', to: '/demo/iframe/tailwind', icon: 'embed' },
          { label: '外链 · Vite', external: 'https://vite.dev', icon: 'external' },
          { label: '外链 · VueUse', external: 'https://vueuse.org', icon: 'external' },
        ],
      },
      {
        label: '嵌套菜单',
        icon: 'nested',
        children: [
          { label: '菜单 1', to: '/demo/nested/menu1' },
          {
            label: '菜单 2',
            children: [{ label: '菜单 2-1', to: '/demo/nested/menu2/menu2-1' }],
          },
          {
            label: '菜单 3',
            children: [
              { label: '菜单 3-1', to: '/demo/nested/menu3/menu3-1' },
              {
                label: '菜单 3-2',
                children: [{ label: '菜单 3-2-1', to: '/demo/nested/menu3/menu3-2/menu3-2-1' }],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    label: '示例',
    icon: 'examples',
    children: [
      { label: '弹窗', to: '/examples/modal', icon: 'modal' },
      { label: '抽屉', to: '/examples/drawer', icon: 'drawer' },
      { label: '文本省略', to: '/examples/ellipsis', icon: 'ellipsis' },
      { label: '拖动调整', to: '/examples/resize', icon: 'resize' },
      { label: '双列布局', to: '/examples/col-page', icon: 'colPage', badge: { text: 'Alpha', tone: 'rose' } },
      { label: 'Tippy', to: '/examples/tippy', icon: 'tippy' },
      { label: 'JsonViewer', to: '/examples/json-viewer', icon: 'json' },
      { label: 'Motion', to: '/examples/motion', icon: 'motion' },
      { label: 'CountTo', to: '/examples/count-to', icon: 'countTo' },
      { label: 'Loading', to: '/examples/loading', icon: 'loading' },
      { label: '按钮组', to: '/examples/button-group', icon: 'buttons' },
      { label: '表格操作', to: '/examples/table-ops', icon: 'tableOps' },
      { label: '上下文菜单', to: '/examples/context-menu', icon: 'contextMenu' },
      { label: '图片裁剪', to: '/examples/image-crop', icon: 'imageCrop' },
      { label: '富文本编辑器', to: '/examples/rich-text', icon: 'richText' },
    ],
  },
  {
    label: '其他',
    icon: 'about',
    children: [{ label: '关于', to: '/about' }],
  },
]
