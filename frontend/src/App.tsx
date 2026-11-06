import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./components/AuthProvider"
import { PanelLayout } from "./components/PanelLayout"
import { RequireAuth } from "./components/RequireAuth"
import { RequireAccountReady } from "./components/RequireAccountReady"
import { LandingPage } from "./pages/public/Landing"
import { PrivacyPolicyPage } from "./pages/public/PrivacyPolicy"
import { LoginPage } from "./pages/auth/Login"
import { MyAccountPage } from "./pages/auth/MyAccount"
import { PanelHomePage } from "./pages/school/PanelHome"
import { TeamPage } from "./pages/school/Team"
import { WaitlistEntriesPage } from "./pages/school/WaitlistEntries"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Áreas com login (D22) */}
          <Route element={<RequireAuth />}>
            <Route path="/painel" element={<PanelLayout />}>
              <Route path="minha-conta" element={<MyAccountPage />} />
              {/* Senha temporária e 2FA pendente: só Minha conta (D41, D42) */}
              <Route element={<RequireAccountReady />}>
                <Route index element={<PanelHomePage />} />
                <Route path="matriculas" element={<WaitlistEntriesPage />} />
                <Route path="equipe" element={<TeamPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
export default App
