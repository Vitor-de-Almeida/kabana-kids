---
name: commit
description: Prepara e cria commits no padrão do projeto (Conventional Commits em português), conferindo antes que não há segredos nem dados pessoais e que as verificações passam. Use quando o usuário pedir para commitar.
disable-model-invocation: true
---

# Commit

Esta skill aplica `.claude/rules/git.md` (formato, tipos, escopos e branches) sem repeti-lo.

1. **Veja o que mudou:** `git status` e `git diff`. Se estiver na branch `Main`, crie uma branch antes.
2. **Barre o que não pode entrar** (lista em `git.md`). Se encontrar algo assim, pare e avise o usuário.
3. **Verifique** cada área alterada (tabela de verificação do `CLAUDE.md`). Se algo falhar, informe o usuário antes de commitar.
4. **Agrupe:** um commit por assunto. Separe backend, frontend e documentação quando forem independentes. Adicione os arquivos pelo nome (`git add <arquivos>`), nunca com `git add -A` às cegas.
5. **Escreva a mensagem** no formato `<tipo>(<escopo>): <descrição>`, com as linhas de atribuição exigidas pelo ambiente.
6. **Confirme:** rode `git log --oneline -5` e mostre ao usuário o que foi commitado. Só faça push se o usuário pedir.
