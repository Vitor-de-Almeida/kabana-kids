import { Router } from "express"

import { storeWaitlistEntry } from "../controllers/v1/waitlistEntryController.ts"
import { publicFormLimit } from "../middleware/rateLimits.ts"
import { validate } from "../middleware/validate.ts"
import { storeWaitlistEntrySchema } from "../schemas/waitlist/storeWaitlistEntry.ts"

// Rotas de /api/v1.
export function createV1Router(): Router {
  const router = Router()

  // Públicas: sempre com rate limit
  router.post("/waitlist-entries", publicFormLimit(), validate(storeWaitlistEntrySchema), storeWaitlistEntry)

  // Privadas: exigem login (Fase 2)

  return router
}
