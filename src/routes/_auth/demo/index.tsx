import { createFileRoute, redirect } from '@tanstack/react-router'

/** /demo 为演示分组入口，直接落到第一个子页 */
export const Route = createFileRoute('/_auth/demo/')({
  beforeLoad: () => {
    throw redirect({ to: '/demo/base' })
  },
})
