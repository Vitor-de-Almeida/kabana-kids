---
name: novo-servico
description: Conecta o frontend React a um endpoint da API (cliente axios, tipos, função de serviço e estados de carregamento, erro e sucesso na tela). Use ao integrar um formulário ou uma tela com o backend.
---

# Novo serviço de API no frontend

Antes de começar, leia `.claude/rules/frontend.md` e `.claude/rules/api.md`. O endpoint precisa existir e estar testado no backend (skill `novo-endpoint`).

## 1. Cliente base (só na primeira vez)

Se `frontend/src/services/api.ts` não existir, crie-o:

```ts
import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
  headers: { Accept: "application/json" },
  // Sessão por cookie HttpOnly: nenhum token fica acessível ao JavaScript
  withCredentials: true,
  withXSRFToken: true,
})
```

Em desenvolvimento, o Vite precisa encaminhar `/api` para `http://localhost:8000` (opção `server.proxy` em `vite.config.ts`). Se o proxy não existir, proponha a alteração ao usuário antes de fazê-la.

## 2. Tipos

`frontend/src/types/<recurso>.ts`, espelhando o Resource e o schema Zod do backend (campos em `snake_case`):

```ts
export type WaitlistEntryInput = {
  guardian_name: string
  email: string
  phone: string
  child_name: string
  child_birth_date: string
  consent: boolean
}

export type WaitlistEntry = {
  id: string
  status: "pending" | "contacted" | "enrolled"
  created_at: string
}
```

## 3. Função de serviço

`frontend/src/services/<recurso>.ts`, sem nada de React:

```ts
import { api } from "./api"
import type { WaitlistEntry, WaitlistEntryInput } from "../types/waitlist"

export async function createWaitlistEntry(input: WaitlistEntryInput): Promise<WaitlistEntry> {
  const response = await api.post<{ data: WaitlistEntry }>("/waitlist-entries", input)
  return response.data.data
}
```

## 4. Uso no componente

Trate os três estados:

```tsx
const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
```

- **Enviando:** desabilite o botão e mude o texto ("Enviando...").
- **Erro `422`:** mostre `error.response.data.errors[campo][0]` junto ao campo (use `axios.isAxiosError`).
- **Erro `429`:** "Muitas tentativas. Aguarde um minuto e tente de novo."
- **Outros erros:** mensagem genérica em português, sem detalhes técnicos.
- **Sucesso:** confirmação clara para a família.

Nunca registre os dados do formulário com `console.log` nem os salve em `localStorage`.

## 5. Confira

- [ ] `cd frontend && npm run lint && npm run build` sem erros
- [ ] Fluxo testado no navegador com o backend rodando: sucesso, erro de validação e servidor desligado
