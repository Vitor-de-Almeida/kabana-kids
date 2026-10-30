# Kabana Kids

Sistema da escola de educação infantil Kabana Kids: site público com lista de espera, portal das famílias, painel da escola e, no futuro, aplicativo móvel.

## Estrutura do repositório

```
kabanaKids/
├── backend/     # API em Laravel (PHP), única fonte das regras de negócio
├── frontend/    # Site em React + Vite + TypeScript + Tailwind
├── docs/        # Arquitetura, decisões e inventário de dados pessoais (LGPD)
├── .claude/     # Regras e skills do assistente de IA (somente Markdown)
├── CLAUDE.md    # Regras gerais do projeto
└── projeto.md   # Roadmap por fases
```

## Requisitos

- PHP 8.3+ (extensões `pdo_pgsql`, `mbstring`, `openssl`) e Composer
- Node.js 20+
- PostgreSQL 16

## Como rodar localmente

**Backend** (http://localhost:8000):

```bash
cd backend
composer install
cp .env.example .env        # depois preencha DB_* com o seu PostgreSQL local
php artisan key:generate
php artisan migrate
php artisan serve
```

**Frontend** (http://localhost:5173):

```bash
cd frontend
npm install
npm run dev
```

## Comandos úteis

| Onde | Comando | Para quê |
|---|---|---|
| `backend/` | `php artisan test` | Roda os testes (PHPUnit) |
| `backend/` | `vendor/bin/pint` | Formata o código PHP (`--test` só verifica) |
| `backend/` | `composer audit` | Procura vulnerabilidades nas dependências |
| `frontend/` | `npm run lint` | Analisa o código com ESLint |
| `frontend/` | `npm run build` | Checa os tipos e gera a versão de produção |
| `frontend/` | `npm audit` | Procura vulnerabilidades nas dependências |

## Documentação

- [Arquitetura](docs/arquitetura.md): como as partes se conectam e onde encontrar cada coisa.
- [Decisões](docs/decisoes.md): o que foi decidido e por quê.
- [Dados pessoais (LGPD)](docs/lgpd-dados-pessoais.md): quais dados coletamos, por quê e por quanto tempo.
- [Regras do projeto](CLAUDE.md): padrões de código, segurança e fluxo de trabalho.
