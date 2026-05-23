import { Skeleton } from "@mise/ui/components/Skeleton"

const FIELDSET_KEYS = ["meta", "ingredients", "instructions"]

export default function SubmitLoading() {
  return (
    <section className="constrainer flex flex-col space-y-10 py-10">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <div className="space-y-8">
        {FIELDSET_KEYS.map((key) => (
          <div className="space-y-4" key={key}>
            <Skeleton className="h-6 w-40" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ))}
        <Skeleton className="h-11 w-32" />
      </div>
    </section>
  )
}
