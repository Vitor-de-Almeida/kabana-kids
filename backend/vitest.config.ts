import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    env: {
      NODE_ENV: "test",
      FRONTEND_URL: "http://localhost:5173",
    },
  },
})
