import { z } from "zod"

import { createUserSchema } from "./createUser.ts"

// Sem senha (o sistema gera) e sem admin (o dono é um só)
export const createStaffUserSchema = createUserSchema.pick({ name: true, email: true }).extend({
  role: z.enum(["manager", "teacher"], { error: "Escolha gerente ou professor(a)." }),
})

export type CreateStaffUserInput = z.infer<typeof createStaffUserSchema>
