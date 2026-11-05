import { defineConfig } from "prisma/config"

// O Prisma não lê o .env sozinho
try {
  process.loadEnvFile()
} catch {
  // Sem .env: variáveis vêm da hospedagem
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
    // Banco temporário do migrate dev (usuário sem CREATEDB)
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
})
