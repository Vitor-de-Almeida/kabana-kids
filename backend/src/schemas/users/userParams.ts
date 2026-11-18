import { z } from "zod"

export const userParamsSchema = z.object({
  id: z.ulid({ error: "Conta não encontrada." }),
})

export type UserParams = z.infer<typeof userParamsSchema>
