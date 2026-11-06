import { z } from "zod"

import { MAX_PASSWORD_LENGTH, passwordSchema } from "../users/passwordSchema.ts"

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ error: "Informe a senha atual." })
    .min(1, { error: "Informe a senha atual." })
    .max(MAX_PASSWORD_LENGTH, { error: `A senha pode ter no máximo ${MAX_PASSWORD_LENGTH} caracteres.` }),
  newPassword: passwordSchema,
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
