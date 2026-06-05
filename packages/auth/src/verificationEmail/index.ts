import { createLogger } from "@mise/logger"
import { Resend } from "resend"

const log = createLogger({ name: "auth.verification-email" })

const DEFAULT_FROM = "Mise <onboarding@resend.dev>"

export type VerificationEmailContent = {
  readonly subject: string
  readonly html: string
  readonly text: string
}

export const buildVerificationEmail = ({
  url,
  userName,
}: {
  readonly url: string
  readonly userName?: string
}): VerificationEmailContent => {
  const greeting = userName ? `Hi ${userName},` : "Hi,"
  return {
    subject: "Verify your email address",
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#faf9f7;font-family:Helvetica,Arial,sans-serif;color:#1f1d1a;">
    <table role="presentation" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px;">
      <tr>
        <td>
          <h1 style="margin:0 0 16px;font-size:20px;">Welcome to Mise</h1>
          <p style="margin:0 0 8px;font-size:14px;line-height:1.6;">${greeting}</p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;">
            Confirm your email address to finish setting up your account.
          </p>
          <a href="${url}" style="display:inline-block;background:#1f1d1a;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:14px;">
            Verify email
          </a>
          <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#6b6963;">
            If the button doesn't work, copy and paste this link into your browser:<br />
            <a href="${url}" style="color:#6b6963;word-break:break-all;">${url}</a>
          </p>
          <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#6b6963;">
            If you didn't create a Mise account, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    text: `${greeting}

Confirm your email address to finish setting up your Mise account:

${url}

If you didn't create a Mise account, you can safely ignore this email.`,
  }
}

export type SendVerificationEmailArgs = {
  readonly user: { readonly email: string; readonly name?: string | null }
  readonly url: string
}

export type SendVerificationEmail = (
  args: SendVerificationEmailArgs
) => Promise<void>

type EmailClient = {
  readonly send: (payload: {
    readonly from: string
    readonly to: string
    readonly subject: string
    readonly html: string
    readonly text: string
  }) => Promise<{ readonly error: { readonly message: string } | null }>
}

export const createVerificationEmailSender = ({
  apiKey,
  from,
  client,
}: {
  readonly apiKey?: string
  readonly from?: string
  readonly client?: EmailClient
} = {}): SendVerificationEmail => {
  if (!(apiKey || client)) {
    return ({ user, url }: SendVerificationEmailArgs): Promise<void> => {
      log
        .withMetadata({ email: user.email, url })
        .info(
          "RESEND_API_KEY is not set — follow the logged url to verify this account"
        )
      return Promise.resolve()
    }
  }
  const emails: EmailClient = client ?? new Resend(apiKey).emails
  return async ({ user, url }: SendVerificationEmailArgs): Promise<void> => {
    const content = buildVerificationEmail({
      url,
      userName: user.name ?? undefined,
    })
    const { error } = await emails.send({
      from: from ?? DEFAULT_FROM,
      to: user.email,
      subject: content.subject,
      html: content.html,
      text: content.text,
    })
    if (error) {
      throw new Error(`Failed to send verification email: ${error.message}`)
    }
    log.withMetadata({ email: user.email }).info("verification email sent")
  }
}
