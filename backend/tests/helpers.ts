import type { Server } from "node:http"

import { createApp } from "../src/app.ts"

// Sobe a API numa porta livre para o teste.
export async function startTestServer(): Promise<{ url: string; close: () => Promise<void> }> {
  const server: Server = await new Promise((resolve) => {
    const started = createApp().listen(0, () => resolve(started))
  })
  const address = server.address()
  if (address === null || typeof address === "string") {
    throw new Error("Não foi possível descobrir a porta do servidor de teste")
  }

  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  }
}
