import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/trainings/sessions/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/trainings/sessions/"!</div>
}
