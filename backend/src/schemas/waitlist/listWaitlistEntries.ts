import { z } from "zod"

export const listWaitlistEntriesSchema = z.object({
  page: z.coerce
    .number({ error: "A página precisa ser um número." })
    .int({ error: "A página precisa ser um número inteiro." })
    .min(1, { error: "A página começa em 1." })
    .max(10_000, { error: "A página pode ser no máximo 10000." })
    .default(1),
})

export type ListWaitlistEntriesQuery = z.infer<typeof listWaitlistEntriesSchema>
