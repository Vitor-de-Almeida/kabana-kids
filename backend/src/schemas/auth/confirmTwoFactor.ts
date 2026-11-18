import { z } from "zod"

export const confirmTwoFactorSchema = z.object({
  code: z
    .string({ error: "Informe o código de 6 números do app." })
    .trim()
    .regex(/^\d{6}$/, { error: "O código tem 6 números." }),
})

export type ConfirmTwoFactorInput = z.infer<typeof confirmTwoFactorSchema>
