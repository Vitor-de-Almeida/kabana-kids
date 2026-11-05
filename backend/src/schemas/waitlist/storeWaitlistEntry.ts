import { z } from "zod"

import { DesiredClassroom } from "../../generated/prisma/enums.ts"

// Idade máxima atendida (pré-escola até 5 anos) com folga
const MAX_CHILD_AGE_YEARS = 7

function parseBirthDate(value: string): Date {
  return new Date(`${value}T00:00:00Z`)
}

function isNotInFuture(value: string): boolean {
  return parseBirthDate(value) <= new Date()
}

function isWithinMaxAge(value: string): boolean {
  const oldestAllowed = new Date()
  oldestAllowed.setUTCFullYear(oldestAllowed.getUTCFullYear() - MAX_CHILD_AGE_YEARS)

  return parseBirthDate(value) >= oldestAllowed
}

// Campo ausente e campo errado recebem mensagens diferentes
function missingOr(missingMessage: string, invalidMessage: string) {
  return (issue: { input?: unknown }) => (issue.input === undefined ? missingMessage : invalidMessage)
}

export const storeWaitlistEntrySchema = z.object({
  guardianName: z
    .string({ error: "Informe o nome do responsável." })
    .trim()
    .min(1, { error: "Informe o nome do responsável.", abort: true })
    .min(2, { error: "O nome do responsável precisa ter pelo menos 2 letras." })
    .max(120, { error: "O nome do responsável pode ter no máximo 120 caracteres." }),
  email: z
    .email({ error: missingOr("Informe o e-mail.", "Confira o e-mail: ele precisa ter o formato nome@provedor.com.") })
    .trim()
    .max(254, { error: "O e-mail pode ter no máximo 254 caracteres." }),
  phone: z
    .string({ error: "Informe um telefone." })
    .trim()
    .min(1, { error: "Informe um telefone.", abort: true })
    .regex(/^[0-9()+\-\s]{8,20}$/, {
      error: "Confira o telefone: use de 8 a 20 caracteres, só números, espaços, parênteses, + ou -.",
    }),
  childName: z
    .string({ error: "Informe o nome da criança." })
    .trim()
    .min(1, { error: "Informe o nome da criança." })
    .max(120, { error: "O nome da criança pode ter no máximo 120 caracteres." }),
  childBirthDate: z.iso
    .date({ error: missingOr("Informe a data de nascimento.", "Confira a data de nascimento: use o formato AAAA-MM-DD.") })
    .refine(isNotInFuture, { error: "A data de nascimento não pode estar no futuro.", abort: true })
    .refine(isWithinMaxAge, { error: `A criança precisa ter no máximo ${MAX_CHILD_AGE_YEARS} anos.` }),
  desiredClassroom: z.enum(DesiredClassroom, { error: "Escolha uma das turmas da lista." }),
  message: z
    .string({ error: "A mensagem precisa ser um texto." })
    .trim()
    .max(1000, { error: "A mensagem pode ter no máximo 1000 caracteres." })
    .optional()
    .transform((value) => value || undefined),
  consent: z.literal(true, { error: "Marque a autorização de uso dos dados para enviar o formulário." }),
})

export type StoreWaitlistEntryInput = z.infer<typeof storeWaitlistEntrySchema>
