// This import anchors the `payload` module symbol in TypeScript's program,
// which is required for the `declare module 'payload'` augmentation in
// @mise/payload/payload-types to be valid (avoids TS2664).
import type {} from "payload"
