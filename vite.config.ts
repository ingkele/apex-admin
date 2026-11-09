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
  },
  preview: {
    host: '127.0.0.1',
    port: 4180,
    strictPort: true,
  },
})
