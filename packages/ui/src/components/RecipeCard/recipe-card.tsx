import type { Recipe } from "@mise/payload/payload-types"
import { Badge } from "@mise/ui/components/Badge"
import { cn } from "@mise/ui/utils/cn"
import { COURSE_LABELS, DIFFICULTY_LABELS } from "@mise/utils/recipeLabels"
import { RiImage2Line } from "@remixicon/react"
import Image from "next/image"
import Link from "next/link"
import { match, P } from "ts-pattern"
import { formatTotalTime } from "./format-total-time"

export type RecipeCardProps = {
  recipe: Recipe
  className?: string
}

export const RecipeCard = ({ recipe, className }: RecipeCardProps) => {
  const heroUrl = match(recipe.heroImage)
    .with(P.nullish, () => null)
    .with(P.string, () => null)
    .with({ url: P.string }, ({ url }) => url)
    .with(P.nonNullable, () => null)
    .exhaustive()

  const heroAlt = match(recipe.heroImage)
    .with(P.nullish, () => recipe.title)
    .with(P.string, () => recipe.title)
    .with({ alt: P.string }, ({ alt }) => alt)
    .exhaustive()

  return (
    <Link
      className={cn(
        "group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      href={`/recipes/${recipe.slug}`}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-surface">
        {heroUrl ? (
          <Image
            alt={heroAlt}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            src={heroUrl}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <RiImage2Line aria-hidden="true" size={32} />
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {recipe.course && (
          <Badge variant="muted">{COURSE_LABELS[recipe.course]}</Badge>
        )}
        {recipe.difficulty && (
          <Badge>{DIFFICULTY_LABELS[recipe.difficulty]}</Badge>
        )}
      </div>
      <h3 className="mt-2 font-display text-heading-md text-text-primary">
        {recipe.title}
      </h3>
      {typeof recipe.totalTime === "number" && (
        <p className="mt-1 font-sans text-body-sm text-text-secondary">
          {formatTotalTime(recipe.totalTime)}
        </p>
      )}
    </Link>
  )
}
