import { defineConfig } from "vitest/config"

// As senhas dos bancos ficam no .env, nunca aqui
try {
  process.loadEnvFile()
} catch {
  // Sem .env: variáveis vêm do ambiente
}

export default defineConfig({
  test: {
    env: {
      NODE_ENV: "test",
      FRONTEND_URL: "http://localhost:5173",
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? "",
    },
    globalSetup: "tests/globalSetup.ts",
    // Um arquivo por vez: todos usam o mesmo banco
    fileParallelism: false,
  },
})
