import { Router } from "express"

import {
  confirmTwoFactor,
  indexMyLogins,
  storeTwoFactorSetup,
  updatePassword,
} from "../controllers/v1/accountController.ts"
import { storePasswordReset, storePasswordResetRequest } from "../controllers/v1/passwordResetController.ts"
import { destroySession, showCurrentUser, storeSession } from "../controllers/v1/sessionController.ts"
import { indexUsers, storePasswordResetLink, storeUser } from "../controllers/v1/userController.ts"
import {
  destroyWaitlistEntry,
  indexWaitlistEntries,
  storeWaitlistEntry,
} from "../controllers/v1/waitlistEntryController.ts"
import { authorize } from "../middleware/authorize.ts"
import {
  accountLimit,
  loginIpLimit,
  loginLimit,
  passwordResetLimit,
  passwordResetRequestLimits,
  publicFormLimit,
  teamLimit,
} from "../middleware/rateLimits.ts"
import { requirePasswordChanged, requireTwoFactor } from "../middleware/requireAccountReady.ts"
import { requireAuth } from "../middleware/requireAuth.ts"
import { requireTrustedOrigin } from "../middleware/requireTrustedOrigin.ts"
import { validate } from "../middleware/validate.ts"
import { canListUsers } from "../policies/userPolicy.ts"
import { canAnonymizeWaitlistEntry, canListWaitlistEntries } from "../policies/waitlistEntryPolicy.ts"
import { changePasswordSchema } from "../schemas/auth/changePassword.ts"
import { completePasswordResetSchema } from "../schemas/auth/completePasswordReset.ts"
import { requestPasswordResetSchema } from "../schemas/auth/requestPasswordReset.ts"
import { confirmTwoFactorSchema } from "../schemas/auth/confirmTwoFactor.ts"
import { createSessionSchema } from "../schemas/auth/createSession.ts"
import { createStaffUserSchema } from "../schemas/users/createStaffUser.ts"
import { userParamsSchema } from "../schemas/users/userParams.ts"
import { listWaitlistEntriesSchema } from "../schemas/waitlist/listWaitlistEntries.ts"
import { storeWaitlistEntrySchema } from "../schemas/waitlist/storeWaitlistEntry.ts"
import { waitlistEntryParamsSchema } from "../schemas/waitlist/waitlistEntryParams.ts"

// Rotas de /api/v1.
export function createV1Router(): Router {
  const router = Router()

  // CSRF: vale para toda rota que altera dados
  router.use(requireTrustedOrigin)

  // Públicas: sempre com rate limit
  router.post("/waitlist-entries", publicFormLimit(), validate(storeWaitlistEntrySchema), storeWaitlistEntry)
  router.post("/sessions", loginIpLimit(), loginLimit(), validate(createSessionSchema), storeSession)
  // Link de senha por e-mail (D45)
  router.post(
    "/password-reset-requests",
    ...passwordResetRequestLimits(),
    validate(requestPasswordResetSchema),
    storePasswordResetRequest,
  )
  router.post("/password-resets", passwordResetLimit(), validate(completePasswordResetSchema), storePasswordReset)

  // Privadas: exigem login
  router.use(requireAuth)
  router.get("/me", showCurrentUser)
  router.delete("/sessions/current", destroySession)
  router.put("/me/password", accountLimit(), validate(changePasswordSchema), updatePassword)

  // Senha temporária: daqui para baixo, só depois de trocá-la (D41)
  router.use(requirePasswordChanged)
  router.get("/me/logins", indexMyLogins)
  router.post("/me/two-factor", accountLimit(), storeTwoFactorSetup)
  router.post("/me/two-factor/confirm", accountLimit(), validate(confirmTwoFactorSchema), confirmTwoFactor)

  // Daqui para baixo: 2FA quando obrigatório (D42) e sempre uma Policy
  router.use(requireTwoFactor)
  router.get("/users", authorize(canListUsers), indexUsers)
  router.post("/users", teamLimit(), validate(createStaffUserSchema), storeUser)
  router.post("/users/:id/password-reset-link", teamLimit(), validate(userParamsSchema, "params"), storePasswordResetLink)
  router.get(
    "/waitlist-entries",
    authorize(canListWaitlistEntries),
    validate(listWaitlistEntriesSchema, "query"),
    indexWaitlistEntries,
  )
  router.delete(
    "/waitlist-entries/:id",
    authorize(canAnonymizeWaitlistEntry),
    validate(waitlistEntryParamsSchema, "params"),
    destroyWaitlistEntry,
  )

  return router
}
