import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-3xl font-semibold text-school-dark">Page not found</h1>
      <p className="mt-3 text-zinc-600">That page does not exist.</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-school px-4 py-2 font-semibold text-white">
        Back home
      </Link>
    </div>
  )
}
