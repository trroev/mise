import "server-only"

import type { ActionResult } from "@mise/types/ActionResult"
import { captureException } from "@sentry/nextjs"
import { unstable_rethrow } from "next/navigation"

type ServerActionOptions<TResult> = {
  fallback: TResult
}

export function serverAction<TArgs extends ReadonlyArray<unknown>, TData>(
  action: (...args: TArgs) => Promise<ActionResult<TData>>
): (...args: TArgs) => Promise<ActionResult<TData>>
export function serverAction<TArgs extends ReadonlyArray<unknown>, TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  options: ServerActionOptions<TResult>
): (...args: TArgs) => Promise<TResult>
export function serverAction<TArgs extends ReadonlyArray<unknown>, TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  options?: ServerActionOptions<TResult>
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      return await action(...args)
    } catch (error) {
      unstable_rethrow(error)
      captureException(error)
      if (options) {
        return options.fallback
      }
      return {
        status: "error",
        message: "Something went wrong. Please try again.",
        code: "INTERNAL_ERROR",
      } as TResult
    }
  }
}
