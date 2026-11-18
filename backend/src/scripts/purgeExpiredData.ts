// Aplica os prazos de guarda (D26). Uso: npm run data:purge
// Em produção, a hospedagem roda este comando uma vez por dia.
import { purgeExpiredData } from "../actions/retention/purgeExpiredData.ts"
import { prisma } from "../db.ts"

try {
  await purgeExpiredData()
} finally {
  await prisma.$disconnect()
}
