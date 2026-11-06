# Segurança e LGPD

Esta é a regra de maior prioridade do projeto. O sistema guarda dados de crianças e de seus responsáveis. Um vazamento causa dano real a famílias, não só ao sistema.

## Princípios

- **Negar por padrão:** toda rota exige autenticação, exceto as listadas como públicas em `backend/src/routes/v1.ts`.
- **Menor privilégio:** cada perfil (`admin`, `teacher`, `parent`) acessa só o que precisa.
- **Nunca confie no cliente:** a validação do frontend serve à experiência do usuário; a que protege é a do backend. O app mobile pode ser modificado pelo usuário.
- **Defesa em profundidade:** autenticação, autorização, validação e auditoria se somam; nenhuma substitui outra.
- **Minimização:** colete, mostre e guarde o mínimo de dados pessoais possível.

## Autenticação

O login é feito à mão, sem biblioteca de autenticação (D21), e precisa cumprir todas as regras abaixo.

- **Web:** cookie de sessão `HttpOnly` + `Secure` + `SameSite=Lax`, com proteção CSRF.
- **Mobile:** token de API, guardado no armazenamento seguro do sistema (Keychain no iOS, Keystore no Android).
- **Nunca** guarde token ou sessão em `localStorage`, `sessionStorage`, URL ou log.
- Tokens têm expiração. O logout revoga o token ou a sessão atual.
- Login com rate limit (no máximo 5 tentativas por minuto por e-mail + IP).
- Mensagens de erro genéricas: "E-mail ou senha inválidos". Nunca revele se um e-mail está cadastrado (também na recuperação de senha).
- Senhas: guarde só o hash, com um algoritmo próprio para senhas (Argon2id ou bcrypt), e exija tamanho mínimo. Nunca registre senhas em log nem as retorne em respostas.
- 2FA para `admin` é recomendado a partir da Fase 2.

## Autorização

- Toda ação sobre um recurso passa por uma **Policy** (`src/policies/`), chamada antes da Action. Não espalhe `if (user.role === ...)` pelos controllers.
- Restrinja a consulta ao dono do dado: um responsável busca só os próprios filhos (filtro pelo usuário logado no `where` do Prisma), nunca `findUnique({ where: { id } })` sem Policy. IDs vindos do cliente nunca dão acesso por si só (proteção contra IDOR).
- O perfil (`role`) vem do banco de dados, nunca da requisição. `role` nunca entra num schema Zod de entrada.
- Esconder um botão no frontend não é segurança: o backend precisa negar a ação.
- Toda ação de `admin` que vê em lote, exporta, altera ou exclui dados de crianças gera um **registro de auditoria** (quem, qual ação, qual alvo pelo ID, quando), sem copiar os dados pessoais para o log.

## Validação de entrada

- Toda entrada (`body`, `params`, `query`) passa por um **schema Zod** no middleware de validação. Use só os dados validados, nunca `request.body` direto.
- Valide tipo, formato, tamanho máximo (`.max()`) e valores permitidos (`z.enum`) de todo campo. Datas de nascimento precisam ser plausíveis (no passado e dentro de um limite).
- Mass assignment: o schema Zod lista os campos aceitos e descarta o resto. Campos de controle (`role`, `status`) nunca vêm do cliente, e a Action passa ao Prisma só os campos esperados.

## Proteção da API

- **Rate limit** em todas as rotas públicas (ex.: lista de espera) e de autenticação.
- **CORS** restrito ao domínio do frontend (`FRONTEND_URL`). Nunca `*` em produção.
- **HTTPS** obrigatório em produção. `NODE_ENV=production` em produção.
- As respostas de erro nunca trazem stack trace, SQL, caminho de arquivo ou dados de outro usuário.
- **SQL:** use os métodos do Prisma. Se precisar de SQL bruto, só `$queryRaw` com template (valores viram parâmetros); nunca `$queryRawUnsafe` nem concatenação de entrada do usuário. Para ordenação dinâmica, use uma lista de colunas permitidas.
- Cabeçalhos de segurança no servidor ou na hospedagem: HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `frame-ancestors 'none'`.

## Frontend

- Nunca use `dangerouslySetInnerHTML` com conteúdo vindo de usuário ou da API.
- Variáveis `VITE_*` vão para o navegador e são **públicas**: nunca coloque segredos nelas.
- Não guarde dados pessoais em `localStorage`/`sessionStorage` e não os escreva com `console.log`.
- Links externos com `target="_blank"` levam `rel="noopener noreferrer"`.

## Upload de arquivos (Fase 3)

- Use apenas o disco privado (`storage/app/private`). Documentos nunca vão para `public` nem para `storage:link`.
- Valide `mimes`, `mimetypes` e o tamanho máximo. O nome do arquivo salvo é gerado pelo sistema, nunca o nome original.
- O download acontece só por uma rota autenticada que passa pela Policy.

## LGPD e dados de crianças e adolescentes

- **Art. 14 da LGPD:** o tratamento de dados de crianças exige consentimento **específico e em destaque** de pelo menos um responsável legal e deve atender ao melhor interesse da criança. Registre o consentimento (data/hora e versão da política de privacidade).
- **Inventário obrigatório:** colete só os dados listados em `docs/lgpd-dados-pessoais.md`. Um novo campo pessoal exige autorização do usuário e a atualização do inventário **antes** de ser implementado.
- **Evite** CPF, endereço, foto e documentos até serem realmente necessários.
- **Dados sensíveis (Art. 11)**, como saúde, alergias, deficiência, religião ou origem étnica: não colete sem uma decisão registrada em `docs/decisoes.md`. Se coletados, use o cast `encrypted` e restrinja o acesso.
- Dados pessoais **nunca** aparecem em rotas públicas, query strings, logs, mensagens de erro, nomes de arquivos, analytics ou ferramentas de monitoramento. Em logs, use só IDs.
- **Direitos do titular:** modele pensando em acesso, correção e exclusão. Exclusão significa remover ou anonimizar de verdade; soft delete sozinho não basta.
- **Retenção:** todo dado tem prazo definido no inventário. Dados vencidos são excluídos ou anonimizados.
- **Imagens de crianças reais** só com autorização escrita do responsável. O site público usa imagens de banco ou sem identificação.
- **Dados de teste, seeders e exemplos** são sempre fictícios. Nunca use dados reais.

## Rastreabilidade e logs

Princípio do projeto (D23): **todo dado e toda ação importante precisam ser rastreáveis.** Deve ser possível responder "o que aconteceu, quando, em qual requisição e com qual registro", sem expor dados pessoais.

- **Toda requisição tem um ID** (`request_id`), devolvido no cabeçalho `X-Request-Id` e presente em todos os logs dela. É ele que liga uma reclamação ("deu erro às 14h") ao que aconteceu no servidor.
- **Logs estruturados em JSON**, um evento por linha, pelo `src/logger.ts`. Nunca `console.log` solto.
- **Toda criação, alteração ou exclusão de dado pessoal gera um evento de log** com nome padronizado (`waitlist_entry.created`), o `request_id` e o ID do registro.
- **Logs levam só IDs**, nunca nome, e-mail, telefone, data de nascimento, mensagem livre, senha, token ou o corpo da requisição.
- **Registros guardam a própria história:** `created_at`, `updated_at` e, quando houver consentimento, a data e a versão da política aceita.
- **Ações de `admin` sobre dados de crianças** vão também para a tabela de auditoria (ver "Autorização"), que não se apaga junto com os logs do servidor.

## Segredos e dependências

- `.env` nunca é commitado. O `.env.example` contém só placeholders.
- Se um segredo vazar (commit, log, print), considere-o comprometido: avise o usuário e troque-o.
- Rode `npm audit` no `backend/` e no `frontend/` antes de cada deploy e informe o resultado.
