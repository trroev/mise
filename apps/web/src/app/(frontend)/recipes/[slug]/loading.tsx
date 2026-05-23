import { Skeleton } from "@mise/ui/components/Skeleton"

const INGREDIENT_KEYS = Array.from({ length: 6 }, (_, i) => `ingredient-${i}`)
const STEP_KEYS = Array.from({ length: 5 }, (_, i) => `step-${i}`)

export default function RecipeDetailLoading() {
  return (
    <article>
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="constrainer space-y-10 py-10">
        <header className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-5 w-full max-w-prose" />
          <Skeleton className="h-5 w-2/3 max-w-prose" />
          <Skeleton className="h-4 w-40" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </header>

        <div className="flex gap-8 border-border border-y py-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
          <section className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-10 w-32" />
            {INGREDIENT_KEYS.map((key) => (
              <Skeleton className="h-5 w-full" key={key} />
            ))}
          </section>

          <section className="space-y-6">
            <Skeleton className="h-8 w-40" />
            <ol className="space-y-6">
              {STEP_KEYS.map((key) => (
                <li className="flex gap-4" key={key}>
                  <Skeleton className="h-8 w-6 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </article>
  )
}
