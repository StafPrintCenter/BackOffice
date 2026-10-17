import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/notifications/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/notifications/$id"!</div>
}
