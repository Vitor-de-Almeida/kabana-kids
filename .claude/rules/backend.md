---
paths:
  - "backend/**"
---

# Backend (Laravel 13 + PHP 8.3)

O backend é uma **API**: não renderiza telas. Toda regra de negócio fica aqui, para que site e app mobile se comportem igual.

## Estrutura

Cada pasta tem uma responsabilidade. Para achar algo, pergunte "que tipo de coisa é isto?":

```
backend/app/
├── Actions/<Domínio>/         # Regra de negócio: um caso de uso por classe (CreateWaitlistEntry)
├── Enums/                     # Valores fixos: Role, WaitlistStatus
├── Http/
│   ├── Controllers/Api/V1/    # Controllers finos: recebem, delegam, respondem
│   ├── Requests/<Domínio>/    # Validação + autorização da entrada (StoreWaitlistEntryRequest)
│   ├── Resources/             # Formato da resposta JSON (WaitlistEntryResource)
│   └── Middleware/
├── Models/                    # Eloquent: tabela, relacionamentos, casts
├── Policies/                  # Quem pode fazer o quê em cada model
└── Providers/
backend/routes/api.php         # Rotas /api/v1 (ainda não existe; ver skill novo-endpoint)
backend/database/              # migrations, factories e seeders
backend/tests/                 # Feature (HTTP) e Unit
```

O fluxo de uma requisição é sempre o mesmo:

```
Rota → FormRequest (valida + autoriza) → Controller → Action (regra) → Model → Resource (resposta)
```

## Responsabilidades

- **Controller:** no máximo umas 10 linhas por método. Não contém regra de negócio nem query complexa. Recebe o FormRequest, chama a Action e retorna o Resource.
- **Action:** uma classe por caso de uso, com um método público `handle()`. Nome no formato verbo + substantivo (`CreateWaitlistEntry`, `ApproveEnrollment`). Recebe dados já validados. Pode ser reutilizada por controllers, comandos e jobs.
- **FormRequest:** `rules()` valida todos os campos; `authorize()` delega para a Policy ou retorna `true` em rotas públicas.
- **Policy:** um método por ação (`view`, `create`, `update`, `delete`...). É o único lugar onde se decide permissão.
- **Resource:** define exatamente quais campos saem na resposta. Campo novo no model **não** aparece automaticamente.
- **Model:** use os atributos `#[Fillable]` e `#[Hidden]` (como em `User.php`), `casts()`, relacionamentos e escopos simples. Nada de regra de negócio.
- **Enum:** enums PHP com valores em inglês e `snake_case` (`case Parent = 'parent'`). Faça cast no model (`'role' => Role::class`).

## Convenções

- Gere arquivos com o Artisan para manter o padrão do Laravel: `php artisan make:model`, `make:request`, `make:policy`, `make:resource`, `make:controller`, `make:enum`, `make:test`.
- Tabelas no plural e em `snake_case` (`waitlist_entries`); models no singular (`WaitlistEntry`).
- Tabelas com dados pessoais de crianças ou responsáveis usam ULID como chave primária (`$table->ulid('id')->primary()` + trait `HasUlids`). Ver `docs/decisoes.md`.
- Chaves estrangeiras com `constrained()` e uma regra explícita de `cascadeOnDelete()`/`restrictOnDelete()`.
- Migrations são pequenas e criadas por fase. Nunca edite uma migration que já rodou em produção: crie outra.
- Tipos declarados em todos os parâmetros e retornos.
- Use a injeção de dependência do Laravel (no construtor ou no método); evite `new` de serviços dentro de controllers.
- Configuração vem de `config()`. `env()` só aparece dentro de `config/`.
- O código é formatado pelo Pint (preset `laravel`). Rode `vendor/bin/pint` nos arquivos `.php` alterados antes de concluir a tarefa.

## O que evitar

- Laravel Boost, pacotes extras ou novas camadas (Repository, DTO genérico) sem autorização.
- Lógica em rotas com closure. Rotas apontam para controllers.
- Retornar um model ou um array montado à mão: use um Resource.
- Queries dentro de laços (N+1): use `with()` / `load()`.
- `try/catch` que esconde o erro. Deixe o handler do Laravel responder, ou trate e registre sem dados pessoais.
