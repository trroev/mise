import type { CollectionBeforeChangeHook } from "payload"
import { match, P } from "ts-pattern"

export const computeTotalTime: CollectionBeforeChangeHook = ({ data }) => {
  const totalTime = match<[unknown, unknown]>([data.prepTime, data.cookTime])
    .with([P.number, P.number], ([prep, cook]) => prep + cook)
    .with([P.number, P._], ([prep]) => prep)
    .with([P._, P.number], ([, cook]) => cook)
    .otherwise(() => undefined)

  return { ...data, totalTime }
}
