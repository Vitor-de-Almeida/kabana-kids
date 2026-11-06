---
name: novo-endpoint
description: Cria um endpoint da API Node/Express completo (model e migration do Prisma, schema Zod, action, resource, controller, rota e testes). Use ao adicionar ou alterar uma rota em /api/v1, uma tabela ou uma regra de negócio no backend.
---

# Novo endpoint da API

Antes de começar, leia `.claude/rules/backend.md`, `.claude/rules/api.md` e `.claude/rules/seguranca.md`. O exemplo usa a lista de espera (Fase 1); troque os nomes pelo recurso real.

Rode os comandos dentro de `backend/`. Explique cada etapa ao responsável pelo projeto **antes** de fazê-la.

## 0. Pré-requisitos

- **Dados pessoais:** os campos estão em `docs/lgpd-dados-pessoais.md`? Se não estiverem, pare e peça autorização ao usuário.
- **O endpoint é público ou privado?** Por padrão ele é privado.
- **Primeiro uso do banco:** se `src/db.ts`, o middleware `src/middleware/validate.ts` ou o banco de testes ainda não existirem, crie-os nesta tarefa (veja os passos abaixo) e avise o usuário.

## 1. Tabela (`prisma/schema.prisma`)

```prisma
enum WaitlistStatus {
  pending
  contacted
  enrolled
  discarded
}

model WaitlistEntry {
  id                   String         @id @default(ulid())
  guardianName         String         @map("guardian_name") @db.VarChar(120)
  email                String         @db.VarChar(254)
  phone                String         @db.VarChar(20)
  childName            String         @map("child_name") @db.VarChar(120)
  childBirthDate       DateTime       @map("child_birth_date") @db.Date
  status               WaitlistStatus @default(pending)
  consentedAt          DateTime       @map("consented_at")
  privacyPolicyVersion String         @map("privacy_policy_version") @db.VarChar(20)
  createdAt            DateTime       @default(now()) @map("created_at")
  updatedAt            DateTime       @updatedAt @map("updated_at")

  @@map("waitlist_entries")
}
```

Depois rode `npm run db:migrate -- --name create_waitlist_entries` (cria a migration e a aplica no banco de desenvolvimento) e confira o SQL gerado em `prisma/migrations/`.

Na primeira vez, crie `src/db.ts`:

```ts
import { PrismaPg } from "@prisma/adapter-pg"

import { config } from "./config.ts"
import { PrismaClient } from "./generated/prisma/client.ts"

export const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: config.databaseUrl }) })
```

## 2. Schema de validação (Zod)

`src/schemas/waitlist/storeWaitlistEntry.ts`:

```ts
import { z } from "zod"

export const storeWaitlistEntrySchema = z.object({
  guardianName: z.string().trim().min(1).max(120),
  email: z.email().max(254),
  phone: z.string().trim().min(1).max(20),
  childName: z.string().trim().min(1).max(120),
  childBirthDate: z.iso.date(), // + checagem de data plausível (no passado, até 7 anos)
  consent: z.literal(true),
})

export type StoreWaitlistEntryInput = z.infer<typeof storeWaitlistEntrySchema>
```

`status` não está no schema: quem define o status é a regra de negócio, nunca o cliente. Campos fora do schema são descartados pelo Zod.

Em rotas privadas, a Policy é chamada no controller antes da Action (Fase 2).

## 3. Action (regra de negócio)

`src/actions/waitlist/createWaitlistEntry.ts`:

```ts
export async function createWaitlistEntry(input: StoreWaitlistEntryInput): Promise<WaitlistEntry> {
  const { consent: _consent, ...data } = input

  return prisma.waitlistEntry.create({
    data: {
      ...data,
      childBirthDate: new Date(data.childBirthDate),
      consentedAt: new Date(),
      privacyPolicyVersion: config.privacyPolicyVersion,
    },
  })
}
```

## 4. Resource

`src/resources/waitlistEntryResource.ts`. Liste os campos explicitamente. Uma resposta pública devolve o mínimo, nunca os dados da criança:

```ts
export function waitlistEntryResource(entry: WaitlistEntry) {
  return {
    id: entry.id,
    status: entry.status,
    createdAt: entry.createdAt.toISOString(),
  }
}
```

## 5. Controller

`src/controllers/v1/waitlistEntryController.ts`:

```ts
export async function storeWaitlistEntry(request: Request, response: Response): Promise<void> {
  const entry = await createWaitlistEntry(request.body as StoreWaitlistEntryInput)

  response.status(201).json({ data: waitlistEntryResource(entry) })
}
```

O `request.body` aqui já foi trocado pelos dados validados pelo middleware `validate` (passo 6).

## 6. Rota (`src/routes/v1.ts`)

```ts
// Públicas: sempre com limite de tentativas
v1Router.post("/waitlist-entries", publicFormLimit, validate(storeWaitlistEntrySchema), storeWaitlistEntry)
```

- `publicFormLimit` é um `rateLimit()` do `express-rate-limit` (ex.: 5 por minuto), com a resposta `429` no formato `{ "message": "..." }`.
- `validate(schema)` roda o `safeParse` do Zod. Se falhar, responde `422` com `{ "message": "...", "errors": { "campo": ["..."] } }` (use `z.flattenError(error).fieldErrors`). Se passar, troca `request.body` pelos dados validados e chama o próximo.

## 7. Testes

`tests/api/v1/waitlistEntries/storeWaitlistEntry.test.ts`, usando `startTestServer()` e `fetch`. Cubra os casos obrigatórios de `.claude/rules/testes.md` e confira que a resposta não contém os dados da criança. Testes que tocam o banco usam o banco `kabana_kids_test` e limpam as tabelas antes de cada teste.

## 8. Finalize

- [ ] `npm run typecheck` e `npm test` passando
- [ ] Skill `revisao-seguranca` aplicada
- [ ] Tipos do frontend atualizados, se o endpoint já for consumido (skill `novo-servico`)
- [ ] `docs/lgpd-dados-pessoais.md` e `docs/arquitetura.md` atualizados, se for o caso
- [ ] Variáveis de ambiente novas em `.env.example`, `src/config.ts` e `README.md`
