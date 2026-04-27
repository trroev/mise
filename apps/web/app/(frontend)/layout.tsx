import { Providers } from "../providers"
import "../globals.css"

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Providers>{children}</Providers>
}
