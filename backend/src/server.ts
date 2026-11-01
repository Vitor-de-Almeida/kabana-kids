import { createApp } from "./app.ts"
import { config } from "./config.ts"

createApp().listen(config.port, () => {
  console.log(`API rodando em http://localhost:${config.port}`)
})
