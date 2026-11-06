import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
  headers: { Accept: "application/json" },
  // Sessão por cookie HttpOnly: nenhum token fica acessível ao JavaScript
  withCredentials: true,
  withXSRFToken: true,
})
