import { COURSE_LABELS } from "@mise/features/utils/recipeLabels"
import { transformCloudinary } from "@mise/features/utils/transformCloudinary"
import type { Recipe } from "@mise/payload/payload-types"
import { Badge } from "@mise/ui/components/Badge"
import Image from "next/image"
import Link from "next/link"
import { match, P } from "ts-pattern"

type FeaturedRecipeProps = {
  recipe: Recipe
}

export function FeaturedRecipe({ recipe }: FeaturedRecipeProps) {
  const heroImage = match(recipe.heroImage)
    .with({ url: P.string }, (img) => ({
      url: img.url,
      alt: img.alt ?? recipe.title,
    }))
    .otherwise(() => null)

  const cuisineName = match(recipe.cuisine)
    .with({ name: P.string }, (c) => c.name)
    .otherwise(() => null)

  return (
    <section className="constrainer space-y-4 pb-16">
      <p className="font-sans text-caption text-text-muted uppercase tracking-widest">
        Featured recipe
      </p>
      <Link
        className="group grid gap-8 overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:grid-cols-[3fr_2fr] lg:gap-12"
        href={`/recipes/${recipe.slug}`}
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-surface lg:aspect-4/3">
          {heroImage && (
            <Image
              alt={heroImage.alt}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              src={transformCloudinary({
                url: heroImage.url,
                transform: "f_auto,q_auto,c_fill,g_auto,w_1400,h_1050",
              })}
            />
          )}
        </div>
        <div className="flex flex-col justify-center space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {recipe.course && (
              <Badge variant="muted">{COURSE_LABELS[recipe.course]}</Badge>
            )}
            {cuisineName && <Badge variant="muted">{cuisineName}</Badge>}
          </div>
          <h2 className="font-display text-heading-lg text-text-primary lg:text-heading-xl">
            {recipe.title}
          </h2>
          {recipe.description && (
            <p className="max-w-prose font-sans text-body text-text-secondary">
              {recipe.description}
            </p>
          )}
        </div>
      </Link>
    </section>
  )
}
