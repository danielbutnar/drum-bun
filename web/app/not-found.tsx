import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="type-expanded text-4xl font-extrabold tracking-tight">Wrong exit</h1>
      <p className="mt-4 text-lg">This page does not exist. The route planner and the agent are on the home page.</p>
      <p className="mt-6">
        <Link href="/" className="rounded-md bg-road px-4 py-2.5 font-semibold text-paper hover:bg-road-dark">
          Plan a trip
        </Link>
      </p>
    </div>
  )
}
