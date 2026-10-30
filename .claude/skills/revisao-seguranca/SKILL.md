---
name: revisao-seguranca
description: Revisa as mudanças atuais com foco em segurança e LGPD (dados de crianças), autenticação, autorização, validação e exposição de dados. Use antes de concluir qualquer tarefa que toque dados pessoais, rotas da API, permissões, uploads ou login, e antes de abrir um PR.
---

# Revisão de segurança e LGPD

Revise **o que mudou** (`git diff` e `git diff --staged`; para uma branch, `git diff Main...HEAD`) com base em `.claude/rules/seguranca.md`. Leia o código ao redor quando o diff não for suficiente para concluir.

## Checklist

**Dados de crianças e LGPD**
- [ ] Todo dado pessoal novo está em `docs/lgpd-dados-pessoais.md`?
- [ ] Nenhum dado pessoal aparece em logs, URLs, mensagens de erro, `console.log` ou `localStorage`?
- [ ] O Resource devolve só os campos necessários? Dados de crianças fora das rotas públicas?
- [ ] O consentimento do responsável é exigido e registrado onde a regra pede?
- [ ] Os seeders, factories e testes usam somente dados fictícios?

**Acesso**
- [ ] Toda rota nova é privada (`auth:sanctum`) ou está explicitamente marcada como pública e com `throttle`?
- [ ] Toda ação sobre um recurso passa por uma Policy? Um responsável consegue acessar dados de outra família trocando o ID? (Deve receber 403 ou 404.)
- [ ] O `role` vem do banco e não pode ser enviado pelo cliente?
- [ ] Existe teste para o acesso indevido?

**Entrada e saída**
- [ ] O FormRequest valida todos os campos, com tamanho máximo? O código usa `validated()`?
- [ ] Os models usam `#[Fillable]` explícito, sem campos de controle (`role`, `status`)?
- [ ] Não há SQL bruto com entrada do usuário nem `dangerouslySetInnerHTML` com conteúdo externo?
- [ ] Os uploads usam disco privado, validação de tipo e tamanho e nome gerado?

**Segredos e configuração**
- [ ] Nenhum segredo, token ou `.env` no diff? Nenhuma variável `VITE_*` com segredo?
- [ ] As mudanças de CORS, sessão ou cookies continuam restritas e seguras?

**Dependências** (só se houve mudança autorizada em `composer.lock` ou `package-lock.json`)
- [ ] Rodar `composer audit` e/ou `npm audit` e reportar o resultado.

## Como reportar

Para cada problema: **gravidade** (Crítica / Alta / Média / Baixa), `arquivo:linha`, um cenário concreto de exploração e a correção sugerida. Se não houver problemas, diga o que foi verificado. Corrija os itens Críticos e Altos antes de dar a tarefa por concluída, ou peça uma decisão ao usuário se a correção mudar o escopo.
