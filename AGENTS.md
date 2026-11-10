<!-- guardAI:start -->
<!-- guardai-directive-version: 3 -->
## guardAI 规范门禁（AI 必须遵守）

1. **禁止自建目录**：`utils2` / `helpers` / `common` / `shared` 等野目录一律不许创建；新文件必须放进骨架既定目录（见 `guardai.yml` 的 `allowed_dirs`，每条带用途说明）。
2. **写码前强制检索**：新增任何类/方法/工具函数之前，必须先查项目能力清单，确认没有已有实现：
   - 已接 guardAI MCP 的智能体：调用 `search_capability` 工具（query=关键词，如「上传」「Upload」「GetToken」）；
   - 未接 MCP：命令行执行 `guardAI search <关键词>`（能力清单缺失会自动现生成）。
   - 命中已有能力 → 优先复用/扩展已有实现，禁止换皮重写（只改名/改常量照样会被近似重复检测逮住）；重复副本必行为漂移（校验缺失、口径分叉），代价不是多几行代码；
   - 确无命中才允许新建，且新方法应归入已有职责类，不要碎片化。
3. **改完必复检**：每次创建/修改文件后运行 `guardAI check --mode changed`（全量核对用 `--mode all`），修到 0 违规才算完成；报告末尾的【给 AI 的修复指令】逐条执行。
4. **重复违规按指令修**：`重复检测` 报"复用已有实现 {file}:{line} 的「X.Y」"时，删除自己的重复实现改为调用该已有实现；确有实质差异则改写体现实质差异（仅改名/改常量不算差异）。
5. **放不下来问**：确需新目录或新位置时，停下来向用户确认，不要自由发挥。
6. **命名要达意，禁兜底名**：`Helper` / `Utils` / `Common` / `Manager` / `Processor` 等兜底名不得作类型名或目录名，名称必须表达单一职责（如 DateFormatter、WeekendChecker、ImageResizer）；命名遵循语言惯例（C#：接口 I 前缀、公共成员 PascalCase）；禁用 data1 / tmp / doSomething 这类无信息量名字；方法名必须与实现一致。
7. **禁止穿透分层直连数据访问**：上层（Controller / 接口层）禁止绕过服务层直连 ORM 上下文或数据库（如 C# Controller 注入 DbContext）；数据访问一律经服务层收口（缓存 / 权限 / 审计都在服务层）。
8. **出参禁止暴露持久化实体**：对外接口/服务出参必须走专用 DTO / 视图模型，禁止直接返回数据库实体或其列表（如 EF 的 User / Order）——数据模型不进 API 表层，防字段泄露与映射遗漏。
9. **禁止魔法串 / 魔法数内联**：地址、端口、URL、阈值、颜色字面量、状态码映射等一律提取到配置 / 常量类 / 枚举映射表；同一配置值不得在多处重复字面量。
<!-- guardAI:end -->

---

# apex-admin 项目使用手册（AI 编码必读）

> 本节面向 AI 编码工具：读懂本节即可直接参与本项目开发。有疑问先查本节，再查 README，最后问用户。

## 1. 项目速览

- **是什么**：开箱即用的后台管理前端模板（vben 演示模块对齐），纯前端 SPA，mock/live 双模数据层。
- **技术栈**：React 19 + TypeScript + TanStack Router（文件路由）+ TanStack Query/Table/Form + Base UI + Tailwind CSS v4 + Vite + pnpm。
- **常用命令**：`pnpm dev`（端口 **5180**）/ `pnpm build` / `pnpm typecheck` / `pnpm preview`。
- **构建要点**：`src/routeTree.gen.ts` 由 vite 插件在 dev/build 时**自动生成**，`tsr` CLI 不可用；typecheck 报「路由路径 not assignable」= 路由树没刷新，先 `pnpm build` 再 typecheck。

## 2. 目录结构

```
src/
  app.config.ts        # 应用配置 + NAV_GROUPS 导航树 + NavIcon 类型（改导航必来这）
  main.tsx             # 入口：Router/QueryClient/ThemeEngine/Toaster
  routeTree.gen.ts     # [自动生成，禁止手改]
  routes/              # 文件路由（TanStack Router 约定式）
    _auth/             # 带登录守卫与侧边栏布局的路由段
      examples/        # 演示页（vxe-table/、captcha/、form/ 等子目录分组）
  components/
    ui/                # 基础控件（Base UI 封装）：button/input/select/switch/badge/card/...
    shared/            # 业务通用件：demo-block/page-header/filter-bar/form-kit/stat-card/...
    layout/            # 布局壳：sidebar/topbar/tab-bar
  api/  stores/  mocks/  lib/  styles/
guardai.yml            # guardAI 规范门禁配置（新目录必须先进 allowed_dirs）
```

## 3. 路由与导航（三处同步铁律）

新增一个页面要**同步三处**，缺一处页面不进侧边栏或 TS 报错：

1. **路由文件**：`src/routes/_auth/examples/<分组>/<页面>.tsx`，文件顶部必须有
   `export const Route = createFileRoute('/_auth/examples/<分组>/<页面>')({ component: Page })`，路径字符串与文件位置严格对应。
2. **app.config.ts**：`NavIcon` 联合类型加图标键；`NAV_GROUPS` 对应分组 children 加 `{ label, to, icon }`。
3. **sidebar.tsx**：lucide 图标导入 + `ICONS` 映射加同名键。

## 4. 组件体系速查

| 组件 | 导入 | 用途 |
|---|---|---|
| `DemoBlock` | `@/components/shared/demo-block` | 演示块：title/desc/code 折叠，示例页统一外壳 |
| `PageHeader` | `@/components/shared/page-header` | 页头：eyebrow/title/badge/description/actions |
| `Button` | `@/components/ui/button` | variant: primary/outline/ghost/danger/soft/link，size: sm/md/lg/icon |
| `Input` `Textarea` `Label` | `@/components/ui/input` | 表单输入 |
| `AppSelect` | `@/components/ui/select` | Base UI 下拉（勿用原生 select） |
| `AppSwitch` | `@/components/ui/switch` | 开关 |
| `Checkbox` | `@/components/ui/checkbox` | 复选 |
| `Badge` `StatusBadge` | `@/components/ui/badge` | 徽章；StatusBadge 传 `status="success|failed|running|..."` 自动映射色 |
| `Card` | `@/components/ui/card` | 卡片容器 |
| `FilterBar` | `@/components/shared/filter-bar` | 筛选栏布局 |
| `toast` | `sonner` | 提示（全局 Toaster 已挂 bottom-center） |

**设计 token 类名**（用类名不要写死颜色）：
- 文本：`text-ink`（主）/ `text-muted`（次）/ `text-soft`（弱）
- 边框/背景：`border-line` / `bg-canvas`（页底）/ `bg-surface`（卡片）/ `bg-hover`
- 品牌色：`bg-brand-600` / `text-brand-600`
- 字号：正文 `text-[11.5px]`，注释 `text-[10.5px]`，页头 `text-[24px] font-semibold`

## 5. 新增演示页配方（照抄这 7 步）

1. 建 `src/routes/_auth/examples/<分组>/<页面>.tsx`；
2. 页首组合：`PageHeader`（eyebrow="示例 / <分组>"）+ 一个或多个 `DemoBlock`；
3. 交互控件用 §4 的组件 + token 类名，中文文案；
4. 三处同步（§3）：路由 + NavIcon/NAV_GROUPS + sidebar ICONS；
5. `guardai.yml` 的 `allowed_dirs` 补新目录（pre-commit 闸口要求）；
6. `pnpm typecheck && pnpm build` 全绿（build 刷新路由树）；
7. 交互元素加 `data-testid`，写 e2e 断言脚本跑 playwright 实测 + 截图入 `outputs/`。

## 6. 数据层约定

- mock/live 双模：`src/mocks/` 提供演示数据，`src/api/` 为真实接口层；示例页一律用 mock 数据自包含演示，不发真实请求。
- 并发请求竞态：用 reqSeq 递增序号丢弃过期响应（参考 examples/vxe-table/remote.tsx）。

## 7. 测试约定

- e2e 用 playwright-cli：脚本形态 `async () => { ... }` 用全局 `page`，断言收进 `t(name, fn)` + results 数组。
- 登录链：goto 任意受保护页 → 被重定向 /login → 点「登录控制台」→ waitForURL dashboard → 再 goto 目标页。
- 已知坑：getByRole name 是**子串**匹配（撞名用 `{ exact: true }` 或 `.first()`）；toast 与页面同文本会 strict 撞名；拖拽坐标换算要减去把手宽（参考 .e2e-captcha.js）。

## 8. 红线（违反会被闸口/CI 拦）

- 禁止手改 `routeTree.gen.ts`；禁止新建野目录（见 guardAI 段第 1 条）；
- 提交前 `guardAI check --mode changed` 必须 0 违规（pre-commit 会跑）；
- 包管理只用 pnpm；文案/注释/commit 全部中文（conventional commits）；
- 不引入新依赖前先问用户。
