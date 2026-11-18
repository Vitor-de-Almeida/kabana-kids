import { z } from "zod"

// Sem regra de formato da senha: o login não dá dicas
export const createSessionSchema = z.object({
  email: z
    .string({ error: "Informe o e-mail." })
    .trim()
    .toLowerCase()
    .min(1, { error: "Informe o e-mail." })
    .max(254, { error: "O e-mail pode ter no máximo 254 caracteres." }),
  password: z
    .string({ error: "Informe a senha." })
    .min(1, { error: "Informe a senha." })
    .max(128, { error: "A senha pode ter no máximo 128 caracteres." }),
  // Só para quem tem 2FA ativo (D33)
  code: z
    .string({ error: "O código precisa ser um texto." })
    .trim()
    .regex(/^\d{6}$/, { error: "O código tem 6 números." })
    .optional(),
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>
