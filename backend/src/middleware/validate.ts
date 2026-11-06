import type { NextFunction, Request, Response } from "express"
import { z } from "zod"
import type { ZodType } from "zod"

// Aplica o schema e entrega ao controller só os dados validados.
export function validate(schema: ZodType) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const result = schema.safeParse(request.body ?? {})

    if (!result.success) {
      response.status(422).json({
        message: "Confira os campos destacados.",
        errors: z.flattenError(result.error).fieldErrors,
      })
      return
    }

    // Campos fora do schema já foram descartados pelo Zod
    request.body = result.data
    next()
  }
}
