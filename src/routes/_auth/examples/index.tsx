import { createFileRoute, redirect } from '@tanstack/react-router'

/** /examples 为示例分组入口，直接落到第一个子页 */
export const Route = createFileRoute('/_auth/examples/')({
  beforeLoad: () => {
    throw redirect({ to: '/examples/list' })
  },
})
