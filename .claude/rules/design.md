---
paths:
  - "frontend/src/**"
---

# Design e acessibilidade

A identidade visual é a da landing page (`frontend/src/pages/public/Landing.tsx`): leve, acolhedora e infantil sem ser carregada. Toda tela nova segue esse padrão. Na dúvida, copie a solução de uma seção que já existe em vez de inventar outra.

## Tokens (`frontend/src/index.css`)

| Uso | Token |
|---|---|
| Cor principal (azul claro) | `ceu-50` a `ceu-700` |
| Cor de destaque (lilás) | `lilas-50` a `lilas-700` |
| Texto principal | `tinta` |
| Texto secundário | `tinta-suave` |
| Títulos | `font-display` (Baloo 2) |
| Texto corrido | `font-sans` (Nunito) |

- Use **somente** esses tokens. Não use cores hexadecimais nem cores padrão do Tailwind (`blue-500`, `gray-700`) nos componentes.
- Texto nunca é preto puro: use `tinta` ou `tinta-suave`.
- Um token novo é adicionado ao `@theme` de `index.css`, com comentário curto, e só depois usado.

## Padrões visuais em uso

- **Largura das seções:** `mx-auto max-w-6xl px-5 sm:px-8`; textos longos em `max-w-2xl` ou `max-w-3xl`.
- **Ritmo vertical:** seções com `py-20 lg:py-28`, alternando fundo branco e fundos suaves (`bg-ceu-50/70` ou gradientes `from-ceu-50`/`to-lilas-50`).
- **Formas arredondadas:** cards em `rounded-2xl`/`rounded-3xl`; botões e selos em `rounded-full`.
- **Sombras coloridas e suaves:** `shadow-lg shadow-ceu-100/60` ou `shadow-xl shadow-lilas-200`, nunca sombras cinza fortes.
- **Animação:** só a classe `animar-flutuar`, em elementos decorativos. Uma animação nova vai para `index.css` e respeita `prefers-reduced-motion`.
- **Mobile first:** escreva o estilo base para telas pequenas e use `sm:`/`lg:` para ampliar. Confira toda mudança visual em largura de celular e de desktop.
- Classes repetidas no mesmo arquivo vão para uma constante (como `campo` em `WaitlistForm.tsx`). Repetidas entre arquivos, viram componente.

## Textos de interface

- Português do Brasil, com o tom acolhedor da landing: frases curtas, diretas e gentis com as famílias.
- Mensagens de erro dizem o que fazer ("Confira o e-mail informado"), sem termos técnicos.
- Imagens de crianças seguem `seguranca.md` (banco de imagens ou sem identificação).

## Acessibilidade

- Todo campo tem `<label htmlFor>`. Toda imagem tem `alt` descritivo (ou `alt=""` se for decorativa).
- Use elementos semânticos (`header`, `nav`, `main`, `section`, `button` para ações e `a` para navegação).
- Botões só com ícone levam `aria-label`. Menus que abrem e fecham usam `aria-expanded`.
- Animações respeitam `prefers-reduced-motion` (já configurado em `index.css`).
- Garanta contraste suficiente (WCAG AA): sobre fundos claros, texto em `tinta` ou `tinta-suave`. Texto branco só sobre tons `600` ou mais escuros.
