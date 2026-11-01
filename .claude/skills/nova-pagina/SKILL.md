---
name: nova-pagina
description: Cria uma nova página (tela) no frontend React e registra a rota. Use ao adicionar uma tela ao site público, ao login, ao portal das famílias ou ao painel da escola.
---

# Nova página

Antes de começar, leia `.claude/rules/frontend.md` e `.claude/rules/design.md`.

## 1. Defina o público e o caminho

| Público | Pasta | Exemplo de URL | Acesso |
|---|---|---|---|
| Visitantes | `pages/public/` | `/politica-de-privacidade` | Livre |
| Login e senha | `pages/auth/` | `/entrar` | Livre |
| Famílias | `pages/parent/` | `/portal/meus-filhos` | Perfil `parent` |
| Escola | `pages/school/` | `/escola/lista-de-espera` | Perfil `admin` ou `teacher` |

Uma página privada precisa de uma API que já negue o acesso indevido. Se o backend ainda não protege esses dados, pare e avise o usuário: a página não pode depender só da proteção do frontend.

## 2. Crie o arquivo

`frontend/src/pages/<público>/<Nome>.tsx`, exportando `<Nome>Page`:

```tsx
import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"

export function PrivacyPolicyPage() {
  return (
    <div className="bg-white">
      <title>Política de Privacidade — Kabana Kids</title>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <h1 className="font-display text-4xl font-bold text-tinta">Política de Privacidade</h1>
      </main>
      <Footer />
    </div>
  )
}
```

- Use um `<main>` por página e um único `<h1>`.
- Seções grandes ou repetidas viram componentes (skill `novo-componente`).

## 3. Registre a rota em `App.tsx`

```tsx
<Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
```

- Rotas privadas (Fase 2) entram dentro do componente de proteção de rota. Se ele ainda não existir, avise o usuário em vez de expor a página.
- Se a página precisar aparecer no menu, atualize os `links` de `Header.tsx`. Hoje os links do menu são âncoras (`#sobre`) da landing; ligar uma rota a eles muda o comportamento do menu, então confirme com o usuário.

## 4. Confira

- [ ] Título da página com `<title>`
- [ ] Funciona em largura de celular e de desktop (`npm run dev`)
- [ ] Nenhum dado pessoal é exibido sem passar por uma API autenticada
- [ ] `cd frontend && npm run lint && npm run build` sem erros
