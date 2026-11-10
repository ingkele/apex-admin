# create-apex-admin

[Apex Admin](https://github.com/ingkele/apex-admin) 官方脚手架——一条命令创建后台管理模板项目。

技术栈：React 19 · TanStack Router · Base UI · Tailwind v4 · Vite · TypeScript

## 用法

```bash
npm create apex-admin@latest my-admin
# 或
pnpm create apex-admin my-admin
```

然后：

```bash
cd my-admin
pnpm install    # 或 npm install / yarn
pnpm dev        # 启动开发服务器（默认 http://localhost:5180）
```

## 参数

| 参数 | 说明 | 默认 |
| --- | --- | --- |
| `[target]` | 目标目录 | 当前目录 `.` |
| `--pm <pm>` | 包管理器 pnpm / npm / yarn（影响提示文案） | `pnpm` |
| `--force` | 允许写入非空目录 | 关闭 |
| `-h, --help` | 显示帮助 | — |

## 生成的项目里有什么

- 完整的 Apex Admin 模板：权限、主题、多页签、mock/live 双模数据层、内置示例页
- `AGENTS.md` — AI 编码必读手册（把这个项目交给 AI 前先看）
- `llms.txt` — AI 能力索引
- guardAI 规范门禁配置（`guardai.yml` + 重复基线）
- GitHub Actions 规范检查工作流

## 开发（维护者）

模板内容来自主项目 `apex-admin/`，改动主项目后同步模板：

```bash
node packages/create-apex-admin/sync-template.js
node packages/create-apex-admin/cli.js /tmp/test-app   # 实测
```

## License

MIT
