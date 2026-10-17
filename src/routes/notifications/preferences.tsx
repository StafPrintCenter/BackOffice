import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/notifications/preferences')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/notifications/preferences"!</div>
}
