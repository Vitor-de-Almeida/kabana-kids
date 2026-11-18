import type { NextFunction, Request, Response } from "express"

import { getCurrentUser } from "./requireAuth.ts"

// Senha temporária: só dá para trocar a senha (D41)
export function requirePasswordChanged(_request: Request, response: Response, next: NextFunction): void {
  if (getCurrentUser(response).mustChangePassword) {
    response.status(403).json({
      message: "Crie uma senha nova em Minha conta para continuar.",
      passwordChangeRequired: true,
    })
    return
  }
  next()
}

// 2FA obrigatório: dono e gerente sempre; os demais após o 3º login (D42)
export function requireTwoFactor(_request: Request, response: Response, next: NextFunction): void {
  if (getCurrentUser(response).twoFactorSetupRequired) {
    response.status(403).json({
      message: "Ative a verificação em duas etapas em Minha conta para continuar.",
      twoFactorSetupRequired: true,
    })
    return
  }
  next()
}
