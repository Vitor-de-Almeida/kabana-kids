import cors from "cors"
import express from "express"
import helmet from "helmet"

import { config } from "./config.ts"
import { errorHandler } from "./middleware/errorHandler.ts"
import { notFound } from "./middleware/notFound.ts"
import { v1Router } from "./routes/v1.ts"

export function createApp() {
  const app = express()

  app.disable("x-powered-by")
  app.use(helmet())
  app.use(cors({ origin: config.frontendUrl, credentials: true }))
  app.use(express.json({ limit: "100kb" }))

  app.get("/up", (_request, response) => {
    response.json({ status: "ok" })
  })
  app.use("/api/v1", v1Router)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
