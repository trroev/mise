import { Badge } from "@mise/ui/components/Badge"
import { formatTotalTime } from "@mise/ui/components/RecipeCard"
import {
  COURSE_LABELS,
  DIETARY_TAG_LABELS,
  DIFFICULTY_LABELS,
} from "@mise/utils/recipeLabels"
import { RiTimerLine } from "@remixicon/react"
import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getPublishedRecipes } from "~/lib/queries/published-recipes"
import { getRecipeBySlug } from "~/lib/queries/recipe-by-slug"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const recipes = await getPublishedRecipes()
  return recipes.map((recipe) => ({ slug: recipe.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)
  if (!recipe) {
    return {}
  }

  let ogImage: string | undefined
  if (recipe.meta?.image && typeof recipe.meta.image === "object") {
    ogImage = recipe.meta.image.url ?? undefined
  } else if (recipe.heroImage && typeof recipe.heroImage === "object") {
    ogImage = recipe.heroImage.url ?? undefined
  }

  return {
    title: recipe.meta?.title ?? `${recipe.title} | Mise`,
    description: recipe.meta?.description ?? recipe.description ?? undefined,
    openGraph: ogImage ? { images: [{ url: ogImage }] } : undefined,
  }
}

export default async function RecipeDetailPage({ params }: Props) {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)
  if (!recipe) {
    notFound()
  }

  const heroUrl =
    recipe.heroImage && typeof recipe.heroImage === "object"
      ? (recipe.heroImage.url ?? null)
      : null

  const heroAlt =
    recipe.heroImage && typeof recipe.heroImage === "object"
      ? recipe.heroImage.alt
      : recipe.title

  const cuisineName =
    recipe.cuisine && typeof recipe.cuisine === "object"
      ? recipe.cuisine.name
      : null

  const hasTime =
    recipe.prepTime != null ||
    recipe.cookTime != null ||
    recipe.totalTime != null

  return (
    <article>
      {heroUrl && (
        <div className="relative aspect-video w-full overflow-hidden bg-surface">
          <Image
            alt={heroAlt}
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src={heroUrl}
          />
        </div>
      )}

      <div className="constrainer space-y-10 py-10">
        <header className="space-y-4">
          <h1 className="font-display text-heading-xl text-text-primary">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="max-w-prose font-sans text-body-lg text-text-secondary">
              {recipe.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {recipe.course && (
              <Badge variant="muted">{COURSE_LABELS[recipe.course]}</Badge>
            )}
            {cuisineName && <Badge variant="muted">{cuisineName}</Badge>}
            {recipe.difficulty && (
              <Badge>{DIFFICULTY_LABELS[recipe.difficulty]}</Badge>
            )}
            {recipe.dietaryTags?.map((tag) => (
              <Badge key={tag} variant="muted">
                {DIETARY_TAG_LABELS[tag]}
              </Badge>
            ))}
          </div>
        </header>

        {hasTime && (
          <div className="flex gap-8 border-border border-y py-4">
            {recipe.prepTime != null && (
              <div>
                <p className="font-sans text-caption text-text-muted uppercase tracking-widest">
                  Prep
                </p>
                <p className="font-sans text-body text-text-primary">
                  {formatTotalTime(recipe.prepTime)}
                </p>
              </div>
            )}
            {recipe.cookTime != null && (
              <div>
                <p className="font-sans text-caption text-text-muted uppercase tracking-widest">
                  Cook
                </p>
                <p className="font-sans text-body text-text-primary">
                  {formatTotalTime(recipe.cookTime)}
                </p>
              </div>
            )}
            {recipe.totalTime != null && (
              <div>
                <p className="font-sans text-caption text-text-muted uppercase tracking-widest">
                  Total
                </p>
                <p className="font-sans text-body text-text-primary">
                  {formatTotalTime(recipe.totalTime)}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
          <section>
            <h2 className="mb-6 font-display text-heading-lg text-text-primary">
              Ingredients
            </h2>
            <div className="space-y-6">
              {recipe.ingredientGroups.map((group, gi) => (
                <div key={group.id ?? gi}>
                  {group.groupLabel && (
                    <h3 className="mb-3 font-medium font-sans text-body-sm text-text-muted uppercase tracking-widest">
                      {group.groupLabel}
                    </h3>
                  )}
                  <ul className="space-y-2">
                    {group.ingredients.map((ingredient, ii) => {
                      const unitLabel =
                        typeof ingredient.unit === "object"
                          ? ingredient.unit.abbreviation
                          : ingredient.unit
                      return (
                        <li
                          className="font-sans text-body text-text-primary"
                          key={ingredient.id ?? ii}
                        >
                          <span className="text-text-secondary">
                            {ingredient.quantity} {unitLabel}
                          </span>{" "}
                          {ingredient.name}
                          {ingredient.prepNote && (
                            <span className="text-text-muted">
                              , {ingredient.prepNote}
                            </span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-6 font-display text-heading-lg text-text-primary">
              Instructions
            </h2>
            <div className="space-y-8">
              {recipe.instructionGroups.map((group, gi) => (
                <div key={group.id ?? gi}>
                  {group.groupLabel && (
                    <h3 className="mb-4 font-medium font-sans text-body-sm text-text-muted uppercase tracking-widest">
                      {group.groupLabel}
                    </h3>
                  )}
                  <ol className="space-y-6">
                    {group.steps.map((step, si) => (
                      <li className="flex gap-4" key={step.id ?? si}>
                        <span className="shrink-0 pt-0.5 font-display text-accent text-heading-md leading-none">
                          {si + 1}
                        </span>
                        <div className="space-y-2">
                          <p className="font-sans text-body text-text-primary">
                            {step.description}
                          </p>
                          {step.timerMinutes && (
                            <Badge
                              className="inline-flex items-center gap-1"
                              variant="muted"
                            >
                              <RiTimerLine aria-hidden="true" size={12} />
                              {step.timerMinutes} min
                            </Badge>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </article>
  )
}
