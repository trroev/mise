import { describe, expect, it, vi } from "vitest"
import { buildVerificationEmail, createVerificationEmailSender } from "./index"

const user = { email: "chef@example.com", name: "Trevor" }
const url = "https://mise.example.com/api/auth/verify-email?token=abc123"

describe("buildVerificationEmail", () => {
  it("includes the verification url in html and text", () => {
    const content = buildVerificationEmail({ url, userName: user.name })
    expect(content.html).toContain(url)
    expect(content.text).toContain(url)
  })

  it("greets the user by name when provided", () => {
    const content = buildVerificationEmail({ url, userName: "Trevor" })
    expect(content.html).toContain("Hi Trevor,")
    expect(content.text).toContain("Hi Trevor,")
  })

  it("falls back to a generic greeting without a name", () => {
    const content = buildVerificationEmail({ url })
    expect(content.text).toContain("Hi,")
  })

  it("sets a verification subject", () => {
    const content = buildVerificationEmail({ url })
    expect(content.subject).toBe("Verify your email address")
  })
})

describe("createVerificationEmailSender", () => {
  it("resolves without sending when no api key or client is configured", async () => {
    const send = createVerificationEmailSender()
    await expect(send({ user, url })).resolves.toBeUndefined()
  })

  it("sends the built email through the client", async () => {
    const client = { send: vi.fn().mockResolvedValue({ error: null }) }
    const send = createVerificationEmailSender({
      client,
      from: "Mise <noreply@mise.example.com>",
    })
    await send({ user, url })
    expect(client.send).toHaveBeenCalledWith({
      from: "Mise <noreply@mise.example.com>",
      to: user.email,
      subject: "Verify your email address",
      html: expect.stringContaining(url),
      text: expect.stringContaining(url),
    })
  })

  it("defaults the from address when none is configured", async () => {
    const client = { send: vi.fn().mockResolvedValue({ error: null }) }
    const send = createVerificationEmailSender({ client })
    await send({ user: { email: user.email, name: null }, url })
    expect(client.send).toHaveBeenCalledWith(
      expect.objectContaining({ from: "Mise <onboarding@resend.dev>" })
    )
  })

  it("throws when the client reports an error", async () => {
    const client = {
      send: vi.fn().mockResolvedValue({ error: { message: "rate limited" } }),
    }
    const send = createVerificationEmailSender({ client })
    await expect(send({ user, url })).rejects.toThrow(
      "Failed to send verification email: rate limited"
    )
  })
})
