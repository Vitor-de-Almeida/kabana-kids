import { z } from "zod"

export const requestPasswordResetSchema = z.object({
  email: z
    .email({ error: "Confira o e-mail: ele precisa ter o formato nome@provedor.com." })
    .trim()
    .toLowerCase()
    .max(254, { error: "O e-mail pode ter no máximo 254 caracteres." }),
})

export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>
