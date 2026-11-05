# Kabana Kids — Roteiro do projeto

Este é o mapa da construção do sistema da escola: o que vamos fazer, em que ordem e **por quê**. Ele foi escrito para quem está aprendendo. Cada passo explica a ideia por trás antes de dizer o que fazer.

As regras técnicas detalhadas (o "como exatamente") ficam em `CLAUDE.md` e em `.claude/rules/`. Este roteiro aponta para elas em vez de repeti-las.

**Legenda:** 🔄 em andamento · ⬜ a fazer · ❓ falta uma decisão sua

Os passos já concluídos são removidos deste roteiro; o que está aqui é o que ainda falta.

---

## Parte 1 — As ideias básicas (first principles)

Antes de construir, vale entender as peças. Usaremos uma comparação que acompanha todo o guia: **o sistema é um restaurante**.

### 1. Cliente e servidor: o salão e a cozinha

- O **salão** é o que as famílias veem: mesas bonitas, cardápio, decoração. No nosso sistema, é o **frontend**, o site que aparece no navegador, feito com **React**.
- A **cozinha** é onde o trabalho de verdade acontece, longe dos olhos do público. É o **backend**, feito com **Node.js** e **Express**, na linguagem **TypeScript** (a mesma do site).
- **Por que separar?** Ninguém do salão pode entrar na cozinha e mexer nas panelas. Se o site (salão) fosse quem decide as regras, qualquer pessoa esperta poderia mudar as regras no próprio navegador dela. Por isso **toda regra importante mora na cozinha**.

### 2. Banco de dados: a despensa com fichas

- O **banco de dados** (PostgreSQL) é um grande armário de fichas organizado em **tabelas**. Cada tabela é uma gaveta (uma para alunos, outra para matrículas) e cada ficha é uma **linha**.
- Só a cozinha (backend) abre a despensa. O salão nunca toca nela diretamente.

### 3. API: o garçom e o cardápio

- A **API** é o garçom. O salão faz um pedido ("cadastre esta família na lista de espera"), o garçom leva à cozinha e volta com a resposta.
- O **cardápio** é a lista do que se pode pedir. Cada item é um **endpoint**, por exemplo `POST /api/v1/waitlist-entries` ("criar um cadastro na lista de espera").
- **Por que uma API?** Porque no futuro haverá um **segundo salão**: o aplicativo de celular. Os dois salões usam o mesmo garçom e a mesma cozinha, então se comportam igual sem duplicar trabalho.
- O **`v1`** no endereço é a versão do cardápio. Se um dia mudarmos um prato de forma que quebre pedidos antigos, criamos um `v2` e o `v1` continua funcionando para quem ainda usa.

### 4. HTTPS: a carta lacrada

- Quando o navegador conversa com o servidor, a mensagem viaja pela internet passando por muitas "mãos". **HTTPS** é como mandar uma carta num envelope lacrado: só o destinatário consegue ler. Sem ele, seria um cartão-postal que qualquer carteiro lê.

### 5. Autenticação e autorização: o crachá e a chave

- **Autenticação** responde "**quem é você?**". É o login, como mostrar o crachá na portaria.
- **Autorização** responde "**o que você pode fazer?**". Ter crachá não abre todas as salas. Uma mãe entra para ver **o próprio filho**, nunca o filho de outra família.
- Os dois são checados **na cozinha** (backend), sempre. Esconder um botão no site não tranca a porta; só tira a placa da frente dela.

### 6. Dados pessoais e a LGPD: as fichas que pertencem às famílias

- A **LGPD** é a lei brasileira que protege dados pessoais. Dados de **crianças** têm proteção extra (artigo 14): é preciso o consentimento claro de um responsável e agir sempre no melhor interesse da criança.
- O princípio mais importante é a **minimização**: só guardamos o que é realmente necessário. Um dado que não foi coletado não pode vazar.
- A lista oficial do que coletamos fica em `docs/lgpd-dados-pessoais.md`.

### 7. Git: a máquina do tempo

- O **Git** tira "fotos" do projeto a cada mudança (os **commits**). Se algo der errado, voltamos para uma foto anterior.
- **Branches** são cópias de rascunho: trabalhamos numa cópia e só juntamos à versão principal (`Main`) quando está pronta e revisada (o **pull request**). Regras em `.claude/rules/git.md`.

### 8. Testes: a prova antes de servir

- Um **teste** é um pequeno programa que confere se outro programa faz o que deveria, por exemplo: "uma mãe tentando ver o filho de outra família recebe *acesso negado*?". Ele roda em segundos, sempre que quisermos, e avisa se algo quebrou.

### 9. Deploy: abrir as portas do restaurante

- Enquanto o sistema roda só no seu computador (**ambiente local**), ninguém mais vê. **Deploy** é colocá-lo num servidor na internet (**produção**) para as famílias usarem.

### 10. MVP: o primeiro prato que já pode ser servido

- **MVP** (Produto Mínimo Viável) é a primeira versão que **já resolve um problema real** e é segura, mesmo simples. Construímos em **fases**: cada fase é um MVP que vai ao ar, e a seguinte acrescenta algo.

---

## Parte 2 — Visão geral

```
Site (React)         ──┐  cookie de sessão
                       ├── HTTPS / JSON ──►  API Node (/api/v1)    ──►  PostgreSQL
App mobile (futuro)  ──┘  token
```

O site e o app usam **formas diferentes de provar quem são** (veja a Etapa 2.4), mas falam com a mesma API. Detalhes em `docs/arquitetura.md`.

### Perfis de usuário

| Perfil | O que faz |
|---|---|
| `parent` (responsável) | No portal da família: vê os próprios filhos, paga mensalidades, vê as fotos tiradas pela escola e lê as notícias de eventos |
| `teacher` (professor) | Vê as próprias turmas, registra presença |
| `admin` (escola) | No painel de gerenciamento: vê os cadastros do formulário de matrícula, efetiva matrículas, cria contas das famílias e gerencia alunos, turmas e pagamentos, com registro de auditoria |

**Como cada um chega lá (D20):** o botão **Entrar** do site leva ao login. A escola cai no painel de gerenciamento; a família, no portal da família. Não existe cadastro aberto: a conta da família só nasce depois que a escola efetiva a matrícula (veja 2.9).

### Fases de entrega

| Fase | O que entrega | Estado |
|---|---|---|
| 1 | Site público + lista de espera | 🔄 |
| 2 | Login + portal das famílias + painel da escola | ⬜ |
| 3 | Matrícula completa (formulários, documentos, status) | ⬜ |
| 4 | Turmas, aulas, presença e pagamentos | ⬜ |
| Futuro | Aplicativo de celular | ⬜ |

### Estrutura do repositório

```
kabanaKids/
├── backend/      # A cozinha: API em Node.js (Express + Prisma)
├── frontend/     # O salão: site em React + Vite + TypeScript + Tailwind
├── docs/         # Arquitetura, decisões e inventário de dados pessoais (LGPD)
├── .claude/      # Regras e skills do assistente de IA (somente Markdown)
├── CLAUDE.md     # Regras gerais do projeto
├── README.md     # Como instalar e rodar
└── projeto.md    # Este roteiro
```

---

## Parte 3 — Passo a passo

### Etapa 0 — Preparar o computador

**O que é:** instalar as ferramentas que transformam o código em um sistema funcionando, como montar a cozinha antes de cozinhar.

**0.1** ✅ Criar um **usuário próprio do projeto** no PostgreSQL. Feito: o banco `kabana_kids` pertence ao usuário `app_fernanda_kabana_kids`, que é o usuário do `DATABASE_URL` no `backend/.env`. O superusuário `postgres` não é usado pelo sistema.
*Por quê:* **menor privilégio**. Se a chave do projeto vazar, ela abre só a gaveta do projeto, não o prédio inteiro.
*O que é o `.env`:* um bilhete com as senhas do sistema, que fica **só no seu computador** e nunca vai para o Git. O `.env.example` é o mesmo bilhete com os campos em branco, para mostrar o formato.

---

### Fase 1 — Site público e lista de espera 🔄

**Objetivo:** uma família visita o site, gosta da escola e deixa os dados para ser chamada quando houver vaga.

*Nome na tela:* no site, essa parte se chama **Matrícula** (item do menu e seção do formulário). O formulário é uma manifestação de interesse: a matrícula de verdade é efetivada depois, pela escola, no painel (D20). Por dentro, a tabela continua `waitlist_entries`.

**1.2** ✅ **Preparar a API** (esqueleto em Node, decisão D18).
*O que foi feito:* a cozinha foi montada com Express. Ela já tem o cardápio vazio (`src/routes/v1.ts`), os cabeçalhos de segurança (`helmet`), a lista de convidados (`cors`), o tratamento de erros que nunca mostra detalhes internos e o endereço `GET /up`, que só responde "estou viva".
*O que ficou para depois:* os crachás (login) chegam na Fase 2, feitos à mão (D21).

**1.3** 🔄 **Tabela e endpoint da lista de espera** (skill `novo-endpoint`). Código pronto, com turma de interesse, mensagem e logs (D23); falta rodar os testes no banco `kabana_kids_test`.

| Tabela | O que guarda |
|---|---|
| `waitlist_entries` | Os campos listados em `docs/lgpd-dados-pessoais.md`, mais `status` e o registro do consentimento (data/hora e versão da política) |

- Endereço: `POST /api/v1/waitlist-entries`. É uma rota **pública** (não precisa de login), então leva **rate limit**: no máximo algumas tentativas por minuto.
  *Por quê:* sem limite, um robô poderia mandar milhares de cadastros falsos por minuto e lotar a despensa.
- A resposta **não devolve** os dados da criança. Quem enviou já sabe o que enviou; repetir só cria mais chances de vazar.

**1.4** ⬜ **Ligar o formulário à API** (skill `novo-servico`), incluindo o **proxy do Vite**.
*O que é o proxy:* no seu computador, o site roda num endereço (`localhost:5173`) e a API em outro (`localhost:8000`). O proxy faz o site achar que os dois estão no mesmo lugar, como um garçom que leva o pedido para a cozinha do prédio ao lado sem a família perceber.

**1.5** ⬜ **Política de Privacidade** (skill `nova-pagina`), publicada **antes** de coletar dados reais.
*Por quê:* a LGPD exige que a família saiba o que acontece com os dados **antes** de entregá-los. O link do formulário hoje aponta para lugar nenhum.

**1.6** ⬜ Resolver as **pendências da LGPD** listadas no fim de `docs/lgpd-dados-pessoais.md` (prazos de guarda dos dados, canal para pedidos das famílias, encarregado de dados).

**1.7** ⬜ **Login e painel da escola antecipados** (D22). A escola vê os cadastros do formulário pelo painel, com login, já na Fase 1. Isso traz para cá o login da Fase 2 (passos 2.1 a 2.6) e o **layout compartilhado** do painel: menu lateral à esquerda e conteúdo à direita, usado pela escola agora e pela família depois, cada um com os seus itens no menu.
*Por quê:* não mandar dados de crianças por e-mail nem depender do terminal para a escola trabalhar.

**1.8** ⬜ **Deploy da Fase 1** (Parte 4).

---

### Fase 2 — Login, portal das famílias e painel da escola ⬜

**Objetivo:** cada pessoa entra com o próprio login e vê **só o que é dela**.

| Tabela | O que guarda (planejado) |
|---|---|
| `users` | `name`, `email`, `password` (embaralhada) e `role` (`admin`, `teacher`, `parent`) |
| `students` | `name`, `birth_date` |
| `guardian_student` | Quem é responsável por qual criança (❓ ver decisões pendentes) |
| `announcements` | `title`, `body`, `author_id`, `published_at` |

> Todo campo com dado pessoal entra **antes** no inventário `docs/lgpd-dados-pessoais.md`.

**2.1** **Senhas embaralhadas (hash).**
*O que é:* a senha nunca é guardada como foi digitada. Ela passa por uma "máquina de moer" que só funciona num sentido: dá para conferir se uma senha está certa, mas não dá para descobrir a senha olhando a ficha. Usaremos o **Argon2id**, um algoritmo feito para senhas que o próprio Node já traz, sem pacote extra (D21).

**2.2** **Perfis (`role`).** O perfil de cada pessoa vem **do banco**, nunca do pedido que o navegador envia.
*Por quê:* se o navegador pudesse dizer "eu sou admin", qualquer um diria.

**2.3** **Autorização por dono (Policies).** Toda consulta pergunta "isto é seu?": uma mãe vê os filhos dela; um professor, as turmas dele. Trocar um número no endereço não pode dar acesso a outra família.

**2.4** **Login: dois jeitos de provar quem é.**
- **Site:** **cookie de sessão** que o JavaScript não consegue ler (`HttpOnly`). É como uma pulseira de evento presa no pulso: o site usa, mas um código malicioso não consegue tirá-la e levar embora.
- **App (futuro):** **token** guardado no cofre do celular.
- *Correção em relação à versão antiga deste roteiro:* ela previa tokens também no site. Token guardado no navegador pode ser roubado por código malicioso, por isso a decisão D03 em `docs/decisoes.md`.

**2.5** **Proteções do login:** no máximo 5 tentativas por minuto; mensagem de erro sempre igual ("E-mail ou senha inválidos"), para não revelar quais e-mails existem; logout que realmente encerra a sessão.
- ⚠️ **Não esquecer:** trocar o identificador da sessão logo após o login (apagar a sessão antiga e criar uma nova, com outro token) e também quando o perfil de alguém mudar. Assim, um número de sessão roubado antes do login não serve para nada. O logout invalida a sessão. Cada um desses passos precisa de teste (D17).

**2.6** **Telas:** login que leva cada perfil ao seu lugar, portal da família (meus filhos, notícias de eventos; mensalidades e fotos chegam na Fase 4), painel de gerenciamento da escola (cadastros do formulário de matrícula, alunos, comunicados, contas das famílias) e painel do professor (minhas turmas). A tela de login já existe só no visual (`frontend/src/pages/auth/Login.tsx`).

**2.7** **Auditoria:** toda vez que um `admin` vê em lote, exporta, altera ou apaga dados de crianças, o sistema anota quem fez, o quê e quando, como o livro de registro de uma portaria.

**2.8** Recomendado: **verificação em duas etapas (2FA)** para `admin`: além da senha, um código no celular.

**2.9** **Criação da conta da família** (D20). Só acontece **depois** de a escola efetivar a matrícula, por um de dois caminhos:
- **(a) A escola cria a conta** no painel de gerenciamento.
- **(b) A escola gera um código** e entrega à família, que cria a própria conta com ele.
*Por quê:* sem cadastro aberto, um estranho não consegue criar uma conta e "se ligar" a uma criança.
⚠️ **O código é uma chave:** precisa ser aleatório e longo, de **uso único**, ter **prazo de validade**, estar ligado a uma matrícula, ser guardado como **hash** (como a senha) e ter **rate limit** na tela onde é usado. Assim, um código vazado ou adivinhado não abre a ficha de ninguém.

---

### Fase 3 — Matrícula ⬜

**Objetivo:** a família faz a matrícula pelo site: dados → documentos → confirmação → acompanha o status.

| Tabela | O que guarda (planejado) |
|---|---|
| `enrollments` | `student_id`, `status`, `school_year`, `notes` |
| `documents` | `enrollment_id`, `type`, `file_path`, `status` |

**3.1** **Documentos ficam num cofre**, nunca numa pasta pública. Só são baixados por quem tem permissão, e o nome do arquivo é gerado pelo sistema (o nome original pode conter dados pessoais).

**3.2** ❓ **Dados de saúde (alergias, remédios, necessidades especiais).** Uma escola costuma precisar deles, mas a LGPD os trata como **dados sensíveis** (artigo 11). Só serão coletados depois de uma decisão registrada, e guardados **criptografados** (embaralhados de um jeito que só o sistema desfaz).

---

### Fase 4 — Turmas, presença e pagamentos ⬜

| Tabela | O que guarda (planejado) |
|---|---|
| `classrooms` | `name`, `school_year`, `teacher_id` |
| `classroom_student` | Qual aluno está em qual turma |
| `lessons` | `classroom_id`, `date`, `content` |
| `attendances` | `lesson_id`, `student_id`, `present` |
| `payments` | `enrollment_id`, `amount`, `status`, `gateway_reference` |

**4.1** *Correção de nome:* a versão antiga usava a tabela `classes`. `class` é uma **palavra reservada** (a própria linguagem a usa) em PHP e também em JavaScript/TypeScript, e um nome assim só causa confusão no código. Por isso, `classrooms`.

**4.2** **Pagamentos** só depois de o login estar sólido, e sempre por um intermediário certificado (Mercado Pago ou Stripe). **Nunca** guardamos número de cartão: quem cuida disso é o intermediário, como a maquininha do restaurante. A família paga as **mensalidades** pelo portal da família (D20).

**4.3** ❓ **Fotos tiradas pela escola** no portal da família (D20). Foto de criança é dado pessoal, e a LGPD exige **consentimento específico** do responsável (artigo 14).
- As fotos ficam num cofre, como os documentos (3.1), e só são vistas por quem tem permissão.
- Antes de implementar: entrar no inventário `docs/lgpd-dados-pessoais.md` e decidir o que fazer com **fotos em que aparecem várias crianças**. Uma família não pode ver o filho de outra sem a autorização dela.

---

## Parte 4 — Colocar no ar (deploy)

| Peça | Sugestão |
|---|---|
| Backend + banco | Railway ou Render (❓ ver "local dos dados" abaixo) |
| Frontend | Vercel ou Netlify |
| Domínio | Registro.br |

**D.1** **Mesmo domínio para site e API.** Use, por exemplo, `kabanakids.com.br` (site) e `api.kabanakids.com.br` (API).
*Por quê:* o cookie de login (a pulseira do evento) só funciona entre endereços da **mesma família de domínio**. Com o site num endereço da Vercel e a API num endereço do Railway, o navegador bloqueia o cookie e o login não funciona.
Junto com isso, configure o **CORS** e o login para aceitarem pedidos **só** do endereço do site. O CORS é a lista de convidados da API: pedidos vindos de outros sites são recusados na porta.

**D.2** **Segredos só nas configurações do servidor** (`DATABASE_URL`, `FRONTEND_URL` e os segredos do login), com `NODE_ENV=production`.
*Por quê:* fora do modo de produção, bibliotecas podem mostrar detalhes internos nos erros, e qualquer visitante veria as entranhas do sistema.

**D.3** **HTTPS ativo** (a maioria das hospedagens faz isso sozinha).

**D.4** **Atualizar a estrutura do banco:** `npm run db:deploy` (aplica as migrations sem criar novas).

**D.5** **Site:** `npm run build` com `VITE_API_URL` apontando para a API. Lembre-se: tudo que começa com `VITE_` fica visível para qualquer visitante, então nunca coloque segredos ali.

**D.6** **Primeiro admin:** criado por um comando de terminal no servidor (a ser escrito na Fase 2), digitando a senha na hora. **Nunca** escreva uma senha real num arquivo do projeto (como um *seeder*), porque ela iria parar no Git.

**D.7** **Cópias de segurança (backups) diárias** do banco, **criptografadas** e com prazo para serem apagadas. Um backup também contém dados de crianças e precisa da mesma proteção do banco.

**D.8** **Verificar as dependências** com `npm audit` (no `backend/` e no `frontend/`) antes de cada deploy. Elas procuram falhas conhecidas nas bibliotecas que usamos.

**D.9** **Atualização automática:** repositório no GitHub ligado à hospedagem, para que cada versão aprovada na `Main` vá ao ar sozinha.

---

## Parte 5 — Futuro

- **App de celular:** React Native ou Flutter, depois que a Fase 4 estiver estável (decisão D09).
- **Monitoramento de erros** (por exemplo, Sentry): é uma tecnologia nova, então precisa de autorização, e deve ser configurado para **nunca** enviar dados pessoais.

---

## Decisões pendentes ❓

Estas perguntas precisam da sua resposta antes da etapa correspondente. Elas também estão registradas em `docs/decisoes.md`.

1. **Quantos responsáveis por criança?** (antes da Fase 2) A versão antiga previa um responsável por criança (`user_id` em `students`). Na prática, mãe e pai costumam querer acesso. A proposta é a tabela `guardian_student`, que permite vários (D12).
2. **Onde ficam os servidores?** (antes do deploy) Railway e Render não oferecem servidores no Brasil (confirme na contratação), então os dados ficariam no exterior. A LGPD permite, mas com condições (transferência internacional, artigo 33). Vale confirmar com quem cuida da parte jurídica da escola ou escolher uma hospedagem com servidores no Brasil (D14).
3. **Dados de saúde na matrícula** (antes da Fase 3): veja 3.2.
4. **Fotos com várias crianças** (antes da Fase 4): veja 4.3.

---

## O que NÃO fazer

- Não expor dados de crianças sem login, nem em endereços, logs ou e-mails.
- Não implementar pagamentos antes de o login estar sólido.
- Não coletar um dado pessoal que não esteja no inventário.
- Não usar SQLite (banco de teste) em produção.
- Não commitar `.env`, senhas ou dados reais.
- Não pular os testes nem a revisão de segurança para "ganhar tempo".

---

## Links úteis

- Node.js: https://nodejs.org/docs/latest-v26.x/api/
- Express: https://expressjs.com
- Prisma: https://www.prisma.io/docs
- Zod: https://zod.dev
- Vitest: https://vitest.dev
- React: https://react.dev
- Vite: https://vite.dev/guide/
- LGPD (ANPD): https://www.gov.br/anpd/pt-br
