---
paths:
  - "backend/tests/**"
  - "backend/database/factories/**"
  - "backend/app/**"
  - "frontend/src/**/*.test.*"
---

# Testes

Teste o comportamento que importa para o usuário e para a segurança, não detalhes de implementação.

## Backend (PHPUnit)

- **Todo endpoint tem testes de Feature** em `tests/Feature/Api/V1/<Recurso>/` cobrindo, no mínimo:
  1. o caminho de sucesso (status e formato do JSON);
  2. a validação (`422` com os erros esperados);
  3. o acesso sem login (`401`) em rotas privadas;
  4. o acesso indevido (`403` ou `404`), por exemplo um responsável tentando ver o filho de outra família;
  5. o rate limit em rotas públicas e de autenticação.
- Testes de **Unit** (`tests/Unit/`) para Actions com regras não triviais e para Enums com lógica.
- Policies têm testes cobrindo cada perfil (`admin`, `teacher`, `parent`).
- Nomes de métodos em inglês e `snake_case` descrevendo o comportamento (padrão de `ExampleTest.php`): `test_parent_cannot_view_another_familys_student`.
- Organize cada teste em três blocos, separados por linha em branco: preparar, agir e verificar.
- Use factories com Faker para criar dados. Nunca use nomes, e-mails ou telefones reais.
- Use o trait `RefreshDatabase` em testes que tocam o banco.
- Verifique também o que **não** pode vazar: campos ocultos ausentes no JSON (`assertJsonMissingPath`).
- Os testes rodam em SQLite em memória (`phpunit.xml`). Se uma funcionalidade depender de recurso específico do PostgreSQL, avise o usuário.
- Comandos: `php artisan test` (tudo) e `php artisan test --filter=NomeDoTeste` (um teste).

## Frontend

- Ainda **não há framework de testes** instalado. Não instale um sem autorização (a sugestão registrada é Vitest + Testing Library; ver `docs/decisoes.md`).
- Enquanto isso, a verificação obrigatória é `npm run lint` + `npm run build`, e para mudanças visuais, a conferência no navegador (`npm run dev`) em largura de celular e de desktop.
- Quando houver framework: arquivo `<Nome>.test.tsx` ao lado do componente, com testes pelo que o usuário vê (textos, papéis acessíveis) e não por classes CSS.

## Regra geral

- Bug corrigido ganha um teste que falharia sem a correção.
- Nunca apague ou enfraqueça um teste para fazê-lo passar. Se o teste estiver errado, explique o motivo ao usuário.
