# Kabana Kids — Regras do projeto

Sistema da escola de educação infantil Kabana Kids: site público, portal das famílias, painel da escola e, no futuro, aplicativo móvel. O sistema lida com **dados de crianças**, então segurança e LGPD vêm antes de qualquer outra consideração.

@README.md

## Hierarquia das regras

Cada orientação mora em **um único lugar**. Em caso de conflito, vale o item de cima.

1. **Este arquivo**: regras gerais, válidas para todo o projeto.
2. **`.claude/rules/`**: regras por área. As que têm `paths` são carregadas automaticamente quando o arquivo trabalhado é daquela área.
   - `seguranca.md` (sempre carregada): Security by Design, autenticação, autorização e LGPD.
   - `git.md` (sempre carregada): commits, branches e pull requests.
   - `api.md`: contrato da API compartilhada entre web e mobile.
   - `backend.md`: arquitetura e padrões do backend em Node (Express + Prisma + Zod).
   - `frontend.md`: arquitetura e padrões do React.
   - `design.md`: identidade visual, textos de interface e acessibilidade.
   - `testes.md`: padrões de teste.
3. **`.claude/skills/`**: passo a passo para tarefas recorrentes. As skills aplicam as regras acima sem repeti-las.
4. **`docs/`**: documentação para pessoas (arquitetura, decisões e inventário de dados pessoais).
5. **`projeto.md`**: roadmap por fases. Serve como planejamento; em conflito, as regras acima prevalecem.

A pasta `.claude/` contém **somente arquivos Markdown** (regras e `SKILL.md`). Não crie nela scripts, hooks, `settings.json` ou qualquer automação: o comportamento é guiado por instruções, não por código.

Para mudar uma regra, edite o arquivo onde ela mora (nunca crie uma cópia em outro lugar) e registre o motivo em `docs/decisoes.md`.

## Estado atual

Atualize esta seção ao concluir cada fase.

- **Fase 1 em andamento.** A landing page está pronta; o formulário de lista de espera ainda não envia dados.
- **Backend:** trocado de Laravel para Node.js 26 + TypeScript + Express 5 + Prisma + Zod (D18). Existe só o esqueleto (segurança, CORS, tratamento de erros e `GET /up`); ainda não há rotas em `/api/v1` nem tabelas da escola. Login ainda não escolhido (Fase 2).
- **Frontend:** sem framework de testes. A verificação é feita com `lint` + `build`.
- **Mobile:** ainda não iniciado; a tecnologia não foi decidida (ver `docs/decisoes.md`).

## Regras invioláveis

1. **Não instale, remova nem atualize dependências** (npm) e não introduza novas tecnologias sem autorização explícita. Instalar as dependências já declaradas (`npm install`) é permitido. Os pacotes autorizados do backend estão na D18.
2. **Não altere comportamento existente** sem entender como ele funciona e sem que a tarefa peça. Leia o código envolvido antes de mudar.
3. **Não presuma.** Se algo não está no código nem na documentação, pergunte.
4. **Segurança primeiro.** Siga `.claude/rules/seguranca.md`. Entre conveniência e segurança, escolha segurança e explique a troca.
5. **Nunca leia, edite ou commite arquivos `.env`.** Segredos ficam apenas em variáveis de ambiente.
6. **Regra de negócio fica no backend.** Web e app mobile são clientes da mesma API e não duplicam regras entre si.
7. **Ao encontrar uma vulnerabilidade**, mesmo fora do escopo da tarefa, informe o usuário com a gravidade e uma sugestão de correção.

## Como explicar ao responsável pelo projeto

O responsável pelo projeto está aprendendo programação do zero e quer entender cada passo.

- Explique de forma simples, como para uma criança, e comece pelo princípio básico (*first principles*): **o que é** e **por que existe**, antes de **como fazer**.
- Use as comparações do `projeto.md` (salão = frontend, cozinha = backend, garçom = API, despensa = banco de dados) para manter um vocabulário único.
- Ao usar um termo técnico pela primeira vez, explique-o numa frase.
- Ao final de cada tarefa, diga o que foi feito, por que foi feito assim e qual o próximo passo no roteiro.

## Código limpo

- **Legível para um iniciante:** nomes descritivos, funções curtas, uma responsabilidade por arquivo, sem "mágica".
- **Simples antes de genérico:** só crie uma abstração quando houver repetição real (duas ou três vezes), nunca "para o futuro".
- **Siga o código vizinho:** formatação, nomes e estrutura iguais aos arquivos ao lado.
- **Idioma:** identificadores (variáveis, funções, classes, arquivos, tabelas, rotas da API) em inglês. Textos de interface, comentários, documentação e commits em português do Brasil. Não renomeie código existente só por causa do idioma.
- **Sem código morto:** não deixe código comentado, imports sem uso ou arquivos abandonados.

## Comentários

- Comente o **porquê**, não o quê. Se o código precisa de comentário para explicar o que faz, melhore os nomes primeiro.
- **Comentários curtos:** uma linha, com poucas palavras (até ~60 caracteres). Nunca parágrafos nem frases longas. Se não couber, o código precisa de nomes melhores ou a explicação vai para a documentação.
- Comente decisões não óbvias, restrições de segurança e limitações temporárias. Exemplo do projeto:
  `// Ainda sem backend: quando a API POST /api/v1/waitlist-entries existir, o envio acontece aqui.`
- Não escreva comentários que repetem o código, cabeçalhos decorativos ou `TODO` sem contexto. Todo `TODO` diz o que falta e por quê.
- Comentários de documentação (JSDoc) só quando acrescentam informação que o tipo não expressa (por exemplo, o formato esperado de uma data).

## Fluxo de trabalho

1. **Entender:** leia os arquivos envolvidos, as regras da área e, se houver, a skill da tarefa.
2. **Implementar:** use o menor escopo que resolve o pedido.
3. **Verificar:** rode as verificações da tabela abaixo para cada área alterada.
4. **Revisar a segurança:** use a skill `revisao-seguranca` sempre que a mudança tocar dados pessoais, autenticação, autorização, uploads ou API.
5. **Documentar:** veja a seção abaixo.
6. **Relatar:** diga o que mudou, o que foi verificado e o que ficou pendente. Se uma verificação falhou ou não pôde ser executada, diga isso.

| Área alterada | Verificação obrigatória |
|---|---|
| `backend/` | `cd backend && npm run typecheck && npm test` |
| `frontend/` | `cd frontend && npm run lint && npm run build` |

## Quando atualizar a documentação

| Mudança | Arquivo |
|---|---|
| Decisão de arquitetura ou de tecnologia, ou mudança de regra | `docs/decisoes.md` |
| Novo dado pessoal coletado (atualizar **antes** de coletar) | `docs/lgpd-dados-pessoais.md` |
| Nova pasta, módulo ou fluxo importante | `docs/arquitetura.md` |
| Novo comando, variável de ambiente ou passo de instalação | `README.md` |
| Fase concluída ou mudança de estado relevante | seção "Estado atual" deste arquivo |
