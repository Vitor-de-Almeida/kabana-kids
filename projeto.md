# Kabana Kids — Guia Passo a Passo

Aplicação web para gestão escolar (Laravel + PostgreSQL + React), com foco em segurança (dados de crianças / LGPD) e evolução incremental.

---

## O que é MVP?

**MVP** = *Minimum Viable Product* (Produto Mínimo Viável).

É a **primeira versão que já funciona**, mesmo sendo simples. Não precisa ter tudo pronto, mas precisa:

- Resolver um problema real (ex.: pais se cadastrarem na lista de espera)
- Estar segura o suficiente para uso real
- Estar **publicada na internet** para a escola acompanhar

Este projeto está dividido em **4 fases**. Cada fase é um MVP incremental — publique após a Fase 1 e evolua aos poucos.

---

## Visão geral

```
React (frontend)  ──HTTPS/JSON──►  Laravel (API)  ──►  PostgreSQL
App mobile (futuro) ──mesma API──►
```

**Ordem de construção:** backend + banco → segurança → frontend → deploy → novas fases.

**Perfis de usuário:**

| Perfil | O que faz |
|--------|-----------|
| `parent` | Cadastra filhos, acompanha matrícula, vê comunicados |
| `admin` | Gerencia tudo: alunos, matrículas, turmas, pagamentos |
| `teacher` | Vê suas turmas, registra presença |

**Fases de entrega:**

| Fase | O que entrega |
|------|---------------|
| 1 | Site público + lista de espera |
| 2 | Login + portal pais + painel escola |
| 3 | Matrícula completa (formulários, documentos, status) |
| 4 | Turmas, aulas, presença + pagamentos |

---

## Estrutura do projeto

```
Kabana Kids/
├── backend/          # Laravel API
├── frontend/         # React (Vite + TypeScript)
├── docs/             # Política de privacidade, diagramas
├── .gitignore
└── README.md
```

---

## Passo a passo

### Fase 0 — Ambiente local

**1.** Instalar no PC:

- PHP 8.2+ (extensões: `pdo_pgsql`, `mbstring`, `openssl`)
- Composer — https://getcomposer.org/
- Node.js 20+ — https://nodejs.org/
- PostgreSQL 16 — https://www.postgresql.org/download/windows/
- Git — https://git-scm.com/

**2.** Criar banco local no PostgreSQL:

- Nome: `kabanakids`
- Usuário dedicado (não use `postgres` em produção)
- Anotar host, porta, usuário e senha

**3.** Inicializar Git na pasta do projeto:

```bash
git init
```

---

### Fase 1 — Backend Laravel

**4.** Criar o projeto:

```bash
composer create-project laravel/laravel backend
```

**5.** Configurar `backend/.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=kabanakids
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
```

**6.** Testar conexão com o banco:

```bash
cd backend
php artisan migrate
```

**7.** Instalar autenticação API (Laravel Sanctum):

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

**8.** Criar tabelas **por fase** (não crie tudo de uma vez):

*Fase 1 — núcleo:*

| Tabela | Campos essenciais |
|--------|-------------------|
| `users` | nome, email, senha, `role` (admin/parent/teacher) |
| `waitlist_entries` | nome_responsavel, email, telefone, nome_crianca, data_nascimento, status |

*Fase 2 — portal:*

| Tabela | Campos essenciais |
|--------|-------------------|
| `students` | nome, data_nascimento, `user_id` |
| `announcements` | titulo, conteudo, `author_id`, publicado_em |

*Fase 3 — matrícula:*

| Tabela | Campos essenciais |
|--------|-------------------|
| `enrollments` | `student_id`, status, ano_letivo, observacoes |
| `documents` | `enrollment_id`, tipo, caminho_arquivo, status |

*Fase 4 — turmas e pagamentos:*

| Tabela | Campos essenciais |
|--------|-------------------|
| `classes` | nome, ano_letivo, `teacher_id` |
| `class_student` | `class_id`, `student_id` |
| `lessons` | `class_id`, data, conteudo |
| `attendances` | `lesson_id`, `student_id`, presente |
| `payments` | `enrollment_id`, valor, status, gateway_ref |

**9.** Criar migrations, models, controllers e rotas API por fase.

- Começar com: `POST /api/waitlist` (público) e `/api/auth/*`
- Usar prefixo `/api/v1/` desde o início (prepara mobile)

**10.** Configurar CORS para aceitar só o domínio do React (local e produção).

---

### Segurança (fazer em paralelo com tudo — prioridade máxima)

**11.** Senhas: bcrypt/argon2 (padrão Laravel). Nunca salvar senha em texto.

**12.** Perfis de acesso (RBAC):

- `admin` — vê e edita tudo
- `parent` — só vê seus filhos
- `teacher` — só vê suas turmas

**13.** Em toda rota sensível, verificar permissão:

- Pai: "este aluno é meu?"
- Professor: "esta turma é minha?"
- Admin: acesso total + log de auditoria em ações críticas

**14.** Rate limiting no login (`throttle`) contra brute force.

**15.** Tokens Sanctum com expiração; logout invalida o token.

**16.** Coletar só dados necessários (LGPD — minimização):

- MVP: nome, data de nascimento, responsável
- Evitar CPF, foto, endereço até ser obrigatório

**17.** Dados de crianças: nunca em rotas públicas; nunca em logs.

**18.** Escrever Política de Privacidade e Termos de Uso (menores + consentimento do responsável).

**19.** HTTPS obrigatório em produção.

**20.** Variáveis sensíveis só no `.env` — nunca commitar.

**21.** Backups diários do PostgreSQL em produção.

**22.** Atualizar dependências: `composer audit` e `npm audit`.

**Checklist de segurança:**

| Item | Obrigatório? |
|------|-------------|
| HTTPS em produção | Sim |
| Login em rotas privadas | Sim |
| Autorização por perfil | Sim |
| Dados mínimos de crianças | Sim |
| Política de privacidade | Sim (antes de coletar dados) |
| Backups | Sim (produção) |
| 2FA para admins | Recomendado (Fase 2) |

---

### Frontend React

**23.** Criar o frontend:

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install
```

**24.** Instalar: `axios` (ou fetch nativo) + `react-router-dom`.

**25.** Estrutura de pastas:

```
frontend/src/
  pages/
    public/       # Landing, CadastroInteresse
    parent/       # DashboardPais, MeusFilhos, Comunicados
    school/       # DashboardAdmin, Alunos, Matriculas, Turmas
    auth/         # Login (redireciona por perfil)
  components/
  services/       # Chamadas à API
  hooks/          # useAuth, useRole
```

**26.** Fase 1 — telas públicas:

- Landing page (logo, sobre a escola, CTA)
- Formulário de lista de espera
- Link para política de privacidade no formulário

**27.** Fase 2 — área logada:

- Login → redireciona por `role`
- Portal pais: meus filhos, comunicados
- Painel admin: interessados, alunos, comunicados
- Painel professor: minhas turmas

**28.** Fase 3 — matrícula: dados → documentos → confirmação → status.

**29.** Fase 4 — turmas e pagamentos: aulas, presença, histórico.

**30.** Proxy no Vite (`vite.config.ts`): `/api` → `http://localhost:8000`.

---

### Testar localmente

**31.** Subir os servidores:

```bash
# Terminal 1
cd backend && php artisan serve

# Terminal 2
cd frontend && npm run dev
```

**32.** Testar o fluxo da fase atual antes de avançar.

**33.** Commitar no Git ao concluir cada fase.

---

### Deploy (após Fase 1)

| Componente | Serviço sugerido |
|------------|------------------|
| Backend + DB | Railway ou Render |
| Frontend | Vercel ou Netlify |
| Domínio | Registro.br (~R$40/ano) |

**34.** Criar repositório no GitHub + deploy automático (push → site atualiza).

**35.** PostgreSQL gerenciado no Railway/Render (não use banco local em produção).

**36.** Variáveis de ambiente em produção: `DB_*`, `APP_KEY`, `APP_URL`, `FRONTEND_URL`.

**37.** Rodar migrations: `php artisan migrate --force`.

**38.** Build do React: `npm run build` + `VITE_API_URL` apontando para a API.

**39.** HTTPS ativo (automático na maioria dos hosts).

**40.** Criar usuário admin via seeder ou `php artisan tinker`.

**41.** Publicar Fase 1 — landing + lista de espera no ar.

**42.** Deploy a cada fase concluída.

---

### Futuro (mobile e evolução)

**43.** API versionada (`/api/v1/`) — React e app mobile usam a mesma API.

**44.** Mobile: React Native ou Flutter (após Fase 4 estável).

**45.** Pagamentos: Mercado Pago ou Stripe — só com HTTPS + gateway certificado.

**46.** Monitoramento: Sentry para erros.

---

## Resumo — 12 passos na ordem certa

1. Instalar PHP, Composer, Node, PostgreSQL, Git
2. Criar Laravel + conectar PostgreSQL
3. Instalar Sanctum + RBAC (admin, parent, teacher)
4. **Fase 1:** API + React (landing + lista de espera)
5. Escrever política de privacidade
6. **Deploy Fase 1** — site no ar
7. **Fase 2:** login + portal pais + painel escola
8. **Fase 3:** matrícula com documentos
9. **Fase 4:** turmas, aulas, presença, pagamentos
10. Deploy a cada fase
11. Manter API versionada para mobile
12. App mobile (quando web estiver estável)

---

## O que NÃO fazer

- Não começar pelo design bonito sem API funcionando
- Não implementar pagamentos antes de autenticação sólida
- Não expor dados de crianças sem login
- Não usar SQLite em produção
- Não commitar `.env` ou credenciais

---

## Links úteis

- Laravel: https://laravel.com/docs
- Sanctum: https://laravel.com/docs/sanctum
- React + Vite: https://vitejs.dev/guide/
- LGPD (ANPD): https://www.gov.br/anpd/pt-br
- Mercado Pago: https://www.mercadopago.com.br/developers
