import { match } from "ts-pattern"

const CLOUDINARY_UPLOAD_RE = /\/image\/upload\//

type TransformCloudinaryOptions = {
  url: string
  transform: string
}

export const transformCloudinary = ({
  url,
  transform,
}: TransformCloudinaryOptions): string =>
  match(url)
    .when(
      (u) => CLOUDINARY_UPLOAD_RE.test(u),
      (u) => u.replace(CLOUDINARY_UPLOAD_RE, `/image/upload/${transform}/`)
    )
    .otherwise((u) => u)
