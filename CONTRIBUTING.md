# 贡献与开发约定

## 改造清单（clone 之后先做这些）

模板落地到新项目，有 7 处必改：

| # | 位置 | 改什么 |
| --- | --- | --- |
| 1 | `package.json` | `name` / `version` / `description` |
| 2 | `README.md` | 换成项目说明，保留「对接后端」「贡献」章节作为工程约定 |
| 3 | `src/app.config.ts` | 权限码、导航分组、角色权限表（全局配置唯一真源，从这里开始改） |
| 4 | `index.html` | `<title>` 与页面描述 |
| 5 | `src/routes/login.tsx` | 登录页文案与演示账号规则 |
| 6 | `.env` | `VITE_DATA_MODE` 与 `VITE_API_BASE` |
| 7 | `src/mocks/db.ts` + `transport.ts` | 换成真实业务的假数据，或整体退役直接切 `live` |

不需要演示内容时，删除 `src/routes/_auth/demo/`、`src/routes/_auth/examples/` 两个目录，并同步移除 `app.config.ts` 中对应导航分组与 `components/layout/sidebar.tsx` 里为子项配置的图标映射。

## 目录硬边界

- 数据只能单向流动：**页面（routes）→ api hooks → transport → mocks/live**，不允许跨层直连。
- `components/ui` 不 import 任何 `api` / 业务代码；`components/shared` 可以。
- 新增 CSS 变量只能进 `styles/index.css`，禁止在组件里散落颜色字面量。
- `routeTree.gen.ts` 由 TanStack Router 生成，**保留在版本控制中**，不要手改。

## 字段核对规则（强制）

DTO ↔ Zod ↔ 表单字段三处必须逐字段核对，**字段名大小写敏感**（历史事故：`relation_detail` 大小写不一致导致序列化丢字段）。

改任一接口字段时按顺序执行：

1. 改 `mocks/db.ts` 的数据结构与 `mocks/transport.ts` 的响应体
2. 改 `api/index.ts` 的类型与 Query key
3. 改页面表单 / 表格列
4. `pnpm typecheck` 零报错才算完成

## 新模块接入五步

以新增「告警中心」为例：

1. **配置**：`app.config.ts` 加权限码（`alert:read` / `alert:manage`）到 `PermissionCode` 与 `PERMISSIONS` 中文标签，`NAV_GROUPS` 加导航项。
2. **Mock**：`mocks/db.ts` 加数据集；`mocks/transport.ts` 用 `route('GET', '/alerts', ...)` 注册路由。
3. **API**：`api/index.ts` 加 `qk.alerts.*` 与 `useAlerts` / `useAlertActions`。
4. **页面**：`src/routes/_auth/alerts/index.tsx`，复用 `PageHeader` + `FilterBar` + `DataTable` + `ConfirmDialog`。
5. **验证**：`pnpm typecheck`，再用浏览器过一遍列表 / 筛选 / 增删改 / 空态 / 权限（切 viewer 角色看按钮是否隐藏）。

## 主题扩展

三件套：`styles/index.css`（token）→ `stores/theme.store.ts`（`ACCENTS` 色阶 + `applyTheme`）→ `components/shared/theme-drawer.tsx`（UI 入口）。

- **新增主题色**：在 `ACCENTS` 加一组 10 档 hex（50~900），抽屉色板自动出现。
- **新增定制维度**：扩展 `ThemeState` + `DEFAULT_THEME`，在 `applyTheme` 落一个 CSS 变量或 `data-*` 属性，抽屉加一行 `OptionRow`。
- **明暗模式**：`html.dark` class 切换，深色覆盖写在 `index.css` 的 `.dark` 段。
- **侧边栏**：`--sidebar-bg/ink/muted/line/hover/active-*` 默认跟随明暗；抽屉「侧边栏风格 → 深色」通过 `[data-sidebar='dark']` 强制深色。侧边栏内边框 / 悬停必须用 `sidebar-*` 变量，不要用全局 `--line/--hover`。
- **登录页**：`.login-scope` 作用域内的 `--slate-rgb-* / --white-rgb / --login-panel` 三元组，深色时整页翻转；该翻转只作用于登录页，避免污染日志终端等固定深色区域。
- **密度**走 `[data-density='compact']` + `td-py` utility；**圆角**走 `--app-radius-lg/xl` 三档（4/8/12px）。

## 已知约定

- 界面文案全部中文；错误提示统一 sonner toast，位置固定底部居中（避免遮挡页头按钮）。
- Base UI 的组合用 `render` 属性（如 `AlertDialog.Close render={<Button/>}`），**不使用** Radix 的 `asChild` / `data-[state]`，两者禁止混用。
- Base UI 的 `Menu.Trigger` 要求渲染成原生 `<button>`，否则会出现 button 嵌套 hydration 报错。
- `react-grid-layout` 的 `Layout` 是 `readonly LayoutItem[]`，持久化转换处用 `as unknown as` 收口。
- 根字号为 `html { font-size: 14px }`，`h-4` 实际是 14px。写死高度的地方（如 Switch 轨道）要用固定 px，不要用 rem 推导。
- Tailwind 没有 `peer-indeterminate` 变体，复选框半选态用条件渲染图标实现。
- 动态类名（`bg-brand-${n}`）不会被 Tailwind 扫描到，改用内联 `style={{ background: 'var(--brand-N)' }}`。

## 提交规范

中文 conventional commits，范围用模块名：

```
feat(admin): 新增告警中心列表页
fix(tabs): 关闭末页签后跳转错误
docs: 补充对接后端说明
```

提交前确保 `pnpm typecheck` 与 `pnpm build` 均通过。

## 本地验证清单

```bash
pnpm typecheck   # 0 error
pnpm build       # 构建通过
pnpm dev         # 浏览器逐页确认，控制台 0 error
```

涉及交互（拖拽、右键菜单、开关、主题）时，必须在真实浏览器里点一遍，不要只看编译结果。
