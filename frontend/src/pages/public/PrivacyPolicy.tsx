import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"
import { SCHOOL_INFO } from "../../components/schoolInfo"

const ESCOLA = {
  nome: SCHOOL_INFO.name,
  razaoSocial: SCHOOL_INFO.legalName,
  cnpj: SCHOOL_INFO.cnpj,
  endereco: SCHOOL_INFO.address,
  emailPrivacidade: SCHOOL_INFO.email,
  encarregado: SCHOOL_INFO.dataProtectionOfficers,
  // Depende da escolha da hospedagem (D14)
  localDosServidores: "[a confirmar após escolher a hospedagem]",
}

// Igual a privacyPolicyVersion em backend/src/config.ts.
// Continua rascunho até a revisão do advogado (D46).
const VERSAO = "rascunho"
const ATUALIZADA_EM = "17 de novembro de 2026"

const secoes = [
  {
    titulo: "1. Quem cuida dos seus dados",
    paragrafos: [
      `A ${ESCOLA.nome} (${ESCOLA.razaoSocial}, CNPJ ${ESCOLA.cnpj}), com endereço em ${ESCOLA.endereco}, é a controladora dos dados pessoais tratados neste site.`,
      `Pessoas encarregadas pelo tratamento de dados (LGPD, art. 41): ${ESCOLA.encarregado}. Contato: ${ESCOLA.emailPrivacidade}.`,
    ],
  },
  {
    titulo: "2. Quais dados coletamos",
    paragrafos: [
      "No formulário de matrícula: nome, e-mail e WhatsApp do responsável; nome, data de nascimento e turma de interesse da criança; e uma mensagem opcional. Também registramos a data em que você autorizou o uso dos dados e a versão desta política.",
      "Na área restrita da escola: nome, e-mail e senha da equipe. A senha é guardada de forma embaralhada (hash) e ninguém consegue lê-la.",
      "Registros técnicos: para segurança, cada acesso ao sistema gera um registro com um código da requisição e a data. Esses registros não contêm nome, e-mail, telefone nem dados da criança.",
      "Não pedimos dados de saúde, documentos, fotos, CPF nem endereço neste site. Por favor, não escreva informações de saúde da criança na mensagem.",
    ],
  },
  {
    titulo: "3. Para que usamos",
    paragrafos: [
      "Para entrar em contato sobre a vaga, indicar a turma adequada à idade da criança e organizar as matrículas. Não usamos os dados para publicidade e não os vendemos.",
    ],
  },
  {
    titulo: "4. Base legal e dados de crianças",
    paragrafos: [
      "Os dados do formulário são tratados com o consentimento específico e em destaque de um responsável legal, como exige o art. 14 da LGPD para dados de crianças, sempre no melhor interesse da criança.",
      "Os dados da equipe da escola são tratados para a execução do contrato de trabalho. Os registros de segurança atendem a obrigações legais, como o Marco Civil da Internet (Lei 12.965/2014), e ao legítimo interesse de proteger as famílias.",
    ],
  },
  {
    titulo: "5. Com quem compartilhamos",
    paragrafos: [
      "Os dados ficam em servidores contratados pela escola, que os guardam em nosso nome e não podem usá-los para outros fins. Local dos servidores: " +
        ESCOLA.localDosServidores +
        ".",
      "Também podemos compartilhar dados quando uma lei ou uma ordem judicial exigir. Fora isso, não compartilhamos.",
    ],
  },
  {
    titulo: "6. Por quanto tempo guardamos",
    paragrafos: [
      "Os dados do formulário são guardados por até 5 anos a partir do cadastro. Depois disso, são anonimizados: o nome, o contato e os dados da criança são apagados.",
      "O comprovante da sua autorização (data e versão desta política) e os registros de segurança são guardados por 10 anos, ou mais se uma lei exigir, para permitir a apuração de qualquer incidente.",
    ],
  },
  {
    titulo: "7. Seus direitos",
    paragrafos: [
      "Você pode pedir, a qualquer momento: a confirmação de que tratamos seus dados, o acesso a eles, a correção, a anonimização ou exclusão, a portabilidade, a informação sobre com quem compartilhamos e a revogação da autorização (LGPD, art. 18).",
      `Para isso, escreva para ${ESCOLA.emailPrivacidade}. Respondemos em até 15 dias. Para proteger a família, podemos pedir uma confirmação de que o pedido vem do responsável.`,
      "Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).",
    ],
  },
  {
    titulo: "8. Cookies",
    paragrafos: [
      "O site público não usa cookies de propaganda nem de estatística. A área restrita usa um único cookie essencial, que mantém o login aberto e some ao sair ou fechar o navegador.",
    ],
  },
  {
    titulo: "9. Segurança",
    paragrafos: [
      "Usamos conexão protegida (HTTPS), senhas embaralhadas, acesso restrito à equipe da escola, limite de tentativas e registro de quem acessa os dados das crianças.",
    ],
  },
  {
    titulo: "10. Mudanças nesta política",
    paragrafos: [
      "Se esta política mudar, a nova versão será publicada nesta página, com a data de atualização. Mudanças importantes serão avisadas às famílias.",
    ],
  },
]

export function PrivacyPolicyPage() {
  return (
    <div className="bg-white">
      <title>Política de Privacidade | Kabana Kids</title>
      <Header />

      <main className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
        <h1 className="font-display text-3xl font-bold text-tinta sm:text-4xl">Política de Privacidade</h1>
        <p className="mt-3 text-sm text-tinta-suave">
          Versão {VERSAO} · Atualizada em {ATUALIZADA_EM}
        </p>
        <p className="mt-6 text-tinta-suave">
          Esta política explica, de forma simples, quais dados a {ESCOLA.nome} coleta pelo site, para quê, por quanto
          tempo e como você pode exercer os seus direitos.
        </p>

        {secoes.map((secao) => (
          <section key={secao.titulo} className="mt-10">
            <h2 className="font-display text-xl font-bold text-tinta">{secao.titulo}</h2>
            {secao.paragrafos.map((paragrafo) => (
              <p key={paragrafo} className="mt-3 text-tinta-suave">
                {paragrafo}
              </p>
            ))}
          </section>
        ))}
      </main>

      <Footer />
    </div>
  )
}
