import type { Access } from "payload"

// Until a role system is introduced, any authenticated Payload user is treated
// as an admin. This will be tightened when RECIPE-050–051 land.
export const isAdmin: Access = ({ req: { user } }) => Boolean(user)
