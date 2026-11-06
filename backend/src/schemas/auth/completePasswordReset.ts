import { z } from "zod"

import { passwordSchema } from "../users/passwordSchema.ts"

export const completePasswordResetSchema = z.object({
  token: z
    .string({ error: "Este link é inválido ou expirou. Peça um novo." })
    .min(20, { error: "Este link é inválido ou expirou. Peça um novo." })
    .max(100, { error: "Este link é inválido ou expirou. Peça um novo." }),
  newPassword: passwordSchema,
})

export type CompletePasswordResetInput = z.infer<typeof completePasswordResetSchema>
