---
paths:
  - "frontend/**"
---

# Frontend (React 19 + Vite + TypeScript + Tailwind 4)

O frontend só exibe dados e coleta entradas. Regras de negócio e permissões são decididas pela API.

## Estrutura

```
frontend/src/
├── pages/                 # Uma tela por arquivo, separada por público:
│   ├── public/            #   site aberto (Landing)
│   ├── auth/              #   login, recuperação de senha
│   ├── parent/            #   portal das famílias
│   └── school/            #   painel da escola (admin e professores)
├── components/            # Componentes reutilizáveis (Header, Footer, WaitlistForm)
├── services/              # Chamadas à API. TypeScript puro, sem React
├── hooks/                 # Hooks reutilizáveis (useAuth). Criar quando houver o primeiro
├── types/                 # Tipos que espelham os Resources da API
├── App.tsx                # Rotas
├── main.tsx               # Ponto de entrada
└── index.css              # Tailwind + tokens de tema (@theme)
```

Para achar algo: uma tela está em `pages/<público>/`, um pedaço de tela em `components/` e a conversa com o servidor em `services/`.

## Componentes

- Um componente por arquivo, com nome em `PascalCase` igual ao do arquivo (`WaitlistForm.tsx` exporta `WaitlistForm`).
- **Export nomeado** (`export function Header`). A exceção é `App.tsx`, que segue o template do Vite.
- Props tipadas com `type <Nome>Props = { ... }`, logo acima do componente.
- Um componente pequeno usado por uma única página pode ficar no arquivo da página (como `Selo` em `Landing.tsx`). Se crescer ou passar a ser reutilizado, mova para `components/`.
- Dados fixos de exibição (listas de turmas, links do menu) ficam em constantes no topo do arquivo, fora do componente.
- **Componentes visuais** recebem tudo por props. **Componentes de funcionalidade** (como `WaitlistForm`) podem chamar funções de `services/`, nunca o `axios` diretamente.
- Prefira componentes com menos de ~150 linhas. Se passar disso, divida em seções.

## Páginas e rotas

- O arquivo `pages/<público>/<Nome>.tsx` exporta `<Nome>Page` (ex.: `Landing.tsx` → `LandingPage`).
- Toda rota é registrada em `App.tsx`. As URLs que o usuário vê são em português e kebab-case (`/lista-de-espera`, `/portal/meus-filhos`).
- Rotas privadas (Fase 2) ficam dentro de um componente de proteção que verifica a sessão e o perfil. Isso só melhora a experiência: quem protege os dados é a API.
- Cada página define o próprio título com `<title>` no JSX (recurso do React 19).

## Serviços e dados

- `services/api.ts` concentra a configuração do axios (URL base, cookies, CSRF). Os demais arquivos importam dele.
- Um arquivo por recurso (`services/waitlist.ts`), com funções nomeadas pela ação (`createWaitlistEntry`). As funções retornam dados tipados, não a resposta crua do axios.
- `services/` e `types/` não importam nada de React. Assim podem ser reaproveitados pelo app mobile.
- A URL da API vem de `import.meta.env.VITE_API_URL`. Variáveis `VITE_*` são públicas.
- Toda chamada trata três estados na tela: **carregando** (botão desabilitado), **erro** (mensagem clara em português, com os erros `422` por campo) e **sucesso**.

## Estado

- Use `useState` local por padrão. Contexto do React só para dados realmente globais (sessão do usuário, na Fase 2).
- Não adicione bibliotecas de estado, formulário ou validação sem autorização.

## Visual e acessibilidade

Cores, tipografia, espaçamento, tom dos textos e acessibilidade estão em `design.md`.

## Convenções de código

- Imports relativos (não há alias configurado). Use `import type` para importar só tipos.
- O ESLint do projeto é a referência de estilo. Rode `npm run lint` depois de editar arquivos `.ts`/`.tsx`.
