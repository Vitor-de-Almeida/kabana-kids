import { prisma } from "../../db.ts"
import type { User } from "../../generated/prisma/client.ts"
import { decryptSecret } from "../../security/secretBox.ts"
import { verifyTotp } from "../../security/totp.ts"

// Confere o código e o "gasta": o mesmo código não vale duas vezes
export async function checkTwoFactorCode(user: User, code: string): Promise<boolean> {
  if (!user.twoFactorSecret) {
    return false
  }

  const step = verifyTotp(decryptSecret(user.twoFactorSecret), code, user.twoFactorLastStep)
  if (step === null) {
    return false
  }

  // Só um pedido consegue gravar o passo, mesmo se chegarem juntos
  const updated = await prisma.user.updateMany({
    where: { id: user.id, OR: [{ twoFactorLastStep: null }, { twoFactorLastStep: { lt: step } }] },
    data: { twoFactorLastStep: step },
  })
  return updated.count === 1
}
