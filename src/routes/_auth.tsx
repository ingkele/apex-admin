import * as React from 'react'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Sidebar } from '@/components/layout/sidebar'
import { TabBar } from '@/components/layout/tab-bar'
import { Topbar } from '@/components/layout/topbar'
import { ThemeDrawer } from '@/components/shared/theme-drawer'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    const { user } = useAuthStore.getState()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  const themeDrawerOpen = useUiStore((s) => s.themeDrawerOpen)
  const openThemeDrawer = useUiStore((s) => s.openThemeDrawer)
  const setThemeDrawerOpen = useUiStore((s) => s.setThemeDrawerOpen)

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenTheme={openThemeDrawer} />
        <TabBar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1580px] px-7 py-7 2xl:px-10">
            <Outlet />
          </div>
        </main>
      </div>
      <ThemeDrawer open={themeDrawerOpen} onClose={() => setThemeDrawerOpen(false)} />
    </div>
  )
}
