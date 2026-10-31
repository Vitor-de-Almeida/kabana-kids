# Registro de decisões

Cada decisão de arquitetura, de tecnologia ou de regra fica registrada aqui, com o motivo. Não apague decisões antigas: se uma mudar, marque-a como **Substituída** e crie uma nova.

Status possíveis: **Aceita**, **Pendente** (precisa de decisão do responsável pelo projeto) ou **Substituída**.

---

### D01 — Monorepo com `backend/` e `frontend/`
**Aceita · 2026-10-30.** Um repositório com uma pasta por aplicação. O app mobile, quando existir, será `mobile/`. Assim a documentação, as regras e o histórico ficam juntos.

### D02 — Uma API REST versionada para todos os clientes
**Aceita · 2026-10-30.** Site e app consomem a mesma API em `/api/v1`. A regra de negócio fica só no backend. Isso evita divergências entre plataformas e concentra a segurança num ponto só.

### D03 — Autenticação: Sanctum em modo SPA (web) e token (mobile)
**Aceita · 2026-10-30.** O site usa cookie de sessão `HttpOnly` + CSRF; o app usa token Bearer no armazenamento seguro do aparelho. Esta decisão refina o `projeto.md`, que previa tokens também para a web: tokens guardados no navegador ficam expostos a ataques XSS, enquanto o cookie `HttpOnly` não pode ser lido por JavaScript.

### D04 — Backend organizado em Actions, FormRequests, Policies e Resources
**Aceita · 2026-10-30.** Cada responsabilidade numa pasta previsível (ver `.claude/rules/backend.md`). As Actions (uma classe por caso de uso) tornam fácil encontrar "onde está a regra de X" e reaproveitar a regra em controllers, comandos e jobs.

### D05 — Serviços e tipos do frontend sem dependência de React
**Aceita · 2026-10-30.** `frontend/src/services/` e `frontend/src/types/` são TypeScript puro, para poderem ser reaproveitados pelo app mobile. Não será criado um pacote compartilhado antes de o app existir.

### D06 — ULID como chave primária em tabelas com dados pessoais
**Aceita · 2026-10-30.** Tabelas como `waitlist_entries`, `students`, `enrollments` e `documents` usam ULID em vez de números sequenciais, para que os IDs não revelem quantos registros existem nem permitam adivinhar outros IDs. É uma camada extra: a proteção principal continua sendo a Policy. A tabela `users`, que já existe, mantém o ID numérico.

### D07 — Idioma do código e dos textos
**Aceita · 2026-10-30.** Identificadores em inglês, para combinar com o Laravel, o React e os nomes de tabela do `projeto.md`. Textos de interface, comentários, documentação e commits em português do Brasil. O código existente com variáveis em português (ex.: `aberto`, `enviado`) não será renomeado só por isso.

### D08 — Framework de testes do frontend
**Pendente.** Hoje não há testes no frontend. Sugestão: Vitest + Testing Library (integram com o Vite já usado). Depende de autorização para instalar.

### D09 — Tecnologia do app mobile
**Pendente.** As opções do `projeto.md` são React Native e Flutter. React Native permitiria reaproveitar TypeScript, `services/` e `types/` (D05). Decidir após a Fase 4.

### D10 — Mensagens de erro da API em português
**Pendente.** O backend usa `APP_LOCALE=en`, então as mensagens de validação saem em inglês. Para traduzir é preciso publicar os arquivos de idioma `pt_BR` (criando-os ou usando um pacote). Decidir antes de integrar o primeiro formulário.

### D11 — Orientações do assistente de IA só em Markdown
**Aceita · 2026-10-30.** A pasta `.claude/` guarda apenas regras (`rules/*.md`) e skills (`skills/*/SKILL.md`). Os hooks em JavaScript e o `settings.json` foram removidos: o objetivo é ensinar o padrão por instruções documentadas, sem scripts que alterem o ambiente de desenvolvimento. Consequência: a formatação (Pint, ESLint) e o bloqueio de leitura do `.env` deixam de ser automáticos e passam a depender das regras escritas (`CLAUDE.md` e a tabela de verificações). As orientações de visual e acessibilidade saíram de `frontend.md` para `design.md`.

### D12 — Vários responsáveis por criança
**Pendente.** O `projeto.md` original previa `user_id` em `students` (um responsável por criança). Proposta: tabela `guardian_student`, permitindo mais de um responsável (ex.: mãe e pai), cada um com o próprio login. Decidir antes da Fase 2.

### D13 — Como a escola consulta a lista de espera na Fase 1
**Pendente.** O painel da escola só existe na Fase 2. Opções: antecipar uma tela de admin com login, ou consultar pelo terminal até a Fase 2. Envio dos cadastros por e-mail não é recomendado (espalha dados de crianças fora do sistema). Decidir antes do deploy da Fase 1.

### D14 — Hospedagem e local dos dados
**Pendente.** Railway e Render não têm servidores no Brasil, o que caracteriza transferência internacional de dados (LGPD, Art. 33). Além disso, o login por cookie (D03) exige que site e API fiquem no mesmo domínio (ex.: `kabanakids.com.br` e `api.kabanakids.com.br`). Decidir antes do deploy da Fase 1.

### D15 — Tabela de turmas se chama `classrooms`
**Aceita · 2026-10-30.** O `projeto.md` original usava `classes`, mas `class` é palavra reservada do PHP e não pode ser nome de model. A tabela passa a ser `classrooms` (model `Classroom`), com a tabela de ligação `classroom_student`.

### D16 — Explicações didáticas ao responsável pelo projeto
**Aceita · 2026-10-30.** O responsável está aprendendo programação. O `CLAUDE.md` ganhou a seção "Como explicar ao responsável pelo projeto" e o `projeto.md` foi reescrito com explicações dos princípios básicos de cada etapa, corrigido para refletir as regras atuais e marcado com o estado de cada passo.

### D17 — Sessões do site: Redis em produção, cookie `SameSite=Lax`
**Aceita · 2026-10-30.** Cookie de sessão `HttpOnly`, `Secure` e `SameSite=Lax`, com duração de 60 minutos de inatividade. Escolhemos `Lax` e não `Strict` porque o login com Google (previsto) devolve o usuário ao site por uma navegação vinda de outro endereço, e o cookie `Strict` não seria enviado nesse retorno. `Lax` ainda bloqueia o cookie em requisições enviadas por outros sites (proteção contra CSRF, somada ao token CSRF do Sanctum). Em desenvolvimento a sessão fica no banco (`SESSION_DRIVER=database`), pois o Redis não está instalado; o `.env.example` já traz as variáveis prontas e, em produção, usa-se `SESSION_DRIVER=redis` com `SESSION_CONNECTION=default` (cache em outra conexão, para o `cache:clear` não apagar sessões). O Redis de produção precisa de senha, rede interna, TLS fora da máquina e política de memória que não apague sessões; a hospedagem depende da D14. O app mobile não usa sessão: usa token do Sanctum (D03). **Pendente para a Fase 2:** regenerar a sessão após o login e ao mudar de perfil, e invalidá-la no logout (ver `projeto.md`, passo 2.5). **Em aberto:** o padrão `SESSION_EXPIRE_ON_CLOSE` do `config/session.php` é `true` (a sessão acaba ao fechar o navegador); decidir se mantemos.
