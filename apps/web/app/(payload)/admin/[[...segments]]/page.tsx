import config from "@payload-config"
import { generatePageMetadata, RootPage } from "@payloadcms/next/views"
import type { Metadata } from "next"
import { importMap } from "../importMap"

type Args = {
  params: Promise<{
    segments: Array<string>
  }>
  searchParams: Promise<{
    [key: string]: string | Array<string>
  }>
}

export const generateMetadata = ({
  params,
  searchParams,
}: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

export default function Page({ params, searchParams }: Args) {
  return RootPage({ config, importMap, params, searchParams })
}
