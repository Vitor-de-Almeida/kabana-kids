# Kabana Kids

Sistema da escola de educação infantil Kabana Kids: site público com lista de espera, portal das famílias, painel da escola e, no futuro, aplicativo móvel.

## Estrutura do repositório

```
kabanaKids/
├── backend/     # API em Node.js (Express + Prisma + TypeScript), única fonte das regras de negócio
├── frontend/    # Site em React + Vite + TypeScript + Tailwind
├── docs/        # Arquitetura, decisões e inventário de dados pessoais (LGPD)
├── .claude/     # Regras e skills do assistente de IA (somente Markdown)
├── CLAUDE.md    # Regras gerais do projeto
└── projeto.md   # Roadmap por fases
```

## Requisitos

- Node.js 26 (LTS)
- PostgreSQL 16

## Como rodar localmente

**Backend** (http://localhost:8000):

```bash
cd backend
npm install
cp .env.example .env        # depois preencha com os seus valores (DATABASE_URL e demais)
npm run db:generate         # gera o código do Prisma a partir de prisma/schema.prisma
npm run db:migrate          # cria ou atualiza as tabelas no banco
npm run dev                 # liga a API e reinicia sozinha a cada alteração
```

**Frontend** (http://localhost:5173):

```bash
cd frontend
npm install
npm run dev
```

## Variáveis de ambiente do backend

| Variável | Para quê |
|---|---|
| `NODE_ENV` | `development`, `test` ou `production` |
| `PORT` | Porta da API (padrão `8000`) |
| `FRONTEND_URL` | Endereço do site; só ele pode chamar a API (CORS) |
| `DATABASE_URL` | Conexão com o PostgreSQL, com o usuário da aplicação (nunca o `postgres`) |
| `TEST_DATABASE_URL` | Banco dos testes (`kabana_kids_test`). Precisa terminar em `_test`, porque os testes apagam dados |
| `SHADOW_DATABASE_URL` | Banco temporário (`kabana_kids_shadow`) que o `npm run db:migrate` usa para criar migrations |

## Comandos úteis

| Onde | Comando | Para quê |
|---|---|---|
| `backend/` | `npm run dev` | Liga a API em modo de desenvolvimento |
| `backend/` | `npm test` | Roda os testes (Vitest) |
| `backend/` | `npm run typecheck` | Confere os tipos do TypeScript |
| `backend/` | `npm run db:migrate` | Cria uma migration a partir do `schema.prisma` e aplica no banco local |
| `backend/` | `npm run db:deploy` | Aplica as migrations em produção |
| `backend/` | `npm audit` | Procura vulnerabilidades nas dependências |
| `frontend/` | `npm run lint` | Analisa o código com ESLint |
| `frontend/` | `npm run build` | Checa os tipos e gera a versão de produção |
| `frontend/` | `npm audit` | Procura vulnerabilidades nas dependências |

## Documentação

- [Arquitetura](docs/arquitetura.md): como as partes se conectam e onde encontrar cada coisa.
- [Decisões](docs/decisoes.md): o que foi decidido e por quê.
- [Dados pessoais (LGPD)](docs/lgpd-dados-pessoais.md): quais dados coletamos, por quê e por quanto tempo.
- [Regras do projeto](CLAUDE.md): padrões de código, segurança e fluxo de trabalho.
