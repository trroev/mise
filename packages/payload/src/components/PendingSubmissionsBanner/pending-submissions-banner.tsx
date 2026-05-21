import type { BeforeListTableServerProps } from "payload"

import classNames from "./pending-submissions-banner.module.scss"

export async function PendingSubmissionsBanner({
  collectionSlug,
  payload,
  user,
}: BeforeListTableServerProps) {
  if (collectionSlug !== "recipes") {
    return null
  }

  const { totalDocs } = await payload.count({
    collection: "recipes",
    overrideAccess: false,
    user,
    where: { _status: { equals: "draft" } },
  })

  if (totalDocs === 0) {
    return null
  }

  const filterHref =
    "/admin/collections/recipes?where[or][0][and][0][_status][equals]=draft"
  const label = totalDocs === 1 ? "submission" : "submissions"

  return (
    <div className={classNames.banner}>
      <span>
        <strong>{totalDocs}</strong> pending {label} awaiting review.
      </span>
      <a className={classNames.link} href={filterHref}>
        Review pending submissions →
      </a>
    </div>
  )
}
