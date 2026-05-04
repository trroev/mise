import { Card } from "@mise/ui/components/Card"
import { expectNoAxeViolations } from "@mise/ui/test/axe"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

const TITLE_RE = /Cassoulet/

describe("Card", () => {
  it("renders as a link with the title and href", () => {
    render(
      <Card href="/recipes/x" lockUp={{ title: "Cassoulet", body: "Hearty" }} />
    )
    const link = screen.getByRole("link", { name: TITLE_RE })
    expect(link).toHaveAttribute("href", "/recipes/x")
  })

  it("has no axe violations", async () => {
    const { container } = render(
      <Card href="/x" lockUp={{ title: "Cassoulet" }} />
    )
    await expectNoAxeViolations(container)
  })
})
