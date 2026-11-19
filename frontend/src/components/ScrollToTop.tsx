import { useEffect } from "react"
import { useLocation, useNavigationType } from "react-router-dom"

// Troca de página não recarrega o site: a rolagem ficaria onde estava
export function ScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    // Voltar ou avançar mantém a posição que o navegador lembra
    if (navigationType !== "POP") {
      window.scrollTo(0, 0)
    }
  }, [pathname, navigationType])

  return null
}
