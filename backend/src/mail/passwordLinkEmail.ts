import type { MailMessage } from "./sendMail.ts"

export type PasswordLinkPurpose = "invite" | "reset"

const SAFETY_TIP = "A Kabana Kids nunca pede a sua senha por e-mail, telefone ou mensagem."

// Sem dados de crianças e sem a senha: só o link de uso único
export function passwordLinkEmail(to: string, purpose: PasswordLinkPurpose, link: string, validFor: string): MailMessage {
  if (purpose === "invite") {
    return {
      to,
      subject: "Crie a sua senha - Kabana Kids",
      text: [
        "Olá!",
        "",
        "Uma conta foi criada para você no painel da Kabana Kids.",
        `Para criar a sua senha, abra o link abaixo em até ${validFor}. Ele só funciona uma vez:`,
        "",
        link,
        "",
        "Se você não esperava este convite, ignore este e-mail e avise a escola.",
        "",
        SAFETY_TIP,
      ].join("\n"),
    }
  }

  return {
    to,
    subject: "Redefinição de senha - Kabana Kids",
    text: [
      "Olá!",
      "",
      "Recebemos um pedido para redefinir a senha da sua conta na Kabana Kids.",
      `Para criar uma senha nova, abra o link abaixo em até ${validFor}. Ele só funciona uma vez:`,
      "",
      link,
      "",
      "Se você não pediu, ignore este e-mail: a sua senha continua a mesma.",
      "",
      SAFETY_TIP,
    ].join("\n"),
  }
}
