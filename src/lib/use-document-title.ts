import * as React from 'react'
import { appConfig } from '@/app.config'
import { HOME_TAB, resolveRouteMeta } from '@/lib/route-meta'

/**
 * 标签页标题随路由同步：工作台显示应用全名，其余页面「{页面} · {应用简称}」。
 * 标题来源与面包屑/页签共用 resolveRouteMeta，三处不会打架。
 */
export function useDocumentTitle(pathname: string) {
  React.useEffect(() => {
    if (pathname === HOME_TAB.path) {
      document.title = appConfig.fullName
      return
    }
    const meta = resolveRouteMeta(pathname)
    document.title = meta.title === '未知页面' ? appConfig.fullName : `${meta.title} · ${appConfig.shortName}`
  }, [pathname])
}
