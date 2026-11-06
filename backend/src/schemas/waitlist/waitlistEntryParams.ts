import { z } from "zod"

export const waitlistEntryParamsSchema = z.object({
  id: z.ulid({ error: "Cadastro não encontrado." }),
})

export type WaitlistEntryParams = z.infer<typeof waitlistEntryParamsSchema>
