#!/usr/bin/env node
// sync-template.js：从 apex-admin 主项目同步模板到 template/（开发脚手架时使用，不随 npm 包执行）
// 用法：node packages/create-apex-admin/sync-template.js
// 原则：只带"新项目开箱必需"的文件，缓存/产物/台账/脚手架自身一律不带。

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = fileURLToPath(new URL('.', import.meta.url))
const ROOT = resolve(HERE, '../..') // apex-admin 主项目根
const TEMPLATE = join(HERE, 'template')

// 要同步的文件/目录（相对主项目根）
const INCLUDE = [
  'src',
  'public',
  'docs',
  'index.html',
  'vite.config.ts',
  'tsconfig.json',
  'package.json',
  'pnpm-lock.yaml',
  '.npmrc',
  '.env.example',
  '.gitignore',
  '.gitattributes',
  'README.md',
  'LICENSE',
  'CONTRIBUTING.md',
  'AGENTS.md',
  'llms.txt',
  'guardai.yml',
  '.guard/duplicates-baseline.json',
  '.github/workflows/guardai.yml',
]

// 同步目录内部要跳过的条目（缓存/产物/私有台账）
const SKIP = new Set([
  'node_modules',
  'dist',
  '.git',
  '.workbuddy',
  '.tanstack',
  '.playwright-cli',
  '.workflow',
  '.guardai-snippets',
  'outputs',
  'records',
  'packages',
  'deploy-pages.yml', // Pages 部署是 apex-admin 专属配置，不进模板
])

function copyTree(from, to, rel = '') {
  let copied = 0
  for (const entry of readdirSync(from)) {
    if (SKIP.has(entry)) continue
    const src = join(from, entry)
    const dst = join(to, entry)
    const st = statSync(src)
    if (st.isDirectory()) {
      mkdirSync(dst, { recursive: true })
      copied += copyTree(src, dst, join(rel, entry))
    } else {
      cpSync(src, dst)
      copied++
    }
  }
  return copied
}

function main() {
  console.log(`同步模板：${ROOT}  →  ${TEMPLATE}\n`)

  // 清空重建 template/
  rmSync(TEMPLATE, { recursive: true, force: true })
  mkdirSync(TEMPLATE, { recursive: true })

  let total = 0
  for (const item of INCLUDE) {
    const src = join(ROOT, item)
    if (!existsSync(src)) {
      console.log(`  ⤫ 跳过（不存在）：${item}`)
      continue
    }
    const dst = join(TEMPLATE, item)
    const st = statSync(src)
    if (st.isDirectory()) {
      mkdirSync(dst, { recursive: true })
      const n = copyTree(src, dst)
      total += n
      console.log(`  ✔ 目录 ${item}/ （${n} 个文件）`)
    } else {
      mkdirSync(join(dst, '..'), { recursive: true })
      cpSync(src, dst)
      total++
      console.log(`  ✔ 文件 ${item}`)
    }
  }

  console.log(`\n✅ 模板同步完成，共 ${total} 个文件。`)
  console.log('提示：测试 `node cli.js <临时目录>` 验证脚手架产物，再 npm publish。')
}

main()
