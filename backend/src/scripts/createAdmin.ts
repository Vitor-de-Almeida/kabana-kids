// Cria a conta do dono da escola (admin, um só). Uso: npm run user:create-admin
import { z } from "zod"

import { createUser } from "../actions/users/createUser.ts"
import { prisma } from "../db.ts"
import { createUserSchema } from "../schemas/users/createUser.ts"
import { ask, askHidden } from "./prompt.ts"

async function main(): Promise<void> {
  // O banco também impede um segundo dono (D40)
  if (await prisma.user.findFirst({ where: { isOwner: true } })) {
    console.error("O dono da escola já tem conta. Para recuperar o acesso, use: npm run user:reset-access")
    process.exitCode = 1
    return
  }

  const name = await ask("Nome: ")
  const email = await ask("E-mail: ")
  const password = await askHidden("Senha (não aparece na tela): ")
  const confirmation = await askHidden("Repita a senha: ")

  if (password !== confirmation) {
    console.error("As senhas não são iguais. Nada foi criado.")
    process.exitCode = 1
    return
  }

  const result = createUserSchema.safeParse({ name, email, password })
  if (!result.success) {
    for (const messages of Object.values(z.flattenError(result.error).fieldErrors)) {
      console.error(messages?.[0])
    }
    process.exitCode = 1
    return
  }

  if (await prisma.user.findUnique({ where: { email: result.data.email } })) {
    console.error("Já existe uma conta com este e-mail. Nada foi criado.")
    process.exitCode = 1
    return
  }

  await createUser(result.data, "admin")
  console.log("Conta criada. Já é possível entrar pelo site.")
}

try {
  await main()
} finally {
  await prisma.$disconnect()
}
