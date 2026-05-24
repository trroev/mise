export type CollectionsActionResult<TData = void> =
  | { status: "ok"; data: TData }
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "validation-error"; field: string; message: string }
