import { Skeleton } from "@mise/ui/components/Skeleton"

const RECIPE_ROW_KEYS = Array.from({ length: 4 }, (_, i) => `recipe-${i}`)

export default function ProfileLoading() {
  return (
    <section className="constrainer flex flex-col space-y-10 py-10">
      <div className="space-y-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-5 w-64" />
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
        </dl>
        <Skeleton className="h-10 w-28" />
      </div>

      <section className="space-y-4 border-border/40 border-t pt-8">
        <Skeleton className="h-8 w-40" />
        <ul className="divide-y divide-border/40">
          {RECIPE_ROW_KEYS.map((key) => (
            <li
              className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              key={key}
            >
              <div className="space-y-2">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </li>
          ))}
        </ul>
      </section>
    </section>
  )
}
