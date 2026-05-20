import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { RecipeSubmissionForm } from "~/components/RecipeSubmissionForm"
import { auth } from "~/lib/auth.server"
import { getCuisines } from "~/lib/queries/cuisines"
import { getUnits } from "~/lib/queries/units"

export const metadata: Metadata = {
  title: "Submit a recipe",
  robots: { index: false, follow: false },
}

export default async function SubmitPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    redirect("/sign-in?callbackUrl=/submit")
  }

  const [cuisines, units] = await Promise.all([getCuisines(), getUnits()])

  return (
    <section className="constrainer flex flex-col space-y-10 py-10">
      <div className="space-y-1">
        <h1 className="font-display text-heading-xl text-text-primary">
          Submit a recipe
        </h1>
        <p className="text-body text-text-secondary">
          Share a recipe with the Mise community. A chef will review your
          submission before it&apos;s published.
        </p>
      </div>
      <RecipeSubmissionForm cuisines={cuisines} units={units} />
    </section>
  )
}
