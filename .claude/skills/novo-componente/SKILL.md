---
name: novo-componente
description: Cria ou extrai um componente React no frontend seguindo o padrão do projeto. Use ao criar um componente reutilizável (card, botão, seção, formulário) ou ao quebrar um componente grande em partes.
---

# Novo componente React

Antes de começar, leia `.claude/rules/frontend.md` e `.claude/rules/design.md`. Esta skill aplica aquelas regras sem repeti-las.

## 1. Verifique se já existe

Procure em `frontend/src/components/` e na página em que ele vai ser usado. Se já existir algo parecido, reutilize ou estenda.

## 2. Decida onde ele fica

| Situação | Local |
|---|---|
| Pequeno e usado por uma única página | No próprio arquivo da página, acima do componente da página |
| Reutilizável, ou com mais de ~40 linhas | `frontend/src/components/<Nome>.tsx` |

## 3. Escreva seguindo o modelo

```tsx
import type { ReactNode } from "react"

type InfoCardProps = {
  title: string
  children: ReactNode
  highlighted?: boolean
}

export function InfoCard({ title, children, highlighted = false }: InfoCardProps) {
  return (
    <article
      className={`rounded-3xl border bg-white p-8 ${
        highlighted ? "border-lilas-200 shadow-2xl shadow-lilas-100" : "border-ceu-100 shadow-lg shadow-ceu-100/60"
      }`}
    >
      <h3 className="font-display text-2xl font-bold text-tinta">{title}</h3>
      <div className="mt-4 text-tinta-suave">{children}</div>
    </article>
  )
}
```

- Se o componente precisa de dados da API, ele recebe os dados por props (componente visual) ou chama uma função de `services/` (componente de funcionalidade). Para criar o serviço, use a skill `novo-servico`.
- Se você extraiu código de outro arquivo, a aparência e o comportamento precisam continuar idênticos.

## 4. Confira

- [ ] Props tipadas e export nomeado
- [ ] Apenas tokens de cor e fonte do `index.css`
- [ ] Acessibilidade: labels, `alt`, `aria-*`, elementos semânticos
- [ ] Textos em português
- [ ] Nenhum dado pessoal em `console.log` ou `localStorage`
- [ ] `cd frontend && npm run lint && npm run build` sem erros
