---
paths:
  - "backend/tests/**"
  - "backend/src/**"
  - "frontend/src/**/*.test.*"
---

# Testes

Teste o comportamento que importa para o usuário e para a segurança, não detalhes de implementação.

## Backend (Vitest)

- **Todo endpoint tem testes** em `tests/api/v1/<recurso>/` cobrindo, no mínimo:
  1. o caminho de sucesso (status e formato do JSON);
  2. a validação (`422` com os erros esperados);
  3. o acesso sem login (`401`) em rotas privadas;
  4. o acesso indevido (`403` ou `404`), por exemplo um responsável tentando ver o filho de outra família;
  5. o rate limit em rotas públicas e de autenticação.
- Os testes de API ligam o servidor numa porta livre com `startTestServer()` (`tests/helpers.ts`) e chamam a API com o `fetch` nativo do Node. Não é preciso outra biblioteca.
- Testes de unidade (`tests/unit/`) para Actions com regras não triviais.
- Policies têm testes cobrindo cada perfil (`admin`, `teacher`, `parent`).
- Descrições em inglês, dizendo o comportamento (`it("blocks a parent from viewing another family's student")`), agrupadas por `describe` com o nome do recurso ou da rota.
- Organize cada teste em três blocos, separados por linha em branco: preparar, agir e verificar.
- Cada arquivo começa com um comentário dizendo o que testa, e cada teste tem um comentário curto acima dizendo o que verifica, em português (regra de comentários curtos do `CLAUDE.md`).
- Dados de teste sempre fictícios (ex.: `ana@example.com`, telefone `(11) 90000-0000`). Nunca use nomes, e-mails ou telefones reais.
- Verifique também o que **não** pode vazar: campos ocultos ausentes no JSON (`expect(body.data).not.toHaveProperty("childName")`).
- **Banco de testes:** os testes que tocam o banco usam um PostgreSQL separado (`kabana_kids_test`), nunca o banco de desenvolvimento, e limpam as tabelas antes de cada teste. A configuração é criada junto com o primeiro endpoint que usa o banco.
- Comandos: `npm test` (tudo) e `npx vitest run tests/caminho/arquivo.test.ts` (um arquivo). Mais `npm run typecheck` para conferir os tipos.

## Frontend

- Ainda **não há framework de testes** instalado. Não instale um sem autorização (a sugestão registrada é Vitest + Testing Library; ver `docs/decisoes.md`).
- Enquanto isso, a verificação obrigatória é `npm run lint` + `npm run build`, e para mudanças visuais, a conferência no navegador (`npm run dev`) em largura de celular e de desktop.
- Quando houver framework: arquivo `<Nome>.test.tsx` ao lado do componente, com testes pelo que o usuário vê (textos, papéis acessíveis) e não por classes CSS.

## Regra geral

- Bug corrigido ganha um teste que falharia sem a correção.
- Nunca apague ou enfraqueça um teste para fazê-lo passar. Se o teste estiver errado, explique o motivo ao usuário.
