export type SavedRecipesActionResult<TData = void> =
  | { status: "ok"; data: TData }
  | { status: "unauthenticated" }
  | { status: "error"; message: string }
