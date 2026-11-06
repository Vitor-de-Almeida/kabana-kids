import { argon2, randomBytes, timingSafeEqual } from "node:crypto"

// Mínimo recomendado pela OWASP para Argon2id
const DEFAULT_COST = { memory: 19_456, passes: 2, parallelism: 1 }
const SALT_BYTES = 16
const HASH_BYTES = 32

type Cost = typeof DEFAULT_COST

function derive(password: string, salt: Buffer, cost: Cost): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    argon2("argon2id", { message: password, nonce: salt, tagLength: HASH_BYTES, ...cost }, (error, key) => {
      if (error) {
        reject(error)
      } else {
        resolve(key)
      }
    })
  })
}

/** Formato salvo: argon2id$m=19456,t=2,p=1$<salt>$<hash> (base64) */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES)
  const hash = await derive(password, salt, DEFAULT_COST)
  const { memory, passes, parallelism } = DEFAULT_COST

  return `argon2id$m=${memory},t=${passes},p=${parallelism}$${salt.toString("base64")}$${hash.toString("base64")}`
}

function parseCost(text: string): Cost | null {
  const match = /^m=(\d+),t=(\d+),p=(\d+)$/.exec(text)
  if (!match) {
    return null
  }
  return { memory: Number(match[1]), passes: Number(match[2]), parallelism: Number(match[3]) }
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, costText, saltText, hashText] = stored.split("$")
  const cost = parseCost(costText ?? "")
  if (algorithm !== "argon2id" || !cost || !saltText || !hashText) {
    return false
  }

  const expected = Buffer.from(hashText, "base64")
  const actual = await derive(password, Buffer.from(saltText, "base64"), cost)

  // Comparação em tempo constante: não revela onde difere
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

let dummyHash: Promise<string> | null = null

// Gasta o mesmo tempo quando o e-mail não existe
export async function verifyAgainstDummyHash(password: string): Promise<void> {
  dummyHash ??= hashPassword("senha-ficticia-para-igualar-o-tempo")
  await verifyPassword(password, await dummyHash)
}
