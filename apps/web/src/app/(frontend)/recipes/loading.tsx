import { Skeleton } from "@mise/ui/components/Skeleton"

const CARD_KEYS = Array.from({ length: 9 }, (_, i) => `card-${i}`)

export default function RecipesLoading() {
  return (
    <section className="constrainer flex flex-col space-y-8 py-10">
      <Skeleton className="h-10 w-48" />
      <div className="flex flex-col gap-8">
        <Skeleton className="h-11 w-full max-w-md" />
        <div className="flex items-start gap-8">
          <aside className="hidden w-56 shrink-0 flex-col gap-4 lg:flex">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </aside>
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <Skeleton className="h-4 w-56" />
            <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {CARD_KEYS.map((key) => (
                <li className="flex flex-col gap-3" key={key}>
                  <Skeleton className="aspect-[4/3] w-full rounded-md" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
