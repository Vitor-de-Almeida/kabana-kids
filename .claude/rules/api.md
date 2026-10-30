---
paths:
  - "backend/routes/**"
  - "backend/app/Http/**"
  - "frontend/src/services/**"
  - "frontend/src/types/**"
---

# Contrato da API

A API é a única ponte entre os clientes (site e futuro app mobile) e os dados. Mudar o contrato afeta todos os clientes, então ele precisa ser previsível e estável.

## Endereços

- Prefixo **`/api/v1`** em todas as rotas. Uma mudança incompatível (remover ou renomear um campo, mudar um tipo) cria `/api/v2`; nunca quebre a `v1` em uso.
- Recursos no plural, em inglês e kebab-case: `/api/v1/waitlist-entries`, `/api/v1/students/{student}`.
- Verbos HTTP com o significado padrão: `GET` lê, `POST` cria, `PUT`/`PATCH` altera, `DELETE` remove.
- Ações que não são CRUD viram sub-recursos: `POST /api/v1/enrollments/{enrollment}/approve`.
- Dados pessoais nunca vão na URL nem na query string. Filtros com dados pessoais (ex.: busca por nome) usam parâmetros controlados e são limitados a `admin`.

## Formato

- Requisição e resposta em JSON. O cliente envia `Accept: application/json`.
- Campos em `snake_case` (padrão do Laravel). O frontend usa os mesmos nomes, sem conversão.
- Datas em ISO 8601 (`2026-10-30` e `2026-10-30T14:00:00-03:00`).
- Toda resposta de sucesso sai por um **API Resource** e vem dentro de `data`:

```json
{ "data": { "id": "01J...", "status": "pending", "created_at": "2026-10-30T14:00:00-03:00" } }
```

- Listas são sempre paginadas (`->paginate()`, com no máximo 50 itens por página) e trazem `data`, `links` e `meta`.
- O Resource expõe só os campos que o cliente precisa. Nunca retorne um model diretamente.

## Erros

Use o formato padrão do Laravel; o cliente se baseia no status HTTP.

| Status | Quando | Corpo |
|---|---|---|
| `401` | Não autenticado | `{ "message": "..." }` |
| `403` | Autenticado, mas sem permissão | `{ "message": "..." }` |
| `404` | Não existe **ou** o usuário não pode saber que existe | `{ "message": "..." }` |
| `422` | Falha de validação | `{ "message": "...", "errors": { "campo": ["..."] } }` |
| `429` | Rate limit atingido | `{ "message": "..." }` |
| `500` | Erro inesperado | Mensagem genérica, sem detalhes internos |

## Autenticação

- Rotas privadas usam o middleware `auth:sanctum`, que aceita os dois modos: o site autentica por cookie de sessão + CSRF e o app mobile por token `Bearer`. Detalhes em `seguranca.md`.
- Rotas públicas ficam agrupadas e identificadas em `routes/api.php`, sempre com `throttle`.

## Compatibilidade entre clientes

- A API não sabe se quem chama é o site ou o app: não crie endpoints específicos de plataforma sem uma decisão registrada.
- Os tipos TypeScript em `frontend/src/types/` espelham os Resources. Ao mudar um Resource, atualize os tipos no mesmo trabalho.
