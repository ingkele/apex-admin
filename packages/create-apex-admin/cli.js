#!/usr/bin/env node
// create-apex-admin：Apex Admin 脚手架 CLI（零运行时依赖）
// 用法：
//   npm create apex-admin@latest my-app
//   npx create-apex-admin my-app
//   pnpm create apex-admin my-app --pm pnpm
//
// 参数：
//   [target]   目标目录（默认当前目录 .）
//   --pm       包管理器 pnpm|npm|yarn（默认 pnpm，影响提示文案）
//   --force    允许写入非空目录
//   -h/--help  帮助

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const TEMPLATE_DIR = join(fileURLToPath(new URL('.', import.meta.url)), 'template')
const pkg = JSON.parse(readFileSync(join(fileURLToPath(new URL('.', import.meta.url)), 'package.json'), 'utf8'))

function parseArgs(argv) {
  const args = { target: '.', pm: 'pnpm', force: false, help: false }
  const rest = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--force') args.force = true
    else if (a === '-h' || a === '--help') args.help = true
    else if (a === '--pm') args.pm = argv[++i]
    else if (a.startsWith('--pm=')) args.pm = a.slice(5)
    else if (!a.startsWith('-')) rest.push(a)
  }
  if (rest[0]) args.target = rest[0]
  return args
}

function sanitizeName(dirName) {
  return dirName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'apex-admin-app'
}

function help() {
  console.log(`
create-apex-admin v${pkg.version} — Apex Admin 项目脚手架

用法：
  npm create apex-admin@latest [target] [options]
  npx create-apex-admin [target] [options]

参数：
  target          目标目录，默认当前目录（.）
  --pm <pm>       包管理器 pnpm | npm | yarn，默认 pnpm
  --force         允许写入非空目录
  -h, --help      显示帮助

示例：
  npm create apex-admin@latest my-admin
  pnpm create apex-admin my-admin --pm pnpm
`)
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    help()
    return
  }

  console.log(`\n⚡ create-apex-admin v${pkg.version} — 创建 Apex Admin 项目\n`)

  // 1. 校验模板存在
  if (!existsSync(join(TEMPLATE_DIR, 'package.json'))) {
    console.error('❌ 模板目录缺失（template/）。请重新安装：npm create apex-admin@latest')
    process.exit(1)
  }

  // 2. 校验目标目录
  const targetDir = resolve(args.target)
  const name = sanitizeName(basename(targetDir))
  if (existsSync(targetDir)) {
    const entries = readdirSync(targetDir).filter((e) => e !== '.git')
    if (entries.length > 0 && !args.force) {
      console.error(`❌ 目标目录非空：${targetDir}\n   加 --force 可强制写入，或换一个空目录。`)
      process.exit(1)
    }
  }

  // 3. 拷贝模板
  console.log(`📁 目标目录：${targetDir}`)
  mkdirSync(targetDir, { recursive: true })
  cpSync(TEMPLATE_DIR, targetDir, { recursive: true })

  // 4. 替换 package.json 的 name
  const pkgPath = join(targetDir, 'package.json')
  const newPkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  newPkg.name = name
  writeFileSync(pkgPath, JSON.stringify(newPkg, null, 2) + '\n')

  // 5. 下一步提示
  const cd = args.target === '.' ? '' : `  cd ${args.target}\n`
  const install = args.pm === 'npm' ? 'npm install' : args.pm === 'yarn' ? 'yarn' : 'pnpm install'
  const dev = args.pm === 'npm' ? 'npm run dev' : args.pm === 'yarn' ? 'yarn dev' : 'pnpm dev'
  console.log(`✅ 项目创建完成（包名：${name}）

下一步：
${cd}  ${install}
  ${dev}          # 启动开发服务器（默认 http://localhost:5180）

📚 文档：
  README.md        项目说明
  AGENTS.md        AI 编码必读手册（把这个项目交给 AI 前先看）
  llms.txt         AI 能力索引
`)
}

main()
