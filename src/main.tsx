import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { routeTree } from './routeTree.gen'
import { initThemeEngine } from './stores/theme.store'
import './styles/index.css'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  // 子路径部署（VITE_BASE=/apex-admin/）时路由需知道 basepath，本地为 '/' 不影响
  basepath: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

initThemeEngine()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {/* 与原型一致：底部居中提示，避免遮挡页头操作按钮 */}
      <Toaster richColors position="bottom-center" closeButton />
    </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
