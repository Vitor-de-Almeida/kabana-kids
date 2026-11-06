import { BrowserRouter, Routes, Route } from "react-router-dom"
import { LandingPage } from "./pages/public/Landing"
import { LoginPage } from "./pages/auth/Login"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
      </Routes>
    </BrowserRouter>       

  )
}
export default App