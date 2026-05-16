import { match } from "ts-pattern"

const CLOUDINARY_UPLOAD_RE = /\/image\/upload\//

export const transformCloudinary = (url: string, transform: string): string =>
  match(url)
    .when(
      (u) => CLOUDINARY_UPLOAD_RE.test(u),
      (u) => u.replace(CLOUDINARY_UPLOAD_RE, `/image/upload/${transform}/`)
    )
    .otherwise((u) => u)
