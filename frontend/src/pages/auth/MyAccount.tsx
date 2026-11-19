import { ChangePasswordForm } from "../../components/ChangePasswordForm"
import { RecentLogins } from "../../components/RecentLogins"
import { TwoFactorSetupCard } from "../../components/TwoFactorSetupCard"
import { useAuth } from "../../hooks/useAuth"

const aviso = "rounded-2xl bg-lilas-50 p-4 text-sm font-semibold text-lilas-700"

export function MyAccountPage() {
  const { user } = useAuth()
  // Senha temporária: primeiro a senha nova, o resto depois (D41)
  const isTemporary = user?.mustChangePassword === true

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <title>Minha conta | Painel Kabana Kids</title>
      <h1 className="font-display text-3xl font-bold text-tinta">Minha conta</h1>

      {isTemporary && (
        <p role="status" className={aviso}>
          Você entrou com uma senha temporária. Crie a sua senha para continuar.
        </p>
      )}
      {!isTemporary && user?.twoFactorSetupRequired && (
        <p role="status" className={aviso}>
          Para continuar usando o painel, ative a verificação em duas etapas.
        </p>
      )}
      {!isTemporary && <TwoFactorSetupCard />}
      {/* Sempre na mesma posição: o aviso de sucesso não some */}
      <ChangePasswordForm />
      {!isTemporary && <RecentLogins />}
    </div>
  )
}
