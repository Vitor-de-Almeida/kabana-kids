// Único lugar que lê process.env.
function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não definida (veja .env.example)`)
  }
  return value
}

export const config = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 8000),
  frontendUrl: required("FRONTEND_URL"),
}
