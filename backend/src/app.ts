import cors from "cors"
import express from "express"
import helmet from "helmet"

import { config } from "./config.ts"
import { errorHandler } from "./middleware/errorHandler.ts"
import { notFound } from "./middleware/notFound.ts"
import { requestContext } from "./middleware/requestContext.ts"
import { createV1Router } from "./routes/v1.ts"

export function createApp() {
  const app = express()

  app.disable("x-powered-by")
  app.use(requestContext)
  app.use(helmet())
  // O site lê o X-Request-Id para mostrar no erro 500 (D25)
  app.use(cors({ origin: config.frontendUrl, credentials: true, exposedHeaders: ["X-Request-Id"] }))
  app.use(express.json({ limit: "100kb" }))

  app.get("/up", (_request, response) => {
    response.json({ status: "ok" })
  })
  app.use("/api/v1", createV1Router())

  app.use(notFound)
  app.use(errorHandler)

  return app
}
