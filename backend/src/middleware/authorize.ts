import type { NextFunction, Request, Response } from "express"

import type { SessionUser } from "../security/session.ts"
import { getCurrentUser } from "./requireAuth.ts"

type Policy = (user: SessionUser) => boolean

// Aplica uma Policy antes do controller (seguranca.md)
export function authorize(policy: Policy) {
  return (_request: Request, response: Response, next: NextFunction): void => {
    if (!policy(getCurrentUser(response))) {
      response.status(403).json({ message: "Você não tem permissão para fazer isso." })
      return
    }
    next()
  }
}
