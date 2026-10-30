# Arquitetura

## Visão geral

```
┌──────────────────┐
│  Site (React)    │──┐  cookie de sessão + CSRF
└──────────────────┘  │
                      ├──HTTPS / JSON──►  API Laravel (/api/v1)  ──►  PostgreSQL
┌──────────────────┐  │                   regras de negócio,
│  App mobile      │──┘  token Bearer     autenticação e permissões
│  (futuro)        │
└──────────────────┘
```

- **Uma única API** atende o site e o app. As regras de negócio, as permissões e as validações que protegem os dados ficam só no backend, então os dois clientes se comportam igual sem duplicar código.
- **Os clientes são "finos":** mostram dados, coletam entradas e tratam erros.
- **O que pode ser compartilhado entre os clientes** é o que não depende de React web: `frontend/src/services/` (chamadas à API) e `frontend/src/types/` (tipos dos dados). Por isso essas pastas não importam React. Quando o app mobile existir, elas poderão virar um pacote compartilhado, mas só quando houver um segundo cliente de verdade (ver `decisoes.md`).

## Onde encontrar cada coisa

| Procurando... | Onde fica |
|---|---|
| Uma tela do site | `frontend/src/pages/<público>/` |
| Um pedaço de tela reutilizável | `frontend/src/components/` |
| A lista de rotas do site | `frontend/src/App.tsx` |
| Cores, fontes e animações | `frontend/src/index.css` (`@theme`) |
| Como o site chama a API | `frontend/src/services/` |
| A lista de endpoints da API | `backend/routes/api.php` |
| Validação de um formulário | `backend/app/Http/Requests/<Domínio>/` |
| Quem pode fazer o quê | `backend/app/Policies/` |
| Uma regra de negócio | `backend/app/Actions/<Domínio>/` |
| O que a API devolve | `backend/app/Http/Resources/` |
| Estrutura das tabelas | `backend/database/migrations/` |
| Testes da API | `backend/tests/Feature/Api/V1/` |

## Exemplo de fluxo: cadastro na lista de espera

Este fluxo está planejado para a Fase 1; hoje só a parte visual existe.

1. A família preenche o `WaitlistForm` (`frontend/src/components/WaitlistForm.tsx`).
2. O componente chama `createWaitlistEntry()` em `frontend/src/services/waitlist.ts`.
3. O serviço faz `POST /api/v1/waitlist-entries`.
4. Em `routes/api.php`, a rota pública passa pelo rate limit (`throttle`).
5. `StoreWaitlistEntryRequest` valida os campos e o consentimento.
6. O `WaitlistEntryController` chama a Action `CreateWaitlistEntry`, que grava o registro.
7. A resposta sai pelo `WaitlistEntryResource` (sem devolver os dados da criança).
8. O formulário mostra a mensagem de sucesso.

## Perfis de acesso

| Perfil | Acessa |
|---|---|
| `parent` | Somente os próprios filhos e os comunicados |
| `teacher` | Somente as próprias turmas |
| `admin` | Tudo, com auditoria das ações sobre dados de crianças |

Os detalhes de segurança estão em `.claude/rules/seguranca.md`; o contrato da API, em `.claude/rules/api.md`.
