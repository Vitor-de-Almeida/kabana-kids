import type { NextFunction, Request, Response } from "express"

import { findActiveSession } from "../actions/auth/findActiveSession.ts"
import { readSessionToken } from "../security/session.ts"
import type { SessionUser } from "../security/session.ts"

export async function requireAuth(request: Request, response: Response, next: NextFunction): Promise<void> {
  const token = readSessionToken(request)
  const user = token ? await findActiveSession(token) : null

  if (!user) {
    response.status(401).json({ message: "Faça login para continuar." })
    return
  }

  response.locals.user = user
  next()
}

// Só use depois do requireAuth
export function getCurrentUser(response: Response): SessionUser {
  return response.locals.user as SessionUser
}
