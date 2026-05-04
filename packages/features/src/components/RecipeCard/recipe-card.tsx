import {
  COURSE_LABELS,
  DIFFICULTY_LABELS,
} from "@mise/features/utils/recipeLabels"
import type { Recipe } from "@mise/payload/payload-types"
import { Badge } from "@mise/ui/components/Badge"
import { Card } from "@mise/ui/components/Card"
import { formatDuration } from "@mise/utils/formatDuration"
import { RiImage2Line } from "@remixicon/react"
import Image from "next/image"
import { match, P } from "ts-pattern"

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

  const hasBadges = Boolean(recipe.course ?? recipe.difficulty)

  return (
    <Card
      badges={
        hasBadges ? (
          <>
            {recipe.course && (
              <Badge variant="muted">{COURSE_LABELS[recipe.course]}</Badge>
            )}
            {recipe.difficulty && (
              <Badge>{DIFFICULTY_LABELS[recipe.difficulty]}</Badge>
            )}
          </>
        ) : undefined
      }
      className={className}
      href={`/recipes/${recipe.slug}`}
      lockUp={{
        title: recipe.title,
        body:
          typeof recipe.totalTime === "number"
            ? formatDuration(recipe.totalTime)
            : undefined,
      }}
      media={
        heroUrl ? (
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
        )
      }
    />
  )
}
