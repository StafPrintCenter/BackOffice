import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/invite')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/invite"!</div>
}
