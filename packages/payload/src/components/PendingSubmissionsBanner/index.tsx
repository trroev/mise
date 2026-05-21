import type { BeforeListTableServerProps } from "payload"

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
    <div
      style={{
        alignItems: "center",
        background: "var(--theme-warning-100, #fff4d6)",
        border: "1px solid var(--theme-warning-500, #e0a800)",
        borderRadius: "var(--style-radius-s, 4px)",
        color: "var(--theme-warning-900, #5a3e00)",
        display: "flex",
        gap: "var(--base, 1rem)",
        justifyContent: "space-between",
        marginBottom: "var(--base, 1rem)",
        padding: "var(--base, 1rem)",
      }}
    >
      <span>
        <strong>{totalDocs}</strong> pending {label} awaiting review.
      </span>
      <a
        href={filterHref}
        style={{ color: "inherit", textDecoration: "underline" }}
      >
        Review pending submissions →
      </a>
    </div>
  )
}
