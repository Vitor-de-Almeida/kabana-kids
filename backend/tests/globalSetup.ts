// Prepara o banco de testes antes de todos os testes.
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const prismaCli = fileURLToPath(new URL("../node_modules/prisma/build/index.js", import.meta.url))

// Mostra a mensagem: o Vitest esconde erros desta etapa
function fail(message: string): never {
  console.error(message)
  throw new Error(message)
}

export default function setup(): void {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL
  if (!testDatabaseUrl) {
    fail("Defina TEST_DATABASE_URL no .env (veja .env.example)")
  }

  // Trava: os testes apagam dados, então só num banco *_test
  if (!new URL(testDatabaseUrl).pathname.endsWith("_test")) {
    fail("TEST_DATABASE_URL precisa apontar para um banco terminado em _test")
  }

  execFileSync(process.execPath, [prismaCli, "migrate", "deploy"], {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: "ignore",
  })
}
