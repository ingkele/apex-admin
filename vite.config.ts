import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    react(),
    tailwindcss(),
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
