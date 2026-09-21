import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/portal/attendance-mark')({
  beforeLoad: () => {
    throw redirect({ to: '/portal/attendance' })
  },
})
