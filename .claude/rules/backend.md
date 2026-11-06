---
paths:
  - "backend/**"
---

# Backend (Node.js 26 + TypeScript + Express 5 + Prisma + Zod)

O backend é uma **API**: não renderiza telas. Toda regra de negócio fica aqui, para que site e app mobile se comportem igual. A escolha da tecnologia está na decisão D18 (`docs/decisoes.md`).

## Estrutura

Cada pasta tem uma responsabilidade. Para achar algo, pergunte "que tipo de coisa é isto?":

```
backend/
├── prisma/
│   ├── schema.prisma          # Estrutura das tabelas (models do Prisma)
│   └── migrations/            # Histórico de mudanças no banco, gerado pelo Prisma
├── src/
│   ├── server.ts              # Liga o servidor (só isso)
│   ├── app.ts                 # Monta o Express: segurança, CORS, JSON, rotas e erros
│   ├── config.ts              # Único lugar que lê process.env
│   ├── db.ts                  # Instância única do Prisma Client (criar no primeiro uso)
│   ├── routes/v1.ts           # O cardápio: todas as rotas de /api/v1
│   ├── middleware/            # Peças que rodam antes das rotas (validação, erros, login)
│   ├── schemas/<domínio>/     # Validação da entrada com Zod (storeWaitlistEntry.ts)
│   ├── controllers/v1/        # Controllers finos: recebem, delegam, respondem
│   ├── actions/<domínio>/     # Regra de negócio: um caso de uso por arquivo (createWaitlistEntry.ts)
│   ├── policies/              # Quem pode fazer o quê em cada recurso (Fase 2)
│   ├── resources/             # Formato da resposta JSON (waitlistEntryResource.ts)
│   └── generated/prisma/      # Código gerado pelo Prisma (`npm run db:generate`); não edite nem commite
└── tests/                     # Testes com Vitest (tests/api/v1/<recurso>/)
```

O fluxo de uma requisição é sempre o mesmo:

```
Rota → Middleware de validação (schema Zod) → Controller → Action (regra) → Prisma (banco) → Resource (resposta)
```

## Responsabilidades

- **Rota (`routes/v1.ts`):** liga endereço e verbo HTTP a um controller, com os middlewares da rota (limite de tentativas, validação, login). Sem regra de negócio.
- **Schema (Zod):** valida todos os campos com tipo, tamanho máximo e valores permitidos. O tipo TypeScript da entrada sai do schema (`z.infer`), sem ser escrito duas vezes.
- **Middleware de validação:** aplica o schema e entrega ao controller **só** os dados validados. Campos que não estão no schema são descartados.
- **Controller:** função curta (umas 10 linhas). Recebe os dados validados, chama a Action e responde com o Resource.
- **Action:** uma função por caso de uso, nomeada como verbo + substantivo (`createWaitlistEntry`, `approveEnrollment`). Recebe dados já validados. Pode ser reutilizada por controllers, scripts e tarefas.
- **Policy (Fase 2):** um arquivo por recurso, com uma função por ação (`canViewStudent`, `canUpdateEnrollment`). É o único lugar onde se decide permissão.
- **Resource:** função que monta a resposta listando cada campo explicitamente. Campo novo no banco **não** aparece na resposta automaticamente. Nunca responda com o objeto que veio do Prisma.
- **Schema do Prisma:** tabelas, colunas, relacionamentos e valores fixos (`enum`). Nada de regra de negócio.

## Convenções

- **Módulos ES com TypeScript rodando direto no Node 26** (sem etapa de compilação). Por isso:
  - imports relativos levam a extensão `.ts` (`import { config } from "./config.ts"`);
  - use só TypeScript "apagável": sem `enum` do TypeScript, sem `namespace` e sem parâmetros de construtor com modificadores. Para valores fixos, use `as const` ou o `enum` do Prisma. O `tsc` acusa o que não for permitido (`erasableSyntaxOnly`).
- Use `import type` para importar só tipos.
- **Nomes (padrão no `CLAUDE.md`, D24):** o banco fica em `snake_case` e o código em `camelCase`. No `schema.prisma`, o model fica no singular em `PascalCase` com `@@map` para a tabela no plural, e cada campo em `camelCase` com `@map` para a coluna:
  ```prisma
  model WaitlistEntry {
    guardianName String @map("guardian_name") @db.VarChar(120)
    @@map("waitlist_entries")
  }
  ```
  A tradução acontece só aqui, no `schema.prisma`. Schema Zod, Action, Resource e testes já usam `camelCase`.
- **Logs** são uma exceção: mantêm `snake_case` (`request_id`, `waitlist_entry.created`), como na D23.
- Tabelas com dados pessoais de crianças ou responsáveis usam ULID como chave primária: `id String @id @default(ulid())`. Ver D06.
- Relacionamentos com uma regra explícita de exclusão (`onDelete: Cascade` ou `onDelete: Restrict`).
- Migrations são pequenas e criadas por fase com `npm run db:migrate`. Nunca edite uma migration que já rodou em produção: crie outra.
- Configuração vem de `config.ts`. `process.env` só aparece nele e nos arquivos de ferramenta (`prisma.config.ts`, `vitest.config.ts` e `tests/globalSetup.ts`).
- Tipos declarados nos parâmetros e retornos das funções exportadas.
- Ainda **não há formatador nem linter** no backend (precisam de autorização). Siga a formatação dos arquivos vizinhos: aspas duplas, sem ponto e vírgula, 2 espaços.

## O que evitar

- Pacotes fora da lista da D18 sem autorização.
- Novas camadas (Repository, classes de serviço genéricas, injeção de dependência) sem necessidade real.
- Lógica dentro da rota. Rotas apontam para controllers.
- Responder com o objeto do Prisma ou um objeto montado no controller: use um Resource.
- Consultas dentro de laços (N+1): use `include` ou `select` do Prisma.
- `try/catch` que esconde o erro. Deixe o `errorHandler` responder, ou trate e registre sem dados pessoais.
- `$queryRawUnsafe` e `$executeRawUnsafe`. Se precisar de SQL bruto, use `$queryRaw` com template (os valores viram parâmetros).
