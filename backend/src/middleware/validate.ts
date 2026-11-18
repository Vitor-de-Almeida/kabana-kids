import type { NextFunction, Request, Response } from "express"
import { z } from "zod"
import type { ZodType } from "zod"

type Source = "body" | "query" | "params"

// Aplica o schema e entrega ao controller só os dados validados.
// body: em request.body; query e params: em response.locals.
export function validate(schema: ZodType, source: Source = "body") {
  return (request: Request, response: Response, next: NextFunction): void => {
    const result = schema.safeParse(request[source] ?? {})

    if (!result.success) {
      response.status(422).json({
        message: "Confira os campos destacados.",
        errors: z.flattenError(result.error).fieldErrors,
      })
      return
    }

    // Campos fora do schema já foram descartados pelo Zod
    if (source === "body") {
      request.body = result.data
    } else {
      response.locals[source] = result.data
    }
    next()
  }
}
