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
      // Chave fictícia, só para testes
      TWO_FACTOR_ENCRYPTION_KEY: "dGVzdGUtdGVzdGUtdGVzdGUtdGVzdGUtdGVzdGUtMTI=",
      // E-mails dos testes vão para esta pasta (lida pelos testes)
      MAIL_TRANSPORT: "outbox",
      MAIL_OUTBOX_DIR: "storage/test-mail-outbox",
    },
    globalSetup: "tests/globalSetup.ts",
    // Um arquivo por vez: todos usam o mesmo banco
    fileParallelism: false,
  },
})
