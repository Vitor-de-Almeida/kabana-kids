# Git: commits, branches e pull requests

## Commits

Só faça commit quando o usuário pedir. Use o padrão Conventional Commits, com a descrição em português:

```
<tipo>(<escopo>): <descrição curta no presente>

<corpo opcional: o porquê da mudança, não o como>
```

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `security` | Correção ou reforço de segurança |
| `refactor` | Mudança de código sem mudar comportamento |
| `style` | Ajuste visual ou de formatação |
| `test` | Testes |
| `docs` | Documentação e regras (inclui `CLAUDE.md` e `.claude/`) |
| `chore` | Configuração, build, dependências autorizadas |

**Escopos:** `backend`, `frontend`, `api`, `mobile`, `docs`, `claude`.

Exemplos:

```
feat(backend): adiciona endpoint de cadastro na lista de espera
fix(frontend): corrige foco do menu mobile ao fechar
security(api): aplica rate limit no login
```

- Um commit, um assunto. Separe backend, frontend e documentação quando forem independentes.
- Descrição com no máximo ~72 caracteres, letra minúscula e sem ponto final.
- Antes de commitar, confira o `git diff --staged`: nada de `.env`, `docs/`, dumps de banco, logs, dados reais, `node_modules`, `vendor` ou `dist`.
- Nunca use `--no-verify` e nunca reescreva o histórico já enviado (`push --force`) sem autorização.

## Branches

- A branch principal é `Main`. Não faça commit direto nela.
- Nomes: `feature/<descricao>`, `fix/<descricao>`, `docs/<descricao>`, `security/<descricao>`, em kebab-case. Ex.: `feature/lista-de-espera-api`.

## Pull requests

A descrição do PR tem quatro partes:

1. **O quê:** o que mudou.
2. **Por quê:** o problema ou a fase do roadmap.
3. **Como foi testado:** comandos rodados e verificações manuais.
4. **Impacto em segurança e LGPD:** novos dados pessoais, rotas, permissões, ou "nenhum".
