import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

/**
 * SPA 深链兜底（GitHub Pages 等静态托管）：
 * 1. 未知/动态路由 → 404.html（内容同 index.html：状态码 404 但应用正常启动并匹配 $ 参数路由）
 * 2. 静态路由 → <path>.html（GitHub Pages 无扩展名解析 /xxx 命中 xxx.html 返回 200，深链刷新零 404 噪音）
 *              + <path>/index.html（目录索引兜底；/xxx/ 尾斜杠形态也返回 200）
 * 所有副本内置「尾斜杠归一脚本」：路由不认尾斜杠（实测 /services/ 落空壳 404 页），
 * 进应用前先 history.replaceState 去掉尾斜杠；等于 base 的根路径是合法首页，不归一。
 * GitHub Pages 对同名 xxx.html 与 xxx/ 目录的解析先后无官方保证，两份都放壳+归一即可全覆盖。
 */
function spaFallback(): Plugin {
  return {
    name: 'spa-fallback',
    apply: 'build',
    closeBundle() {
      const root = fileURLToPath(new URL('.', import.meta.url))
      const dist = join(root, 'dist')
      const base = process.env.VITE_BASE || '/'
      const stripScript = `<script>(function(){var p=location.pathname;if(p.endsWith('/')&&p!==${JSON.stringify(base)}){history.replaceState(null,'',p.replace(/\\/+$/,'')+location.search+location.hash)}})();</script>`
      const html = readFileSync(join(dist, 'index.html'), 'utf8').replace('<head>', `<head>${stripScript}`)

      const writeShell = (target: string) => {
        mkdirSync(dirname(target), { recursive: true })
        writeFileSync(target, html)
      }

      writeShell(join(dist, '404.html'))

      // 从路由树提取静态全路径（跳过 $ 动态段与根路径），去重后逐一落副本
      const routeTree = readFileSync(join(root, 'src/routeTree.gen.ts'), 'utf8')
      const rels = new Set<string>()
      for (const m of routeTree.matchAll(/path: '([^']+)'/g)) {
        const p = m[1]
        if (p === '/' || p.includes('$')) continue
        const rel = p.replace(/^\/+|\/+$/g, '')
        if (rel) rels.add(rel)
      }
      for (const rel of rels) {
        writeShell(join(dist, `${rel}.html`))
        writeShell(join(dist, rel, 'index.html'))
      }
    },
  }
}

export default defineConfig({
  // 子路径部署（如 GitHub Pages 的 /apex-admin/）由 CI 设 VITE_BASE，本地保持 /
  base: process.env.VITE_BASE || '/',
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    spaFallback(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // 显式绑 IPv4：localhost 在部分环境下解析到 ::1，浏览器/扩展走 IPv4 会连不上
    host: '127.0.0.1',
    port: 5180,
    // 端口被占时直接报错，绝不静默漂移（否则预览地址会变成 5181/5182 让人找不到）
    strictPort: true,
    // 开发期后端代理 —— 接真实后端时取消注释并改成实际地址：
    // 浏览器请求 127.0.0.1:5180/api/**（同源），由 Vite 转发到后端，天然无跨域。
    // 注意：.env 设 VITE_DATA_MODE=live 后才走真实请求；BASE_URL 保持默认 /api。
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:5000',
    //     changeOrigin: true,
    //     // 后端路由若不带 /api 前缀（如 ASP.NET Core 默认 [Route("api/...")] 已带则无需）：
    //     // rewrite: (path) => path.replace(/^\/api/, ''),
    //   },
    // },
  },
  preview: {
    host: '127.0.0.1',
    port: 4180,
    strictPort: true,
  },
})
