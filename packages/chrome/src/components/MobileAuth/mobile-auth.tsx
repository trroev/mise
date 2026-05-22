import { NavigationMenu } from "@mise/ui/components/NavigationMenu"
import { cn } from "@mise/ui/utils/cn"
import Link from "next/link"
import type { HeaderAuth } from "../AppShell"

export type MobileAuthProps = {
  auth: HeaderAuth
}

const linkClass = cn(
  "text-heading-md text-text-primary hover:text-text-secondary"
)

export const MobileAuth = ({ auth }: MobileAuthProps) => {
  if (auth.status === "anonymous") {
    return (
      <NavigationMenu.Item>
        <NavigationMenu.Link
          className={linkClass}
          closeOnClick
          render={<Link href="/sign-in" />}
        >
          Sign in
        </NavigationMenu.Link>
      </NavigationMenu.Item>
    )
  }

  return (
    <>
      <NavigationMenu.Item>
        <NavigationMenu.Link
          className={linkClass}
          closeOnClick
          render={<Link href="/profile" />}
        >
          Profile
        </NavigationMenu.Link>
      </NavigationMenu.Item>
      <NavigationMenu.Item>
        <NavigationMenu.Link
          className={linkClass}
          closeOnClick
          render={<Link href="/submit" />}
        >
          Submit recipe
        </NavigationMenu.Link>
      </NavigationMenu.Item>
      <NavigationMenu.Item>
        <form action={auth.onSignOut}>
          <button className={`${linkClass} text-left`} type="submit">
            Sign out
          </button>
        </form>
      </NavigationMenu.Item>
    </>
  )
}
