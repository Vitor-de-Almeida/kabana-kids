import { prisma } from "../../db.ts"
import type { User, UserRole } from "../../generated/prisma/client.ts"
import { logger } from "../../logger.ts"
import type { CreateUserInput } from "../../schemas/users/createUser.ts"
import { hashPassword } from "../../security/password.ts"

// O perfil vem de quem chama no servidor, nunca do cliente
export async function createUser(input: CreateUserInput, role: UserRole): Promise<User> {
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role,
      // admin é sempre o dono; o banco impede um segundo (D40)
      isOwner: role === "admin" ? true : null,
    },
  })

  logger.info("user.created", { user_id: user.id, role })

  return user
}
