# Apex Admin — 后台管理标准模板（Starter）

以墨刀原型（apex-admin-总览/演示-主题统一.html）为**设计标准**开发的生产级后台管理模板。
Apex-AI-Studio 后续直接 fork 本模板定制，不做二次翻译。

技术栈：Vite + React 19 + TypeScript 5.x + TanStack Router / Query / Table + shadcn/ui（**Base UI** 底层）+ Tailwind v4 + Zustand + react-grid-layout + Recharts + sonner / cmdk / Lucide。

## 快速开始

```bash
pnpm install
pnpm dev        # http://127.0.0.1:5180
pnpm build      # 产物构建
pnpm typecheck  # tsc --noEmit
pnpm routes     # 打印路由树
```

> **端口约定（重要）**：`vite.config.ts` 已固定 `host: '127.0.0.1'` + `port: 5180` + `strictPort: true`。
> - 必须用 `127.0.0.1` 而**不是** `localhost`：部分环境下 `localhost` 解析到 IPv6 的 `::1`，而浏览器扩展 / 部分工具走 IPv4，会连不上。
> - 端口被占时 Vite **直接报错**而不会自动漂移到 5181/5182 —— 遇到这种情况先查占用：`netstat -ano | findstr :5180`，再按 PID `taskkill /PID <pid> /F` 清掉旧实例，别让多个 dev server 叠着跑。

Mock 账号（任意邮箱 + ≥4 位密码即可登录）：

| 邮箱 | 角色 |
| --- | --- |
| `admin@` 开头 | admin（全部权限） |
| `ops@` 开头 | operator |
| 其他 | viewer（只读） |

## 目录约定

```
src/
├── app.config.ts          # 全局配置唯一真源：权限码、导航分组、角色权限表
├── styles/index.css       # 主题 token 唯一真源（CSS 变量 + @theme inline 映射）
├── stores/                # Zustand（theme / auth / sidebar），persist 到 localStorage
├── lib/                   # http.ts（Transport 抽象）/ format.ts / utils.ts
├── api/index.ts           # Query hooks + queryKeys 全集（页面不直连 transport）
├── mocks/                 # db.ts（内存数据）+ transport.ts（正则路由表）
├── components/
│   ├── ui/                # 原子组件（Base UI 底层），只放与业务无关的控件
│   ├── shared/            # 跨页面业务组件（DataTable / FilterBar / PageHeader / StatCard / Can / ThemeDrawer）
│   └── layout/            # Sidebar / Topbar
└── routes/                # TanStack Router 文件路由（routeTree.gen.ts 自动生成，勿手改）
    ├── login.tsx
    ├── _auth.tsx          # 布局壳 + beforeLoad 鉴权守卫
    └── _auth/**           # 12 个业务页面
```

硬边界：

- **页面（routes）→ api hooks → transport → mocks/live**，不允许跨层直连。
- `components/ui` 不 import 任何 `features`/`api` 代码；`shared` 可以。
- 新增 CSS 变量只能进 `styles/index.css`，禁止在组件里散落颜色字面量。

## 字段核对规则（强制）

DTO ↔ Zod ↔ 表单字段三处必须逐字段核对，**字段名大小写敏感**（历史事故：`relation_detail` 大小写不一致导致序列化丢字段）。

改任一接口字段时：

1. 先改 `mocks/db.ts` 的数据结构与 `mocks/transport.ts` 的响应体；
2. 再改 `api/index.ts` 的类型与 Query key；
3. 最后改页面表单/表格列，并跑 `pnpm typecheck` 确认零报错后才算完成。

## 主题扩展

主题系统三件套：`styles/index.css`（token 定义）→ `stores/theme.store.ts`（ACCENTS 色阶 + applyTheme）→ `components/shared/theme-drawer.tsx`（UI 入口）。

- **新增主题色**：在 `theme.store.ts` 的 `ACCENTS` 中加一组 10 档 hex（50~900），即自动出现在抽屉色板。
- **新增定制维度**：扩展 `ThemeState` + `DEFAULT_THEME`，在 `applyTheme` 中落一个 CSS 变量或 `data-*` 属性，抽屉加一行 `OptionRow`。
- **明暗模式**：`html.dark` class 切换；深色覆盖写在 `index.css` 的 `.dark` 段。
- **侧边栏**：`--sidebar-bg/ink/muted/line/hover/active-*` 默认跟随明暗模式（= 原型侧边栏用 `bg-surface` 的机制），切深色外观时菜单背景自动变深；抽屉「侧边栏风格 → 深色」通过 `[data-sidebar='dark']` **强制**深色（浅色模式也能有深色菜单）。侧边栏内所有边框/悬停必须用 `sidebar-*` 变量，不要用全局 `--line/--hover`。
- **登录页**：独立一套 `.login-scope` 作用域内的 `--slate-rgb-* / --white-rgb / --login-panel` 三元组，深色时整页翻转（`html.dark .login-scope` 段，逐值与原型 login.html 同源）。这套翻转**只作用于登录页**，避免影响日志终端等固定深色区域。
- **密度**走 `[data-density='compact']` + `td-py` utility；**圆角**走 `--app-radius-lg/xl` 三档（4/8/12px）。

所有 token 与墨刀原型逐值同源，改默认值时需同步原型设计标准文档（设计方案 §4.4）。

## 新模块接入指南

以新增「告警中心」为例：

1. **配置**：`app.config.ts` 加权限码（如 `alert:read` / `alert:manage`）进 `PermissionCode` 与 `PERMISSIONS` 中文标签，`NAV_GROUPS` 加导航项。
2. **Mock**：`mocks/db.ts` 加数据集；`mocks/transport.ts` 用 `route('GET', '/alerts', ...)` 注册路由。
3. **API**：`api/index.ts` 加 `qk.alerts.*` queryKeys 与 `useAlerts` / `useAlertActions` hooks。
4. **页面**：`src/routes/_auth/alerts/index.tsx`，复用 `PageHeader` + `FilterBar` + `DataTable` + `ConfirmDialog` 套件。
5. **验证**：`pnpm typecheck` + 浏览器过一遍列表/筛选/增删改/空态/权限（viewer 角色）。

## Mock → Live 切换

`lib/http.ts` 定义了 `Transport` 抽象，`VITE_DATA_MODE` 环境变量控制：

- `mock`（默认）：走 `mocks/transport.ts` 内存路由，零后端依赖。
- `live`：走 `fetchTransport`，自动带 Bearer token，请求真实 API。

切换到真实后端时**页面与 api hooks 零改动**，只需：

1. `.env` 设 `VITE_DATA_MODE=live` 与 `VITE_API_BASE`；
2. 后端 DTO 与 mock 响应体字段核对（见「字段核对规则」）；
3. 把 `auth.store.ts` 的 mock login 换成真实登录端点，JWT 从响应中取。

布局持久化（工作台卡片拖拽）走 `/user/preferences/dashboard-layout`，已带白名单校验（≤30 项、id 限 `^[\w-]{1,32}$`、坐标 0~100 整数），live 模式直接对齐后端同名端点即可。

## 权限模型

三层：**角色 → 权限码 → UI/路由**。`app.config.ts` 的 `roles` 表定义角色到权限码的映射（支持 `task:*` 通配）。

- 路由级：`_auth.tsx` 的 `beforeLoad` 校验登录态；页面内用 `<Can code="...">` 包按钮/区块。
- 菜单级：`sidebar.tsx` 按权限码过滤 `NAV_GROUPS`。
- 演示用 mock 鉴权（localStorage persist），live 模式换成真实 JWT 解析即可。

## 已知约定

- 界面文案全部中文；错误提示用 sonner toast。
- Base UI 的组合用 `render` 属性（如 `AlertDialog.Close render={<Button/>}`），**不使用** Radix 的 `asChild` / `data-[state]` API，禁止混用。
- `react-grid-layout` 的 `Layout` 是 `readonly LayoutItem[]`（本身即数组类型），持久化转换处用 `as unknown as` 收口。
- TanStack Router 文件路由生成 `routeTree.gen.ts`，提交代码时保留生成文件。
