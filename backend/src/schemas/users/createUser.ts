import { z } from "zod"

import { passwordSchema } from "./passwordSchema.ts"

export const createUserSchema = z.object({
  name: z
    .string({ error: "Informe o nome." })
    .trim()
    .min(2, { error: "O nome precisa ter pelo menos 2 letras." })
    .max(120, { error: "O nome pode ter no máximo 120 caracteres." }),
  email: z
    .email({ error: "Confira o e-mail: ele precisa ter o formato nome@provedor.com." })
    .trim()
    .toLowerCase()
    .max(254, { error: "O e-mail pode ter no máximo 254 caracteres." }),
  password: passwordSchema,
})

export type CreateUserInput = z.infer<typeof createUserSchema>
