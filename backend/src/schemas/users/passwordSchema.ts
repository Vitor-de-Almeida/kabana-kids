import { z } from "zod"

export const MIN_PASSWORD_LENGTH = 10
export const MAX_PASSWORD_LENGTH = 128

// Regras da senha (D32); cada uma com a sua mensagem
export const passwordSchema = z
  .string({ error: "Informe a senha." })
  .min(MIN_PASSWORD_LENGTH, { error: `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` })
  .max(MAX_PASSWORD_LENGTH, { error: `A senha pode ter no máximo ${MAX_PASSWORD_LENGTH} caracteres.` })
  .regex(/[A-Z]/, { error: "A senha precisa ter pelo menos uma letra maiúscula." })
  .regex(/[a-z]/, { error: "A senha precisa ter pelo menos uma letra minúscula." })
  .regex(/[0-9]/, { error: "A senha precisa ter pelo menos um número." })
  .regex(/[^A-Za-z0-9]/, { error: "A senha precisa ter pelo menos um caractere especial, como ! @ # ou %." })
