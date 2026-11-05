import { rateLimit } from "express-rate-limit"

import { logger } from "../logger.ts"
import { getRequestId } from "./requestContext.ts"

// Formulários públicos: 5 envios por minuto por IP.
// Função, e não constante: cada app tem o seu contador.
export function publicFormLimit() {
  return rateLimit({
    windowMs: 60_000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (request, response) => {
      logger.info("rate_limit.blocked", { request_id: getRequestId(response), path: request.path })
      response.status(429).json({ message: "Muitas tentativas de cadastro. Aguarde um minuto e tente de novo." })
    },
  })
}
