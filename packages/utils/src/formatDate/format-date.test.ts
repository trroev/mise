import { describe, expect, it } from "vitest"
import { formatDate } from "./index"

describe("formatDate", () => {
  it("should format a Date with long month by default", () => {
    expect(formatDate(new Date("2026-03-05T12:00:00Z"))).toBe("March 5, 2026")
  })

  it("should accept an ISO string", () => {
    expect(formatDate("2026-03-05T12:00:00Z")).toBe("March 5, 2026")
  })

  it("should support short style", () => {
    expect(formatDate("2026-03-05T12:00:00Z", { style: "short" })).toBe(
      "Mar 5, 2026"
    )
  })
})
