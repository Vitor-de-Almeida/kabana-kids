// Recupera o acesso do dono da escola. Uso: npm run user:reset-access
// Só pelo terminal do servidor: não existe rota HTTP para isto (D41).
import { userInfo } from "node:os"

import { findOwnerByEmail, recordDeniedRecovery, recoverOwnerAccess } from "../actions/users/recoverOwnerAccess.ts"
import { prisma } from "../db.ts"
import { TEMPORARY_PASSWORD_HOURS } from "../security/temporaryPassword.ts"
import { ask } from "./prompt.ts"

// Quem rodou o comando no servidor, para a auditoria
function operatorName(): string {
  try {
    return `terminal:${userInfo().username}`.slice(0, 100)
  } catch {
    return "terminal:desconhecido"
  }
}

async function main(): Promise<void> {
  const operator = operatorName()
  const lookup = await findOwnerByEmail(await ask("E-mail do dono da escola: "))

  if (lookup.kind !== "found") {
    await recordDeniedRecovery(lookup.kind === "not_owner" ? lookup.user.id : null, operator)
    console.error("Este comando só recupera a conta do dono da escola. Nada foi alterado.")
    process.exitCode = 1
    return
  }

  console.log(`\nConta encontrada: ${lookup.user.name} <${lookup.user.email}>`)
  const answer = await ask("Deseja realmente recuperar o acesso deste administrador? (s/n) ")
  if (answer.trim().toLowerCase() !== "s") {
    console.log("Cancelado. Nada foi alterado.")
    return
  }

  const temporaryPassword = await recoverOwnerAccess(lookup.user, operator)

  // Único lugar onde a senha aparece; nunca vai para log ou banco
  console.log("\nSenha temporária (aparece só agora; entregue pessoalmente ao dono):\n")
  console.log(`    ${temporaryPassword}\n`)
  console.log(`- Vale por ${TEMPORARY_PASSWORD_HOURS} horas e para um único login.`)
  console.log("- No primeiro login, o site obriga a criar uma senha nova.")
  console.log("- O 2FA foi desligado e todas as sessões foram encerradas: será preciso ativá-lo de novo.")
}

try {
  await main()
} finally {
  await prisma.$disconnect()
}
