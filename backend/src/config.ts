// Único lugar que lê process.env.
function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não definida (veja .env.example)`)
  }
  return value
}

function nonNegativeInteger(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback)
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Variável de ambiente ${name} precisa ser um número inteiro de 0 para cima`)
  }
  return value
}

export const config = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 8000),
  frontendUrl: required("FRONTEND_URL"),
  databaseUrl: required("DATABASE_URL"),
  // Proxies da hospedagem antes da API; 0 = nenhum
  trustProxy: nonNegativeInteger("TRUST_PROXY", 0),
  // Troque ao publicar uma nova Política de Privacidade (1.5)
  privacyPolicyVersion: "rascunho",
}
