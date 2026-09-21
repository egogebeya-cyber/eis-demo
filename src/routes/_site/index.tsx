import { createFileRoute } from '@tanstack/react-router'
import { GordonstounHome } from '~/components/gordonstoun-home'

export const Route = createFileRoute('/_site/')({
  component: HomePage,
})

function HomePage() {
  return <GordonstounHome />
}
